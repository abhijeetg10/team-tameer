import jsPDF from 'jspdf';
import { FullSchoolRegistration } from '../types';

const imageCache = new Map<string, string>();

/**
 * Robustly load and convert any image URL (local or remote) to a base64 Data URL
 */
export const ensureBase64Image = async (src: string | undefined): Promise<string> => {
  if (!src || typeof src !== 'string' || !src.trim()) return '';
  const trimmed = src.trim();
  if (trimmed.startsWith('data:image')) {
    return trimmed;
  }
  if (imageCache.has(trimmed)) {
    return imageCache.get(trimmed)!;
  }

  try {
    const res = await fetch(trimmed);
    if (res.ok) {
      const blob = await res.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string) || '');
        reader.onerror = () => resolve('');
        reader.readAsDataURL(blob);
      });
      if (base64) {
        imageCache.set(trimmed, base64);
        return base64;
      }
    }
  } catch (_) {}

  return new Promise<string>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
          imageCache.set(trimmed, dataUrl);
          resolve(dataUrl);
          return;
        }
      } catch (_) {}
      resolve('');
    };
    img.onerror = () => resolve('');
    img.src = trimmed;
  });
};

/**
 * Safe wrapper for doc.addImage to prevent unhandled format or render errors
 */
const safeAddImage = (
  doc: jsPDF,
  base64: string,
  x: number,
  y: number,
  w: number,
  h: number
): boolean => {
  if (!base64 || !base64.startsWith('data:image')) return false;
  try {
    const format = base64.includes('image/png') ? 'PNG' : 'JPEG';
    doc.addImage(base64, format, x, y, w, h);
    return true;
  } catch (err) {
    console.warn('safeAddImage failed', err);
    return false;
  }
};

export const generateAcknowledgementPDF = async (registration: FullSchoolRegistration): Promise<void> => {
  const { school, mentor, students } = registration;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Load all images in parallel: logo, logo3, logo2 stamp, mentor photo, and 4 student photos
  const [logoData, logo3Data, logo2Stamp, mentorPhotoData, ...studentsPhotosData] = await Promise.all([
    ensureBase64Image('/logo.png'),
    ensureBase64Image('/ROLogo.jpeg').then((res) => res || ensureBase64Image('/logo3.jpeg')),
    ensureBase64Image('/logo2.jpeg'),
    ensureBase64Image(mentor.photo_path),
    ...students.map((s) => ensureBase64Image(s.photo_path)),
  ]);

  // Colors
  const navy = [15, 23, 42]; // #0F172A
  const blue = [37, 99, 235]; // #2563EB
  const slate = [71, 85, 105]; // #475569

  // 1. Header Banner (with logo.png on Left and logo3.jpeg on Right)
  doc.setFillColor(navy[0], navy[1], navy[2]);
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Left Logo: Team Tameer (logo.png)
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(12, 6, 28, 28, 3, 3, 'F');
  safeAddImage(doc, logoData, 13, 7, 26, 26);

  // Right Logo: Event Partner (logo3.jpeg)
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(pageWidth - 40, 6, 28, 28, 3, 3, 'F');
  safeAddImage(doc, logo3Data, pageWidth - 39, 7, 26, 26);

  // Header Title & Conclave Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14.5);
  doc.text('STATE-LEVEL GK QUIZ CONTEST 2026', pageWidth / 2, 15, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(191, 219, 254);
  doc.text('OFFICIAL REGISTRATION ACKNOWLEDGEMENT & DELEGATE PASS', pageWidth / 2, 22, { align: 'center' });

  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Kolhapur • Sangli • Satara Interschool Conclave  |  Team Tameer', pageWidth / 2, 29, { align: 'center' });

  doc.setFontSize(7);
  doc.setTextColor(226, 232, 240);
  doc.text('Authorized Final Delegation Record', pageWidth / 2, 35, { align: 'center' });

  // 2. Registration ID Badge Box
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, 45, pageWidth - 28, 19, 3, 3, 'FD');
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, 45, pageWidth - 28, 19, 3, 3, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(blue[0], blue[1], blue[2]);
  doc.text(`REGISTRATION ID: ${school.registration_id}`, 20, 54);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(slate[0], slate[1], slate[2]);
  const subDate = school.submitted_at
    ? new Date(school.submitted_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : new Date().toLocaleDateString();
  doc.text(`Status: ${school.status.toUpperCase()}  |  Submission Date: ${subDate}`, 20, 60.5);

  // 3. Institution Details Box
  let y = 71;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text('1. INSTITUTION INFORMATION', 14, y);
  y += 3.5;

  doc.setDrawColor(226, 232, 240);
  doc.line(14, y, pageWidth - 14, y);
  y += 5.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(slate[0], slate[1], slate[2]);

  doc.text(`School Name:`, 14, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text(`${school.school_name}`, 44, y);
  y += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(slate[0], slate[1], slate[2]);
  doc.text(`District & Address:`, 14, y);
  doc.text(`${school.district ? `${school.district} District - ` : ''}${school.city || ''} - ${school.address || ''}`, 44, y);
  y += 4.5;

  doc.text(`Principal / Head:`, 14, y);
  doc.text(`${school.principal_name || 'Principal'}`, 44, y);
  doc.text(`UDISE Code:`, 115, y);
  doc.text(`${school.school_code || 'N/A'}`, 140, y);
  y += 4.5;

  doc.text(`Email & Contact:`, 14, y);
  doc.text(`${school.school_email || 'N/A'}  |  ${school.contact_number || 'N/A'}`, 44, y);
  y += 7.5;

  // 4. Mentor Details + Mentor Photo
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text('2. DESIGNATED FACULTY MENTOR (1)', 14, y);
  y += 3.5;
  doc.line(14, y, pageWidth - 14, y);
  y += 5.5;

  // Mentor Photo Box on the Right side of the section
  const mentorPhotoW = 18;
  const mentorPhotoH = 22;
  const mentorPhotoX = pageWidth - 14 - mentorPhotoW; // 178mm
  const mentorPhotoY = y - 2;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(mentorPhotoX, mentorPhotoY, mentorPhotoW, mentorPhotoH, 1.5, 1.5, 'FD');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(mentorPhotoX, mentorPhotoY, mentorPhotoW, mentorPhotoH, 1.5, 1.5, 'D');

  const mentorHasPhoto = safeAddImage(doc, mentorPhotoData, mentorPhotoX + 0.6, mentorPhotoY + 0.6, mentorPhotoW - 1.2, mentorPhotoH - 1.2);
  if (!mentorHasPhoto) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Mentor Photo', mentorPhotoX + mentorPhotoW / 2, mentorPhotoY + mentorPhotoH / 2 + 1, { align: 'center' });
  }

  // Mentor Text Info (Left side)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(slate[0], slate[1], slate[2]);
  doc.text(`Mentor Full Name:`, 14, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text(`${mentor.full_name}`, 44, y);
  y += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(slate[0], slate[1], slate[2]);
  doc.text(`Designation:`, 14, y);
  doc.text(`${mentor.designation || 'Faculty In-Charge'}`, 44, y);
  y += 4.5;

  doc.text(`Mobile Number:`, 14, y);
  doc.text(`${mentor.phone}`, 44, y);
  doc.text(`Official Email:`, 95, y);
  doc.text(`${mentor.email || 'N/A'}`, 120, y);
  y += 10;

  // 5. Four Student Delegates with Photos (3 Mandatory + 1 Optional)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text('3. REGISTERED STUDENT DELEGATES (3 MANDATORY + 1 OPTIONAL)', 14, y);
  y += 3.5;
  doc.line(14, y, pageWidth - 14, y);
  y += 5.5;

  // Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text('SL', 18, y + 4.5);
  doc.text('PHOTO', 28, y + 4.5);
  doc.text('DELEGATE FULL NAME & REG NO', 46, y + 4.5);
  doc.text('CLASS / GRADE', 122, y + 4.5);
  doc.text('DELEGATE STATUS', 156, y + 4.5);
  y += 7.5;

  // Table Rows (Each with student photograph, full name, registration number, class, status)
  students.forEach((stu, index) => {
    const isOptional = index === 3;
    const hasName = Boolean(stu.full_name && stu.full_name.trim());
    const stuPhotoData = studentsPhotosData[index] || '';

    const rowH = 15;
    doc.setFillColor(index % 2 === 0 ? 255 : 249, index % 2 === 0 ? 255 : 250, index % 2 === 0 ? 255 : 252);
    doc.rect(14, y, pageWidth - 28, rowH, 'F');

    // Serial
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(slate[0], slate[1], slate[2]);
    doc.text(`${stu.student_number || index + 1}`, 18, y + 8.5);

    // Student Photo (11mm x 13mm)
    const stuPhotoX = 26;
    const stuPhotoY = y + 1;
    const stuPhotoW = 11;
    const stuPhotoH = 13;

    doc.setFillColor(241, 245, 249);
    doc.roundedRect(stuPhotoX, stuPhotoY, stuPhotoW, stuPhotoH, 1, 1, 'FD');
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(stuPhotoX, stuPhotoY, stuPhotoW, stuPhotoH, 1, 1, 'D');

    const photoRendered = safeAddImage(doc, stuPhotoData, stuPhotoX + 0.4, stuPhotoY + 0.4, stuPhotoW - 0.8, stuPhotoH - 0.8);
    if (!photoRendered) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.5);
      doc.setTextColor(148, 163, 184);
      doc.text(hasName ? 'Photo' : '—', stuPhotoX + stuPhotoW / 2, stuPhotoY + stuPhotoH / 2 + 1, { align: 'center' });
    }

    // Name & Registration Number
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(navy[0], navy[1], navy[2]);
    const displayName = hasName
      ? stu.full_name
      : isOptional
      ? 'Not Nominated (Optional Slot)'
      : 'Pending Nomination';
    doc.text(displayName, 44, y + 5.5);

    // Student Registration Number
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    if (stu.student_registration_number) {
      doc.setTextColor(blue[0], blue[1], blue[2]);
      doc.text(`Reg No: ${stu.student_registration_number}`, 44, y + 10.5);
    } else {
      doc.setTextColor(slate[0], slate[1], slate[2]);
      doc.text(hasName ? 'Reg No: Not Assigned' : '—', 44, y + 10.5);
    }

    // Class / Grade
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(slate[0], slate[1], slate[2]);
    doc.text(hasName ? stu.class_name || 'N/A' : isOptional ? '—' : 'N/A', 122, y + 8.5);

    // Delegate Status
    doc.text(
      hasName
        ? isOptional
          ? 'Optional Delegate'
          : 'Mandatory Delegate'
        : isOptional
        ? 'Optional Slot'
        : 'Pending',
      156,
      y + 8.5
    );

    y += rowH;
  });

  y += 5;

  // 6. Security & Verification Notice
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(14, y, pageWidth - 28, 18, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(blue[0], blue[1], blue[2]);
  doc.text('MANDATORY INSTRUCTIONS FOR EVENT ACCREDITATION:', 18, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(slate[0], slate[1], slate[2]);
  doc.text('1. The team must report at the reception counter on November 28, 2026 by 08:30 AM with this acknowledgement copy.', 18, y + 9.5);
  doc.text('2. All registered students and mentor must carry physical original School ID cards for entry accreditation.', 18, y + 13);
  doc.text('3. In accordance with UIDAI Privacy Guidelines, full Aadhaar copies are strictly prohibited and not retained.', 18, y + 16.5);

  // 7. Footer Stamp / Seal (with logo2 as official stamp)
  y += 28;

  const stampSize = 24; // 24mm x 24mm
  const stampCenterX = (pageWidth - 70 + pageWidth - 14) / 2; // 168mm
  const stampX = stampCenterX - stampSize / 2;
  const stampY = y - stampSize - 2;

  if (logo2Stamp && logo2Stamp.startsWith('data:image')) {
    try {
      // Stamp container
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(stampX - 1.5, stampY - 1.5, stampSize + 3, stampSize + 3, 2, 2, 'FD');
      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(0.5);
      doc.roundedRect(stampX - 1.5, stampY - 1.5, stampSize + 3, stampSize + 3, 2, 2, 'D');

      safeAddImage(doc, logo2Stamp, stampX, stampY, stampSize, stampSize);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(37, 99, 235);
      doc.text('OFFICIAL EVENT STAMP', stampCenterX, stampY - 2.5, { align: 'center' });
    } catch (err) {
      console.warn('Failed to render stamp on PDF', err);
    }
  }

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.2);
  doc.line(14, y, 70, y);
  doc.line(pageWidth - 70, y, pageWidth - 14, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(slate[0], slate[1], slate[2]);
  doc.text('Principal / Authorized Signature & Seal', 14, y + 5);
  doc.text('Organizing Committee Registrar', pageWidth - 65, y + 5);

  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated digitally via State-Level GK Quiz Contest 2026 Portal on ${new Date().toISOString()} • Developer: RECPRO Rehan Chougule`, pageWidth / 2, 287, { align: 'center' });

  // Save PDF
  doc.save(`${school.registration_id}_Acknowledgement.pdf`);
};
