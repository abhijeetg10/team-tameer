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

/**
 * Generate official registration PDF using the Team Tameer Registration Template format
 */
export const generateAcknowledgementPDF = async (registration: FullSchoolRegistration): Promise<void> => {
  const { school, mentor, students } = registration;

  // A4 dimensions in PostScript Points: 595.28 pt x 841.89 pt
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: [595.28, 841.89],
  });

  const pageWidth = 595.28;

  // Load all images in parallel: Team Tameer logo, Conclave/Partner logo, RO Softwares logo, mentor photo, and student photos
  const [logoData, partnerLogoData, roLogoData, mentorPhotoData, ...studentsPhotosData] = await Promise.all([
    ensureBase64Image('/logo.png'),
    ensureBase64Image('/logo2.jpeg').then(res => res || ensureBase64Image('/ROLogo.jpeg')),
    ensureBase64Image('/ROLogo.jpeg'),
    ensureBase64Image(mentor.photo_path),
    ...students.map((s) => ensureBase64Image(s.photo_path)),
  ]);

  // Exact ReportLab Template Palette
  const navy = [16, 43, 67];        // #102B43 (.062745 .168627 .262745)
  const teal = [8, 120, 138];       // #08788A (.031373 .470588 .541176)
  const slate = [97, 114, 132];     // #617284 (.380392 .447059 .517647)
  const lineGray = [217, 226, 233];  // #D9E2E9 (.85098 .886275 .913725)
  const bgTeal = [237, 244, 246];   // #EDF4F6 (.929412 .956863 .964706)
  const bgCard = [242, 246, 248];   // #F2F6F8 (.94902 .964706 .972549)
  const avatarBorder = [181, 197, 208]; // #B5C5D0 (.709804 .772549 .815686)
  const badgeMuted = [185, 206, 220]; // #B9CEDC (.72549 .807843 .862745)

  // 1. TOP NAVY ACCENT STRIP (y = 0 to 17pt)
  doc.setFillColor(navy[0], navy[1], navy[2]);
  doc.rect(0, 0, pageWidth, 17, 'F');

  // Top School Info Bar (y ≈ 39pt)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(teal[0], teal[1], teal[2]);
  doc.text('SCHOOL NO.', 30, 39);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  const schoolNoDisplay = school.participating_school_id || school.school_code || '________________';
  doc.text(schoolNoDisplay, 105, 39);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(slate[0], slate[1], slate[2]);
  doc.text('EVENT DATE  28 NOV 2026', 420, 39);

  // 2. HEADER: TEAM TAMEER LOGO + BRAND TITLES + PARTNER LOGO
  // Left: Team Tameer Logo (x=30, y=50, w=78, h=77.5)
  if (logoData) {
    safeAddImage(doc, logoData, 30, 50, 78, 77.5);
  }

  // Right: Event Partner / Conclave Logo (x=445, y=56, w=120, h=54.5)
  if (partnerLogoData) {
    safeAddImage(doc, partnerLogoData, 445, 56, 120, 54.5);
  }

  // Center: Header Titles (x=124)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(23);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text('TEAM TAMEER', 124, 68);

  doc.setFontSize(10);
  doc.setTextColor(teal[0], teal[1], teal[2]);
  doc.text('INTERSCHOOL CONCLAVE 2026', 124, 87);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(slate[0], slate[1], slate[2]);
  doc.text('Kolhapur  |  Sangli  |  Satara', 124, 104);

  // Divider Line (y = 135)
  doc.setDrawColor(lineGray[0], lineGray[1], lineGray[2]);
  doc.setLineWidth(0.6);
  doc.line(30, 135, 565, 135);

  // 3. TITLE & PASS HEADING
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text('OFFICIAL REGISTRATION ACKNOWLEDGEMENT', 30, 153);

  doc.setFontSize(12);
  doc.setTextColor(teal[0], teal[1], teal[2]);
  doc.text('& DELEGATE PASS', 30, 169);

  // 4. REGISTRATION ID & STATUS PILL BAR (y = 182, h = 34, w = 535)
  doc.setFillColor(navy[0], navy[1], navy[2]);
  doc.roundedRect(30, 182, 535, 34, 4, 4, 'F');

  // Sub-badges inside navy bar
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(badgeMuted[0], badgeMuted[1], badgeMuted[2]);
  doc.text('REGISTRATION ID', 41, 196);

  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(school.registration_id || 'REG-2026', 41, 209);

  doc.setFontSize(6.5);
  doc.setTextColor(badgeMuted[0], badgeMuted[1], badgeMuted[2]);
  doc.text('STATUS', 235, 196);

  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(school.status.toUpperCase(), 235, 209);

  doc.setFontSize(6.5);
  doc.setTextColor(badgeMuted[0], badgeMuted[1], badgeMuted[2]);
  doc.text('SUBMISSION DATE', 390, 196);

  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  const subDate = school.submitted_at
    ? new Date(school.submitted_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  doc.text(subDate, 390, 209);

  // 5. SECTION 01: INSTITUTION INFORMATION (y = 220, h = 23)
  doc.setFillColor(bgTeal[0], bgTeal[1], bgTeal[2]);
  doc.roundedRect(30, 220, 535, 23, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(teal[0], teal[1], teal[2]);
  doc.text('01  INSTITUTION INFORMATION', 40, 236);

  // Fields
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(slate[0], slate[1], slate[2]);
  doc.text('School name', 40, 262);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text(school.school_name || 'N/A', 135, 262);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(slate[0], slate[1], slate[2]);
  doc.text('District / Address', 40, 280);

  doc.setFontSize(9);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  const districtAddress = `${school.district ? `${school.district} District / ` : ''}${school.city || ''} ${school.address || '______________________________'}`;
  doc.text(districtAddress, 135, 280);

  doc.setFontSize(7);
  doc.setTextColor(slate[0], slate[1], slate[2]);
  doc.text('Principal', 40, 298);

  doc.setFontSize(9);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text(school.principal_name || '________________________', 135, 298);

  doc.setFontSize(8);
  doc.text(`School Code / UDISE: ${school.school_code || 'N/A'}`, 345, 298);

  doc.setFontSize(7);
  doc.setTextColor(slate[0], slate[1], slate[2]);
  doc.text('Email / Contact', 40, 316);

  doc.setFontSize(9);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text(`${school.school_email || 'N/A'}  |  ${school.contact_number || 'N/A'}`, 135, 316);

  // 6. SECTION 02: DESIGNATED FACULTY MENTOR (y = 326, h = 23)
  doc.setFillColor(bgTeal[0], bgTeal[1], bgTeal[2]);
  doc.roundedRect(30, 326, 535, 23, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(teal[0], teal[1], teal[2]);
  doc.text('02  DESIGNATED FACULTY MENTOR', 40, 342);

  // Mentor Photo Box (x=40, y=361, w=65, h=81)
  doc.setFillColor(bgCard[0], bgCard[1], bgCard[2]);
  doc.roundedRect(40, 361, 65, 81, 4, 4, 'FD');
  doc.setDrawColor(lineGray[0], lineGray[1], lineGray[2]);
  doc.roundedRect(40, 361, 65, 81, 4, 4, 'D');

  const mentorHasPhoto = safeAddImage(doc, mentorPhotoData, 41, 362, 63, 79);
  if (!mentorHasPhoto) {
    // Draw placeholder avatar outline matching Template
    doc.setDrawColor(avatarBorder[0], avatarBorder[1], avatarBorder[2]);
    doc.circle(72.5, 389, 9, 'S');
    doc.line(55.5, 409, 89.5, 409);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(slate[0], slate[1], slate[2]);
    doc.text('MENTOR PHOTO', 47, 432);
  }

  // Mentor Details (x=121)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(slate[0], slate[1], slate[2]);
  doc.text('MENTOR FULL NAME', 121, 375);

  doc.setFontSize(12);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text(mentor.full_name || 'N/A', 121, 392);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Designation: ${mentor.designation || 'In-Charge Faculty'}`, 121, 410);
  doc.text(`Mobile: ${mentor.phone || 'N/A'}`, 121, 428);

  doc.setFontSize(7);
  doc.setTextColor(slate[0], slate[1], slate[2]);
  doc.text('Official email', 310, 392);

  doc.setFontSize(8);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text(mentor.email || 'N/A', 310, 408);
  doc.text('Mentor roll / staff ID: ______________', 310, 428);

  // 7. SECTION 03: STUDENT DELEGATES (y = 448, h = 23)
  doc.setFillColor(bgTeal[0], bgTeal[1], bgTeal[2]);
  doc.roundedRect(30, 448, 535, 23, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(teal[0], teal[1], teal[2]);
  doc.text('03  STUDENT DELEGATES  |  3 MANDATORY + 1 OPTIONAL', 40, 464);

  // 4 Student Cards side by side
  // Card 1: x=30 | Card 2: x=167 | Card 3: x=304 | Card 4: x=441 (Width = 124, Height = 164)
  const cardXCoords = [30, 167, 304, 441];
  const cardW = 124;
  const cardH = 164;
  const cardY = 486;

  students.forEach((stu, index) => {
    const cX = cardXCoords[index];
    const isOptional = index === 3;
    const hasName = Boolean(stu.full_name && stu.full_name.trim());
    const stuPhotoData = studentsPhotosData[index] || '';

    // Card Container
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(cX, cardY, cardW, cardH, 4, 4, 'FD');
    doc.setDrawColor(lineGray[0], lineGray[1], lineGray[2]);
    doc.roundedRect(cX, cardY, cardW, cardH, 4, 4, 'D');

    // Inner Photo Box (x=cX+27, y=497, w=70, h=85)
    const photoX = cX + 27;
    const photoY = cardY + 11;
    const photoW = 70;
    const photoH = 85;

    doc.setFillColor(bgCard[0], bgCard[1], bgCard[2]);
    doc.roundedRect(photoX, photoY, photoW, photoH, 4, 4, 'FD');
    doc.setDrawColor(lineGray[0], lineGray[1], lineGray[2]);
    doc.roundedRect(photoX, photoY, photoW, photoH, 4, 4, 'D');

    const photoDone = safeAddImage(doc, stuPhotoData, photoX + 1, photoY + 1, photoW - 2, photoH - 2);
    if (!photoDone) {
      // Draw Template Avatar placeholder
      doc.setDrawColor(avatarBorder[0], avatarBorder[1], avatarBorder[2]);
      doc.circle(photoX + 35, photoY + 28, 9, 'S');
      doc.line(photoX + 18, photoY + 48, photoX + 52, photoY + 48);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.2);
      doc.setTextColor(slate[0], slate[1], slate[2]);
      doc.text('STUDENT PHOTO', photoX + 7, photoY + 68);
    }

    // Student Info Below Photo
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(navy[0], navy[1], navy[2]);
    const numPrefix = `0${index + 1}  `;
    const sName = hasName ? stu.full_name : isOptional ? 'Not Nominated' : 'Pending';
    doc.text(`${numPrefix}${sName}`, cX + 10, cardY + 112);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const regText = stu.student_registration_number ? `Roll no. ${stu.student_registration_number}` : 'Roll no. —';
    const classText = stu.class_name ? `Class ${stu.class_name}` : 'Class —';
    doc.text(`${regText}  |  ${classText}`, cX + 10, cardY + 129);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(teal[0], teal[1], teal[2]);
    doc.text(isOptional ? 'Optional delegate' : 'Mandatory delegate', cX + 10, cardY + 147);
  });

  // 8. MANDATORY EVENT ACCREDITATION INSTRUCTIONS (y = 667)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(teal[0], teal[1], teal[2]);
  doc.text('MANDATORY EVENT ACCREDITATION INSTRUCTIONS', 30, 667);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text('1. Report at reception on 28 November 2026 by 08:30 AM with this acknowledgement.', 30, 682);
  doc.text('2. All students and the mentor must carry their original physical School ID cards.', 30, 695);
  doc.text('3. Do not submit full Aadhaar copies; the registration process does not retain them.', 30, 708);

  // Divider Line before Signatures (y = 723)
  doc.setDrawColor(lineGray[0], lineGray[1], lineGray[2]);
  doc.setLineWidth(0.6);
  doc.line(30, 723, 565, 723);

  // 9. SIGNATURES & SOFTWARE PARTNER BLOCK
  // Signature 1: Principal (x=36 to 205, y=778)
  doc.line(36, 778, 205, 778);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text('Principal / Authorized Signature & Seal', 37, 791);

  // Signature 2: Organizing Committee Registrar (x=235 to 386, y=778)
  doc.line(235, 778, 386, 778);
  doc.text('Organizing Committee Registrar', 239, 791);

  // Stamp: Event Partner / Conclave Seal right above Registrar line
  if (partnerLogoData) {
    safeAddImage(doc, partnerLogoData, 285, 740, 50, 35);
  }

  // Software Partner Card on Right (x=421 to 565, y=730, w=144, h=68)
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(421, 730, 144, 68, 5, 5, 'FD');
  doc.setDrawColor(lineGray[0], lineGray[1], lineGray[2]);
  doc.roundedRect(421, 730, 144, 68, 5, 5, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(teal[0], teal[1], teal[2]);
  doc.text('SOFTWARE PARTNER', 449, 741);

  // Software Partner Logo: ROLogo.jpeg (x=474, y=747, w=38, h=34)
  if (roLogoData) {
    safeAddImage(doc, roLogoData, 474, 747, 37.7, 34);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text('RO SOFTWARES', 444, 791);

  // 10. VERY BOTTOM CREDITS (y = 816)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(slate[0], slate[1], slate[2]);
  doc.text('Developed by RECPRO Rehan Chougule', 30, 816);
  doc.text('OFFICIAL REGISTRATION PASS  |  STATE-LEVEL GK QUIZ 2026', 342, 816);

  // Trigger Save / Download
  doc.save(`${school.registration_id || 'REG'}_Acknowledgement.pdf`);
};
