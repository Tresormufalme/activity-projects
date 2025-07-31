import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  query,
} from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Report } from '../models/report.model';
import { Auth } from '@angular/fire/auth';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private reportsCollection: any;

  constructor(private firestore: Firestore, private auth: Auth) {
    this.reportsCollection = collection(this.firestore, 'reports');
  }

  getReports(): Observable<Report[]> {
    const q = query(this.reportsCollection);
    return collectionData(q, { idField: 'id' } as any).pipe(
      map((reports) => reports as Report[])
    );
  }

  getReportById(id: string): Observable<Report | null> {
    const reportDocRef = doc(this.firestore, `reports/${id}`);
    return from(getDoc(reportDocRef)).pipe(
      map((docSnapshot) => {
        if (docSnapshot.exists()) {
          return { id: docSnapshot.id, ...docSnapshot.data() } as Report;
        }
        return null;
      })
    );
  }

  async addReport(report: Report) {
    const user = this.auth.currentUser;
    const reportWithAudit: Report = {
      ...report,
      createdBy: user ? user.uid : 'anonymous',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    try {
      const docRef = await addDoc(this.reportsCollection, reportWithAudit);
      return docRef.id;
    } catch (error) {
      console.error("Erreur lors de l'ajout du rapport:", error);
      throw error;
    }
  }

  // async addReport(report: Omit<Report, 'id'>): Promise<string> {
  //   const user = this.auth.currentUser;
  //   const reportWithAudit: Report = {
  //     ...report,
  //     createdBy: user ? user.uid : 'anonymous',
  //     createdAt: new Date(),
  //     updatedAt: new Date(),
  //   };
  //   try {
  //     const docRef = await addDoc(this.reportsCollection, reportWithAudit);
  //     return docRef.id;
  //   } catch (error) {
  //     console.error("Erreur lors de l'ajout du rapport:", error);
  //     throw error;
  //   }
  // }

  async updateReport(report: Report): Promise<void> {
    if (!report.id) {
      throw new Error("L'ID du rapport est requis pour la mise à jour.");
    }
    const user = this.auth.currentUser;
    const reportDocRef = doc(this.firestore, `reports/${report.id}`);
    const updatedReport = {
      ...report,
      updatedBy: user ? user.uid : 'anonymous',
      updatedAt: new Date(),
    };
    delete updatedReport.id;
    try {
      await updateDoc(reportDocRef, updatedReport);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rapport:', error);
      throw error;
    }
  }

  async deleteReport(id: string): Promise<void> {
    const reportDocRef = doc(this.firestore, `reports/${id}`);
    try {
      await deleteDoc(reportDocRef);
    } catch (error) {
      console.error('Erreur lors de la suppression du rapport:', error);
      throw error;
    }
  }

  async generateReportPdf(
    report: Report,
    filename: string = 'rapport_activite.pdf'
  ): Promise<void> {
    const doc = new jsPDF();

    const imgData = '/assets/logo.jpg';
    doc.addImage(imgData, 'PNG', 10, 10, 20, 20);

    doc.setFontSize(18);
    doc.text("Rapport d'Activité", 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Type d'activité: ${report.typeActivite}`, 10, 40);
    // doc.text(
    // `Date: ${new Date(report.date).toLocaleDateString('fr-FR')}`,
    // 10,
    // 50
    // );
    doc.text(`Lieu: ${report.lieu}`, 10, 60);

    doc.setFontSize(12);
    doc.text('Description:', 10, 75);
    const splitDescription = doc.splitTextToSize(report.description, 180);
    doc.text(splitDescription, 10, 85);

    let yPos = 85 + splitDescription.length * 7;

    const totalParticipants =
      report.participants.hommes +
      report.participants.femmes +
      report.participants.enfants +
      (report.participants.jeunes || 0);

    doc.setFontSize(14);
    doc.text('Participants:', 10, yPos + 10);
    doc.setFontSize(12);
    doc.text(`Total: ${totalParticipants}`, 10, yPos + 20);
    doc.text(`Hommes: ${report.participants.hommes}`, 10, yPos + 30);
    doc.text(`Femmes: ${report.participants.femmes}`, 10, yPos + 40);
    doc.text(`Enfants: ${report.participants.enfants}`, 10, yPos + 50);
    doc.text(`Jeunes: ${report.participants.jeunes || 0}`, 10, yPos + 60);

    doc.setFontSize(12);
    doc.text(`Région: ${report.region}`, 10, yPos + 75);
    doc.text(
      `Catégorie: ${report.category || report.typeActivite}`,
      10,
      yPos + 85
    );

    if (report.createdBy || report.createdAt) {
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(
        `Créé par: ${report.createdBy || 'N/A'}`,
        10,
        doc.internal.pageSize.height - 20
      );
      // doc.text(
      //   `Date de création: ${
      //     report.createdAt
      //       ? new Date(report.createdAt).toLocaleString('fr-FR')
      //       : 'N/A'
      //   }`,
      //   10,
      //   doc.internal.pageSize.height - 15
      // );
    }

    doc.save(filename);
  }

  async generateMultipleReportsPdf(
    reports: Report[],
    filename: string = 'liste_rapports.pdf'
  ): Promise<void> {
    const doc = new jsPDF();
    let yOffset = 10;

    // const imgData = '#';
    // doc.addImage(imgData, 'PNG', 10, yOffset, 20, 20);
    doc.setFontSize(22);
    doc.text("Liste des Rapports d'Activités", 105, yOffset + 10, {
      align: 'center',
    });
    yOffset += 40;

    reports.forEach((report, index) => {
      if (yOffset + 150 > doc.internal.pageSize.height) {
        doc.addPage();
        yOffset = 10;
      }

      doc.setFontSize(16);
      doc.text(
        `Rapport #${index + 1}: ${
          report.typeActivite
        } - ${new Date().toLocaleDateString(
          // report.dat
          'fr-FR'
        )}`,
        10,
        yOffset
      );
      yOffset += 10;

      doc.setFontSize(12);
      doc.text(`Lieu: ${report.lieu}`, 10, yOffset);
      yOffset += 7;

      const totalParticipants =
        report.participants.hommes +
        report.participants.femmes +
        report.participants.enfants +
        (report.participants.jeunes || 0);

      doc.text(
        `Participants: ${totalParticipants} (H:${
          report.participants.hommes
        }, F:${report.participants.femmes}, E:${
          report.participants.enfants
        }, J:${report.participants.jeunes || 0})`,
        10,
        yOffset
      );
      yOffset += 7;

      doc.text(
        `Région: ${report.region}, Catégorie: ${
          report.category || report.typeActivite
        }`,
        10,
        yOffset
      );
      yOffset += 7;

      const splitDescription = doc.splitTextToSize(report.description, 180);
      doc.text('Description:', 10, yOffset);
      yOffset += 7;
      doc.text(splitDescription, 10, yOffset);
      yOffset += splitDescription.length * 7 + 10;

      doc.setDrawColor(200);
      doc.line(10, yOffset, 200, yOffset);
      yOffset += 10;
    });

    doc.save(filename);
  }
}
