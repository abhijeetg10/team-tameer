import jsPDF from 'jspdf';
import { FullSchoolRegistration } from '../types';

export const generateAcknowledgementPDF = (registration: FullSchoolRegistration) => {
  const { school, mentor, students } = registration;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Colors
  const navy = [15, 23, 42]; // #0F172A
  const blue = [37, 99, 235]; // #2563EB
  const slate = [71, 85, 105]; // #475569
  const lightBg = [248, 250, 252]; // #F8FAFC

  // 1. Header Banner
  doc.setFillColor(navy[0], navy[1], navy[2]);
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('STATE-LEVEL GK QUIZ CONTEST 2026', pageWidth / 2, 16, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(191, 219, 254);
  doc.text('OFFICIAL REGISTRATION ACKNOWLEDGEMENT & DELEGATE PASS', pageWidth / 2, 24, { align: 'center' });

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Kolhapur • Sangli • Satara Interschool Conclave  |  Developed by RECPRO Rehan Chougule', pageWidth / 2, 32, { align: 'center' });

  // 2. Registration ID Badge Box
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, 48, pageWidth - 28, 24, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(blue[0], blue[1], blue[2]);
  doc.text(`REGISTRATION ID: ${school.registration_id}`, 20, 58);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(slate[0], slate[1], slate[2]);
  const subDate = school.submitted_at ? new Date(school.submitted_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : new Date().toLocaleDateString();
  doc.text(`Status: ${school.status.toUpperCase()}  |  Submission Date: ${subDate}`, 20, 66);

  // 3. Institution Details Box
  let y = 80;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text('1. INSTITUTION INFORMATION', 14, y);
  y += 5;

  doc.setDrawColor(226, 232, 240);
  doc.line(14, y, pageWidth - 14, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(slate[0], slate[1], slate[2]);

  doc.text(`School Name:`, 14, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text(`${school.school_name}`, 50, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(slate[0], slate[1], slate[2]);
  doc.text(`District & Address:`, 14, y);
  doc.text(`${school.district ? `${school.district} District - ` : ''}${school.city} - ${school.address}`, 50, y);
  y += 6;

  doc.text(`Principal:`, 14, y);
  doc.text(`${school.principal_name}`, 50, y);
  doc.text(`School Code / UDISE:`, 110, y);
  doc.text(`${school.school_code || 'N/A'}`, 150, y);
  y += 6;

  doc.text(`Email & Contact:`, 14, y);
  doc.text(`${school.school_email}  |  ${school.contact_number}`, 50, y);
  y += 12;

  // 4. Mentor Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text('2. DESIGNATED FACULTY MENTOR (1)', 14, y);
  y += 5;
  doc.line(14, y, pageWidth - 14, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(slate[0], slate[1], slate[2]);
  doc.text(`Mentor Full Name:`, 14, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text(`${mentor.full_name}`, 50, y);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(slate[0], slate[1], slate[2]);
  doc.text(`Designation:`, 110, y);
  doc.text(`${mentor.designation || 'Faculty In-Charge'}`, 140, y);
  y += 6;

  doc.text(`Mobile Number:`, 14, y);
  doc.text(`${mentor.phone}`, 50, y);
  doc.text(`Official Email:`, 110, y);
  doc.text(`${mentor.email || 'N/A'}`, 140, y);
  y += 12;

  // 5. Four Student Delegates Table (3 Mandatory, 4th Optional)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text('3. REGISTERED STUDENT DELEGATES (3 MANDATORY + 1 OPTIONAL)', 14, y);
  y += 5;
  doc.line(14, y, pageWidth - 14, y);
  y += 8;

  // Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text('SL', 18, y + 5);
  doc.text('STUDENT FULL NAME', 32, y + 5);
  doc.text('CLASS / GRADE', 110, y + 5);
  doc.text('DELEGATE STATUS', 150, y + 5);
  y += 9;

  // Table Rows
  students.forEach((stu, index) => {
    doc.setFillColor(index % 2 === 0 ? 255 : 248, index % 2 === 0 ? 255 : 250, index % 2 === 0 ? 255 : 252);
    doc.rect(14, y, pageWidth - 28, 7, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(slate[0], slate[1], slate[2]);
    doc.text(`${stu.student_number || index + 1}`, 18, y + 5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(navy[0], navy[1], navy[2]);
    const isOptional = index === 3;
    const hasName = Boolean(stu.full_name && stu.full_name.trim());
    const displayName = hasName 
      ? (stu.student_registration_number ? `${stu.full_name} (${stu.student_registration_number})` : stu.full_name) 
      : (isOptional ? 'Not Nominated (Optional)' : 'N/A');
    doc.text(displayName, 32, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(slate[0], slate[1], slate[2]);
    doc.text(hasName ? (stu.class_name || 'N/A') : (isOptional ? '—' : 'N/A'), 110, y + 5);
    doc.text(hasName ? (isOptional ? 'Optional Delegate (Record)' : 'Mandatory Delegate') : (isOptional ? 'Optional Slot' : 'Pending'), 150, y + 5);

    y += 7.5;
  });

  y += 10;

  // 6. Security & Verification Notice
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(14, y, pageWidth - 28, 22, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(blue[0], blue[1], blue[2]);
  doc.text('MANDATORY INSTRUCTIONS FOR EVENT ACCREDITATION:', 18, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(slate[0], slate[1], slate[2]);
  doc.text('1. The team must report at the reception counter on November 28, 2026 by 08:30 AM with this acknowledgement copy.', 18, y + 11);
  doc.text('2. All registered students and mentor must carry physical original School ID cards for entry accreditation.', 18, y + 15);
  doc.text('3. In accordance with UIDAI Privacy Guidelines, full Aadhaar copies are strictly prohibited and not retained.', 18, y + 19);

  // 7. Footer Stamp / Seal
  y += 32;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y, 70, y);
  doc.line(pageWidth - 70, y, pageWidth - 14, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(slate[0], slate[1], slate[2]);
  doc.text('Principal / Authorized Signature & Seal', 14, y + 5);
  doc.text('Organizing Committee Registrar', pageWidth - 65, y + 5);

  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated digitally via State-Level GK Quiz Contest 2026 Portal on ${new Date().toISOString()} • Developer: RECPRO Rehan Chougule`, pageWidth / 2, 288, { align: 'center' });

  // Save PDF
  doc.save(`${school.registration_id}_Acknowledgement.pdf`);
};
