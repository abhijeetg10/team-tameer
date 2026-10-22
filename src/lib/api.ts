import { supabase, isSupabaseConfigured } from './supabase';
import { 
  School, 
  Mentor, 
  Student, 
  RegistrationReview, 
  EventSettings, 
  AuditLog, 
  FullSchoolRegistration,
  UserProfile,
  RegistrationStatus,
  District,
  ParticipatingSchool,
  MasterSchoolListItem
} from '../types';

export const OFFICIAL_PARTICIPATING_SCHOOLS: ParticipatingSchool[] = [
  // District: Kolhapur (16 Schools)
  { id: 'ps-kol-01', school_name: 'Urdu High School Chandgadh', district: 'Kolhapur', is_active: true, created_at: '2026-09-01T00:00:00Z' },
  { id: 'ps-kol-02', school_name: 'Dr. Zakir Husain Anglo Urdu High School & Jr. College Aajra', district: 'Kolhapur', is_active: true, created_at: '2026-09-01T00:00:00Z' },
  { id: 'ps-kol-03', school_name: 'Urdu High School Halkarni', district: 'Kolhapur', is_active: true, created_at: '2026-09-01T00:00:00Z' },
  { id: 'ps-kol-04', school_name: 'Maulana Azad High School and Jr College Kolhapur', district: 'Kolhapur', is_active: true, created_at: '2026-09-01T00:00:00Z' },
  { id: 'ps-kol-05', school_name: 'Nehru High School and Jr. College Kolhapur', district: 'Kolhapur', is_active: true, created_at: '2026-09-01T00:00:00Z' },
  { id: 'ps-kol-06', school_name: 'Urdu Anglo High School Shiroli', district: 'Kolhapur', is_active: true, created_at: '2026-09-01T00:00:00Z' },
  { id: 'ps-kol-07', school_name: 'Urdu High School Vikram Nagar Ichalkaranji', district: 'Kolhapur', is_active: true, created_at: '2026-09-01T00:00:00Z' },
  { id: 'ps-kol-08', school_name: 'National High School & Jr. College Ichalkaranji', district: 'Kolhapur', is_active: true, created_at: '2026-09-01T00:00:00Z' },
  { id: 'ps-kol-09', school_name: 'Urdu High School Rui', district: 'Kolhapur', is_active: true, created_at: '2026-09-01T00:00:00Z' },
  { id: 'ps-kol-10', school_name: 'Urdu High School Rajapur', district: 'Kolhapur', is_active: true, created_at: '2026-09-01T00:00:00Z' },
  { id: 'ps-kol-11', school_name: 'Anglo Urdu High School Aurwad', district: 'Kolhapur', is_active: true, created_at: '2026-09-01T00:00:00Z' },
  { id: 'ps-kol-12', school_name: 'Ishaatul Uloom Urdu High School Alas', district: 'Kolhapur', is_active: true, created_at: '2026-09-01T00:00:00Z' },
  { id: 'ps-kol-13', school_name: 'Dr. Allama Iqbal High School and Jr. College Kurundwad', district: 'Kolhapur', is_active: true, created_at: '2026-09-01T00:00:00Z' },
  { id: 'ps-kol-14', school_name: 'Urdu High School Shirol', district: 'Kolhapur', is_active: true, created_at: '2026-09-01T00:00:00Z' },
  { id: 'ps-kol-15', school_name: 'Anglo Urdu High School and Jr College Jaysingpur', district: 'Kolhapur', is_active: true, created_at: '2026-09-01T00:00:00Z' },
  { id: 'ps-kol-16', school_name: 'Urdu High School and Jr College Rendal', district: 'Kolhapur', is_active: true, created_at: '2026-09-01T00:00:00Z' },

  // District: Sangli (12 Schools)
  { id: 'ps-san-01', school_name: 'Mohammadiya Anglo Urdu School & Jr College Sangli', district: 'Sangli', is_active: true, created_at: '2026-09-01T00:00:00Z' },
  { id: 'ps-san-02', school_name: 'Jawahar Urdu High School & Jr College Miraj', district: 'Sangli', is_active: true, created_at: '2026-09-01T00:00:00Z' },
  { id: 'ps-san-03', school_name: 'Shamnamira Girls High School & Jr College Miraj', district: 'Sangli', is_active: true, created_at: '2026-09-01T00:00:00Z' },
  { id: 'ps-san-04', school_name: 'Anglo Urdu High School Ashta', district: 'Sangli', is_active: true, created_at: '2026-09-01T00:00:00Z' },
  { id: 'ps-san-05', school_name: 'Dr. Zakir Hussain High School Palus', district: 'Sangli', is_active: true, created_at: '2026-09-01T00:00:00Z' },
  { id: 'ps-san-06', school_name: 'Noor Girls High School Sangli', district: 'Sangli', is_active: true, created_at: '2026-09-01T00:00:00Z' },
  { id: 'ps-san-07', school_name: 'Rehmat Anglo Urdu School Vita', district: 'Sangli', is_active: true, created_at: '2026-09-01T00:00:00Z' },
  { id: 'ps-san-08', school_name: 'Anjuman Urdu High School Jath', district: 'Sangli', is_active: true, created_at: '2026-09-01T00:00:00Z' },
  { id: 'ps-san-09', school_name: 'Moulana Abulkalam Nivasi Shala Rampur', district: 'Sangli', is_active: true, created_at: '2026-09-01T00:00:00Z' },
  { id: 'ps-san-10', school_name: 'Hazrat Mohabat Suleman High School Islampur', district: 'Sangli', is_active: true, created_at: '2026-09-01T00:00:00Z' },
  { id: 'ps-san-11', school_name: 'Chand Urdu School Miraj', district: 'Sangli', is_active: true, created_at: '2026-09-01T00:00:00Z' },
  { id: 'ps-san-12', school_name: 'Dr. Salim Urdu High School Miraj', district: 'Sangli', is_active: true, created_at: '2026-09-01T00:00:00Z' },

  // District: Satara (8 Schools)
  { id: 'ps-sat-01', school_name: 'Husen Kasam Danekari Anglo Urdu Highschool Karad', district: 'Satara', is_active: true, created_at: '2026-09-01T00:00:00Z' },
  { id: 'ps-sat-02', school_name: 'Anjuman Khairul Islam Urdu High School Satara', district: 'Satara', is_active: true, created_at: '2026-09-01T00:00:00Z' },
  { id: 'ps-sat-03', school_name: 'Shaheen High School Karad', district: 'Satara', is_active: true, created_at: '2026-09-01T00:00:00Z' },
  { id: 'ps-sat-04', school_name: 'Satara Urdu Highschool & Junior College Nagthane', district: 'Satara', is_active: true, created_at: '2026-09-01T00:00:00Z' },
  { id: 'ps-sat-05', school_name: 'Haji Abdul Rajjak Urdu Highschool And Junior College Phaltan', district: 'Satara', is_active: true, created_at: '2026-09-01T00:00:00Z' },
  { id: 'ps-sat-06', school_name: 'Madrasa Islamiya Ziya Ul Quran Malkapur', district: 'Satara', is_active: true, created_at: '2026-09-01T00:00:00Z' },
  { id: 'ps-sat-07', school_name: 'Tanzeem e Waliden Urdu High School Wai satara', district: 'Satara', is_active: true, created_at: '2026-09-01T00:00:00Z' },
  { id: 'ps-sat-08', school_name: 'ANJUMAN KHAIRUL ISLAM URDU HIGH SCHOOL MAHABALESHWAR', district: 'Satara', is_active: true, created_at: '2026-09-01T00:00:00Z' },
];

const INITIAL_EVENT_SETTINGS: EventSettings = {
  id: 'evt-settings-default',
  event_name: 'State-Level GK Quiz Contest 2026',
  event_date: 'November 28, 2026',
  registration_open: true,
  registration_deadline: '2026-11-15T23:59:59Z',
  maximum_schools: 36,
  support_email: '',
  contact_phone: '',
  venue: '',
  rules_summary: [
    'Predefined Institutional Roster: Authorized participating schools across Kolhapur, Sangli, and Satara are eligible to register.',
    'Each participating institution must register official School UDISE number, exactly one mentor, and exactly 3 student delegates.',
    'Identity documents must be verified and uploaded by the authorized principal or mentor.',
    'Strict Aadhaar Privacy: Raw unmasked Aadhaar numbers must not be submitted. Only masked copies or School IDs.',
    'Registration confirmation passes and photo admit cards will be issued upon administrative review.'
  ]
};

// Clean Seed Data: no mock pre-registered school in Kolhapur
const SEED_SCHOOLS: FullSchoolRegistration[] = [];

const STORAGE_KEYS = {
  MASTER_SCHOOLS: 'school_event_master_participating_schools_live',
  SCHOOLS: 'school_event_schools_live',
  SETTINGS: 'school_event_settings_live',
  AUDIT_LOGS: 'school_event_audit_live',
};

/**
 * Strips heavy base64 data URLs from school, mentor, and student objects
 * so that browser localStorage never stores megabytes of photos/documents.
 */
export function sanitizeForCache(reg: FullSchoolRegistration): FullSchoolRegistration {
  const sanitizePath = (p?: string) => {
    if (!p) return '';
    // If it's a giant base64 data URL, do NOT store in localStorage cache!
    if (p.startsWith('data:')) return '';
    return p;
  };

  return {
    ...reg,
    school: {
      ...reg.school,
      logo_path: sanitizePath(reg.school.logo_path)
    },
    mentor: {
      ...reg.mentor,
      photo_path: sanitizePath(reg.mentor.photo_path),
      id_document_path: sanitizePath(reg.mentor.id_document_path)
    },
    students: (reg.students || []).map(s => ({
      ...s,
      photo_path: sanitizePath(s.photo_path),
      school_id_document_path: sanitizePath(s.school_id_document_path),
      identity_document_path: sanitizePath(s.identity_document_path)
    }))
  };
}

/**
 * Safely writes to localStorage cache without throwing.
 * Guarantees that QuotaExceededError or any storage exception
 * will NEVER break application execution or registration.
 */
export function safeSetCache(key: string, data: any): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  try {
    const raw = typeof data === 'string' ? data : JSON.stringify(data);
    localStorage.setItem(key, raw);
    return true;
  } catch (err) {
    console.warn(`Optional cache write to ${key} failed (quota or storage restriction):`, err);
    // Non-blocking: registration must proceed normally!
    return false;
  }
}

/**
 * Uploads a base64 data URL to Supabase Storage and returns the permanent public URL.
 * Preserves legacy draft attachments before cleaning local storage.
 */
export async function uploadDataUrlToStorage(
  dataUrl: string,
  folder: 'photos' | 'documents',
  baseName: string = 'attachment'
): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:')) {
    return dataUrl;
  }

  if (!isSupabaseConfigured || !supabase) {
    return dataUrl;
  }

  try {
    const isPhoto = folder === 'photos';
    const bucket = isPhoto ? 'school-photos' : 'school-documents';

    // Parse data URL: data:[<mediatype>][;base64],<data>
    const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) return dataUrl;

    const mimeType = match[1];
    const base64Data = match[2];

    const ext = mimeType.split('/')[1]?.replace('jpeg', 'jpg') || (isPhoto ? 'jpg' : 'pdf');
    const fileName = `${folder}/${Date.now()}_${baseName}_${Math.random().toString(36).substring(7)}.${ext}`;

    // Convert base64 to byte array
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, blob, { contentType: mimeType, upsert: true });

    if (uploadError) {
      console.warn('Failed to upload data URL to Supabase storage:', uploadError.message);
      return dataUrl;
    }

    const { data: pubData } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return pubData?.publicUrl || dataUrl;
  } catch (err) {
    console.warn('Error converting data URL to storage:', err);
    return dataUrl;
  }
}

/**
 * Scans a registration for any base64 data URLs in photo/document fields
 * and uploads them to Supabase Storage, replacing the base64 strings with
 * the permanent public storage URLs.
 */
export async function preserveLegacyDraftAttachments(
  reg: FullSchoolRegistration
): Promise<FullSchoolRegistration> {
  const updatedReg: FullSchoolRegistration = JSON.parse(JSON.stringify(reg));

  // School logo
  if (updatedReg.school?.logo_path?.startsWith('data:')) {
    updatedReg.school.logo_path = await uploadDataUrlToStorage(
      updatedReg.school.logo_path,
      'photos',
      'school_logo'
    );
  }

  // Mentor photo
  if (updatedReg.mentor?.photo_path?.startsWith('data:')) {
    updatedReg.mentor.photo_path = await uploadDataUrlToStorage(
      updatedReg.mentor.photo_path,
      'photos',
      'mentor_photo'
    );
  }

  // Mentor ID document
  if (updatedReg.mentor?.id_document_path?.startsWith('data:')) {
    updatedReg.mentor.id_document_path = await uploadDataUrlToStorage(
      updatedReg.mentor.id_document_path,
      'documents',
      'mentor_id_doc'
    );
  }

  // Students photos and documents
  if (updatedReg.students && Array.isArray(updatedReg.students)) {
    for (const stu of updatedReg.students) {
      if (stu.photo_path?.startsWith('data:')) {
        stu.photo_path = await uploadDataUrlToStorage(
          stu.photo_path,
          'photos',
          `student_${stu.student_number}_photo`
        );
      }
      if (stu.school_id_document_path?.startsWith('data:')) {
        stu.school_id_document_path = await uploadDataUrlToStorage(
          stu.school_id_document_path,
          'documents',
          `student_${stu.student_number}_school_id`
        );
      }
      if (stu.identity_document_path?.startsWith('data:')) {
        stu.identity_document_path = await uploadDataUrlToStorage(
          stu.identity_document_path,
          'documents',
          `student_${stu.student_number}_gov_id`
        );
      }
    }
  }

  return updatedReg;
}

/**
 * Verifies affected registrations and cleans legacy storage:
 * - Preserves all draft registrations and text/metadata fields
 * - Cleans away unnecessary bloated base64 photos/documents from legacy cache entries
 * - Never blindly wipes storage
 */
export function preserveDraftsAndCleanCache(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SCHOOLS);
    if (!raw) return;

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return;
    }

    if (!Array.isArray(parsed)) return;

    let hasChanges = false;
    const sanitizedList: FullSchoolRegistration[] = parsed.map((item: any) => {
      if (!item || !item.school) return item;

      // Preserve drafts intact (all fields, status = 'draft')
      // Only sanitize heavy base64 strings if present to rescue quota
      const hasDataUrls = (
        item.school?.logo_path?.startsWith('data:') ||
        item.mentor?.photo_path?.startsWith('data:') ||
        item.mentor?.id_document_path?.startsWith('data:') ||
        item.students?.some((s: any) =>
          s.photo_path?.startsWith('data:') ||
          s.school_id_document_path?.startsWith('data:') ||
          s.identity_document_path?.startsWith('data:')
        )
      );

      if (hasDataUrls) {
        hasChanges = true;
        return sanitizeForCache(item);
      }
      return item;
    });

    if (hasChanges) {
      safeSetCache(STORAGE_KEYS.SCHOOLS, sanitizedList);
    }
  } catch (err) {
    console.warn('Failed while verifying and cleaning cache:', err);
  }
}

/**
 * Map raw database school record (with joined tables) to FullSchoolRegistration
 */
function mapDbSchoolToFullRegistration(s: any): FullSchoolRegistration {
  const mentorRecord: Mentor = (Array.isArray(s.mentors) ? s.mentors[0] : s.mentors) || {
    id: `men-${s.id}`,
    school_id: s.id,
    full_name: '',
    phone: '',
    email: '',
    designation: '',
    photo_path: '',
    id_document_path: '',
    created_at: s.created_at
  };

  const studentsList: Student[] = [1, 2, 3].map(num => {
    const match = (s.students || []).find((st: any) => st.student_number === num);
    return match || {
      id: `stu-${s.id}-${num}`,
      school_id: s.id,
      student_number: num,
      full_name: '',
      class_name: '',
      student_registration_number: '',
      photo_path: '',
      school_id_document_path: '',
      identity_document_type: 'school_id',
      created_at: s.created_at
    };
  });

  return {
    school: {
      id: s.id,
      registration_id: s.registration_id,
      participating_school_id: s.participating_school_id,
      school_name: s.school_name,
      district: s.district,
      school_code: s.school_code,
      address: s.address,
      city: s.city,
      principal_name: s.principal_name,
      principal_phone: s.principal_phone || s.contact_number,
      school_email: s.school_email,
      contact_number: s.contact_number,
      logo_path: s.logo_path,
      status: s.status,
      registered_by_user_id: s.registered_by_user_id,
      is_representative_verified: s.is_representative_verified,
      correction_remarks: s.correction_remarks,
      submitted_at: s.submitted_at,
      created_at: s.created_at,
      updated_at: s.updated_at,
      payment_amount: s.payment_amount,
      payment_transaction_id: s.payment_transaction_id,
      payment_status: s.payment_status,
      payment_method: s.payment_method
    },
    mentor: mentorRecord,
    students: studentsList,
    reviews: s.registration_reviews || []
  };
}

/**
 * Persists school, mentor, and students directly to Supabase PostgreSQL database
 */
async function persistSchoolToDatabase(
  school: School,
  mentor: Mentor,
  students: Student[]
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const isUuid = (val?: string) => val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

    let existingDbSchool: any = null;
    if (isUuid(school.id)) {
      const { data } = await supabase.from('schools').select('id, registration_id').eq('id', school.id).maybeSingle();
      existingDbSchool = data;
    }
    if (!existingDbSchool && school.participating_school_id && isUuid(school.participating_school_id)) {
      const { data } = await supabase.from('schools').select('id, registration_id').eq('participating_school_id', school.participating_school_id).maybeSingle();
      existingDbSchool = data;
    }
    if (!existingDbSchool && school.registration_id) {
      const { data } = await supabase.from('schools').select('id, registration_id').eq('registration_id', school.registration_id).maybeSingle();
      existingDbSchool = data;
    }

    const schoolPayload: any = {
      school_name: school.school_name,
      district: school.district,
      school_code: school.school_code || '',
      address: school.address || '',
      city: school.city || school.district || '',
      principal_name: school.principal_name || '',
      school_email: school.school_email || '',
      contact_number: school.contact_number || school.principal_phone || '',
      status: school.status || 'draft',
      updated_at: new Date().toISOString()
    };
    if (school.submitted_at) {
      schoolPayload.submitted_at = school.submitted_at;
    }
    if (school.logo_path && !school.logo_path.startsWith('data:')) {
      schoolPayload.logo_path = school.logo_path;
    }
    if (isUuid(school.participating_school_id)) {
      schoolPayload.participating_school_id = school.participating_school_id;
    }
    if (isUuid(school.registered_by_user_id)) {
      schoolPayload.registered_by_user_id = school.registered_by_user_id;
    }
    if (school.payment_amount !== undefined) {
      schoolPayload.payment_amount = school.payment_amount;
    }
    if (school.payment_transaction_id) {
      schoolPayload.payment_transaction_id = school.payment_transaction_id;
    }
    if (school.payment_status) {
      schoolPayload.payment_status = school.payment_status;
    }
    if (school.payment_method) {
      schoolPayload.payment_method = school.payment_method;
    }

    let savedSchoolId = existingDbSchool?.id;
    if (existingDbSchool) {
      const { data, error } = await supabase
        .from('schools')
        .update(schoolPayload)
        .eq('id', existingDbSchool.id)
        .select()
        .single();
      if (error) {
        console.warn('Supabase school update warning:', error.message);
        return false;
      }
      savedSchoolId = data?.id || existingDbSchool.id;
    } else {
      if (isUuid(school.id)) {
        schoolPayload.id = school.id;
      }
      schoolPayload.registration_id = school.registration_id;
      const { data, error } = await supabase
        .from('schools')
        .insert(schoolPayload)
        .select()
        .single();
      if (error) {
        console.warn('Supabase school insert warning:', error.message);
        return false;
      }
      savedSchoolId = data?.id;
    }

    if (!savedSchoolId) return false;

    // Link DB UUID back to in-memory object
    school.id = savedSchoolId;

    // Persist Mentor (idempotent: update if exists for school, else insert)
    if (mentor && (mentor.full_name || mentor.phone)) {
      const mentorPayload: any = {
        school_id: savedSchoolId,
        full_name: mentor.full_name || '',
        phone: mentor.phone || '',
        email: mentor.email || '',
        designation: mentor.designation || 'Faculty In-Charge'
      };
      if (mentor.photo_path && !mentor.photo_path.startsWith('data:')) {
        mentorPayload.photo_path = mentor.photo_path;
      }
      if (mentor.id_document_path && !mentor.id_document_path.startsWith('data:')) {
        mentorPayload.id_document_path = mentor.id_document_path;
      }

      const { data: existingMentor } = await supabase.from('mentors').select('id').eq('school_id', savedSchoolId).maybeSingle();
      if (existingMentor) {
        const { error: mErr } = await supabase.from('mentors').update(mentorPayload).eq('school_id', savedSchoolId);
        if (mErr) {
          console.warn('Supabase mentor update warning:', mErr.message);
          return false;
        }
      } else {
        const { error: mErr } = await supabase.from('mentors').insert(mentorPayload);
        if (mErr) {
          console.warn('Supabase mentor insert warning:', mErr.message);
          return false;
        }
      }
    }

    // Persist Students (idempotent: update by school_id and student_number if exists, else insert)
    if (students && students.length > 0) {
      for (const stu of students) {
        if (!stu.full_name && !stu.class_name) continue;
        const stuPayload: any = {
          school_id: savedSchoolId,
          student_number: stu.student_number,
          full_name: stu.full_name || '',
          class_name: stu.class_name || '',
          student_registration_number: stu.student_registration_number || (stu as any).registration_number || '',
          identity_document_type: stu.identity_document_type || 'school_id'
        };
        if (stu.photo_path && !stu.photo_path.startsWith('data:')) {
          stuPayload.photo_path = stu.photo_path;
        }
        if (stu.school_id_document_path && !stu.school_id_document_path.startsWith('data:')) {
          stuPayload.school_id_document_path = stu.school_id_document_path;
        }
        if (stu.identity_document_path && !stu.identity_document_path.startsWith('data:')) {
          stuPayload.identity_document_path = stu.identity_document_path;
        }

        const { data: existingStu } = await supabase
          .from('students')
          .select('id')
          .eq('school_id', savedSchoolId)
          .eq('student_number', stu.student_number)
          .maybeSingle();

        if (existingStu) {
          const { error: sErr } = await supabase.from('students').update(stuPayload).eq('id', existingStu.id);
          if (sErr) {
            console.warn('Supabase student update warning:', sErr.message);
            return false;
          }
        } else {
          const { error: sErr } = await supabase.from('students').insert(stuPayload);
          if (sErr) {
            console.warn('Supabase student insert warning:', sErr.message);
            return false;
          }
        }
      }
    }

    return true;
  } catch (err) {
    console.warn('Supabase persistence encountered error:', err);
    return false;
  }
}

// Initialize Storage with Seed Data if empty or missing new schools
function initializeLocalStorage() {
  if (typeof window === 'undefined' || !window.localStorage) return;

  // Preserve existing drafts and clean up bloated binary cache entries
  preserveDraftsAndCleanCache();

  const existingMasterRaw = localStorage.getItem(STORAGE_KEYS.MASTER_SCHOOLS);
  let masterList: ParticipatingSchool[] = existingMasterRaw ? JSON.parse(existingMasterRaw) : [];
  // Remove any legacy demo institution
  masterList = masterList.filter(m => m.id !== 'ps-demo-01');
  let masterUpdated = false;
  for (const s of OFFICIAL_PARTICIPATING_SCHOOLS) {
    if (!masterList.some(m => m.id === s.id)) {
      masterList.push(s);
      masterUpdated = true;
    }
  }
  safeSetCache(STORAGE_KEYS.MASTER_SCHOOLS, masterList);

  const existingSchoolsRaw = localStorage.getItem(STORAGE_KEYS.SCHOOLS);
  let schoolsList: FullSchoolRegistration[] = existingSchoolsRaw ? JSON.parse(existingSchoolsRaw) : [];
  // Remove any legacy demo registration in Kolhapur
  const cleanedSchools = schoolsList.filter(s => s.school.participating_school_id !== 'ps-demo-01' && s.school.id !== 'sch-demo-01');
  if (cleanedSchools.length !== schoolsList.length || !existingSchoolsRaw) {
    safeSetCache(STORAGE_KEYS.SCHOOLS, cleanedSchools.map(sanitizeForCache));
  }

  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    safeSetCache(STORAGE_KEYS.SETTINGS, INITIAL_EVENT_SETTINGS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
    const seedAuditLogs: AuditLog[] = [
      {
        id: 'aud-001',
        actor_id: 'admin-001',
        actor_email: 'admin@eventportal.org',
        action: 'APPROVED_REGISTRATION',
        resource_type: 'school',
        resource_id: 'sch-001',
        details: { registration_id: 'EVT-2026-001', school: 'Jawahar Urdu High School & Jr College Miraj' },
        timestamp: '2026-10-02T14:20:00Z'
      },
      {
        id: 'aud-002',
        actor_id: 'admin-001',
        actor_email: 'admin@eventportal.org',
        action: 'REQUESTED_CORRECTION',
        resource_type: 'school',
        resource_id: 'sch-003',
        details: { registration_id: 'EVT-2026-003', reason: 'Blurry Student 3 ID scan' },
        timestamp: '2026-10-07T09:30:00Z'
      }
    ];
    safeSetCache(STORAGE_KEYS.AUDIT_LOGS, seedAuditLogs);
  }
}

// Ensure storage is initialized on import
if (typeof window !== 'undefined') {
  initializeLocalStorage();
}

export const api = {
  /**
   * Get all 34 participating schools, optionally filtered by district
   */
  async getParticipatingSchools(district?: District): Promise<ParticipatingSchool[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('participating_schools').select('*').eq('is_active', true);
        if (district) {
          query = query.eq('district', district);
        }
        const { data, error } = await query.order('school_name');
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local master schools', err);
      }
    }
    const raw = localStorage.getItem(STORAGE_KEYS.MASTER_SCHOOLS);
    const all: ParticipatingSchool[] = raw ? JSON.parse(raw) : OFFICIAL_PARTICIPATING_SCHOOLS;
    if (district) {
      return all.filter(s => s.district === district);
    }
    return all;
  },

  /**
   * Get a single participating school by master ID
   */
  async getParticipatingSchoolById(id: string): Promise<ParticipatingSchool | null> {
    const all = await this.getParticipatingSchools();
    return all.find(s => s.id === id) || null;
  },

  /**
   * Check if a participating school has already been claimed or registered
   */
  async checkSchoolClaimStatus(participatingSchoolId: string, currentUserId?: string): Promise<{
    isClaimed: boolean;
    isClaimedByCurrentUser: boolean;
    registrationId?: string;
    status?: RegistrationStatus;
    schoolRecord?: School;
  }> {
    const schools = await this.getAllSchools();

    const existing = schools.find(s => 
      s.school.participating_school_id === participatingSchoolId ||
      (s.school.school_name && participatingSchoolId && 
       s.school.school_name.trim().toLowerCase() === participatingSchoolId.trim().toLowerCase())
    );
    if (!existing) {
      return { isClaimed: false, isClaimedByCurrentUser: false };
    }

    const isMine = currentUserId ? existing.school.registered_by_user_id === currentUserId : false;

    return {
      isClaimed: true,
      isClaimedByCurrentUser: isMine,
      registrationId: existing.school.registration_id,
      status: existing.school.status,
      schoolRecord: existing.school
    };
  },

  /**
   * Get all 36 participating schools merged with their registration status (For Admin Directory)
   */
  async getAllParticipatingSchoolsWithStatus(): Promise<MasterSchoolListItem[]> {
    const masterSchools = await this.getParticipatingSchools();
    const registrations = await this.getAllSchools();

    const matchedRegIds = new Set<string>();

    const items: MasterSchoolListItem[] = masterSchools.map(ps => {
      const psName = (ps.school_name || '').trim().toLowerCase();
      const reg = registrations.find(r => {
        if (!r || !r.school) return false;
        if (r.school.participating_school_id === ps.id) return true;
        const rName = (r.school.school_name || '').trim().toLowerCase();
        return rName === psName || (rName && psName && (rName.includes(psName) || psName.includes(rName)));
      });

      if (reg) {
        matchedRegIds.add(reg.school.id);
        if (reg.school.registration_id) matchedRegIds.add(reg.school.registration_id);
      }

      return {
        participatingSchool: ps,
        registration: reg || null,
        status: reg ? reg.school.status : 'not_registered'
      };
    });

    // Also include any registrations that were submitted but didn't match a master school
    for (const reg of registrations) {
      if (!reg || !reg.school) continue;
      // Filter out test/probe artifacts
      if (reg.school.school_name?.toLowerCase().includes('probe')) continue;
      if (!matchedRegIds.has(reg.school.id) && (!reg.school.registration_id || !matchedRegIds.has(reg.school.registration_id))) {
        items.unshift({
          participatingSchool: {
            id: reg.school.participating_school_id || reg.school.id,
            school_name: reg.school.school_name,
            district: reg.school.district || 'Kolhapur',
            is_active: true,
            created_at: reg.school.created_at || new Date().toISOString()
          },
          registration: reg,
          status: reg.school.status || 'submitted'
        });
      }
    }

    return items;
  },

  /**
   * Get Event Settings
   */
  async getEventSettings(): Promise<EventSettings> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('event_settings').select('*').single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local store', err);
      }
    }
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? JSON.parse(raw) : INITIAL_EVENT_SETTINGS;
  },

  /**
   * Update Event Settings (Admin only)
   */
  async updateEventSettings(settings: Partial<EventSettings>, adminUser: UserProfile): Promise<EventSettings> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('event_settings')
          .update(settings)
          .match({ id: settings.id })
          .select()
          .single();
        if (!error && data) {
          await this.logAudit({
            actor_id: adminUser.id,
            actor_email: adminUser.google_email,
            action: 'UPDATED_EVENT_SETTINGS',
            resource_type: 'event_settings',
            resource_id: data.id,
            details: settings
          });
          return data;
        }
      } catch (err) {
        console.warn('Supabase update failed, using local store', err);
      }
    }
    const current = await this.getEventSettings();
    const updated = { ...current, ...settings };
    safeSetCache(STORAGE_KEYS.SETTINGS, updated);
    await this.logAudit({
      actor_id: adminUser.id,
      actor_email: adminUser.google_email,
      action: 'UPDATED_EVENT_SETTINGS',
      resource_type: 'event_settings',
      resource_id: updated.id,
      details: settings
    });
    return updated;
  },

  /**
   * Get School Registration associated with the logged in user
   */
  async getSchoolForUser(userId: string): Promise<FullSchoolRegistration | null> {
    // 1. Try fetching from Supabase database if live
    if (isSupabaseConfigured && supabase) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
        if (isUuid) {
          const { data: dbSchool, error } = await supabase
            .from('schools')
            .select(`
              *,
              mentors (*),
              students (*),
              registration_reviews (*)
            `)
            .eq('registered_by_user_id', userId)
            .maybeSingle();

          if (!error && dbSchool) {
            return mapDbSchoolToFullRegistration(dbSchool);
          }
        }
      } catch (err) {
        console.warn('Supabase getSchoolForUser query error:', err);
      }
    }

    // 2. Fallback to local storage cache / drafts
    const raw = localStorage.getItem(STORAGE_KEYS.SCHOOLS);
    const schools: FullSchoolRegistration[] = raw ? JSON.parse(raw) : [];

    // Check if user owns a school by user_school_ mapping or registered_by_user_id
    const userSchoolId = localStorage.getItem(`user_school_${userId}`);
    if (userSchoolId) {
      const match = schools.find(s => s.school.id === userSchoolId);
      if (match) return match;
    }

    const found = schools.find(s => s.school.registered_by_user_id === userId);
    return found || null;
  },

  /**
   * Save or Draft School Registration (Enforces master participating school selection)
   * Database persistence is prioritized; optional cache write is non-blocking.
   */
  async saveSchoolDraft(
    userId: string,
    schoolData: Partial<School>,
    mentorData: Partial<Mentor>,
    studentsData: Partial<Student>[]
  ): Promise<FullSchoolRegistration> {
    if (!schoolData.participating_school_id && !schoolData.school_name) {
      throw new Error('Please select an official participating school from the list.');
    }

    // Verify master school exists
    const allMaster = await this.getParticipatingSchools();
    const masterSchool = allMaster.find(s => 
      s.id === schoolData.participating_school_id ||
      (s.school_name && schoolData.school_name && 
       s.school_name.trim().toLowerCase() === schoolData.school_name.trim().toLowerCase())
    );

    const schoolNameFinal = masterSchool ? masterSchool.school_name : (schoolData.school_name || 'Participating Institution');
    const districtFinal = masterSchool ? masterSchool.district : (schoolData.district || 'Kolhapur');
    const partSchoolId = masterSchool ? masterSchool.id : (schoolData.participating_school_id || `ps-${Date.now()}`);

    const raw = localStorage.getItem(STORAGE_KEYS.SCHOOLS);
    const schools: FullSchoolRegistration[] = raw ? JSON.parse(raw) : [];

    let existingIndex = -1;
    let schoolId = schoolData.id || localStorage.getItem(`user_school_${userId}`);

    if (schoolId) {
      existingIndex = schools.findIndex(s => s.school.id === schoolId);
    }
    if (existingIndex < 0) {
      existingIndex = schools.findIndex(s => 
        s.school.participating_school_id === partSchoolId ||
        (s.school.school_name && schoolNameFinal && 
         s.school.school_name.trim().toLowerCase() === schoolNameFinal.trim().toLowerCase())
      );
    }

    const now = new Date().toISOString();
    let updatedReg: FullSchoolRegistration;

    if (existingIndex >= 0) {
      // Update existing record
      const current = schools[existingIndex];
      const updatedSchool: School = {
        ...current.school,
        ...schoolData,
        school_name: schoolNameFinal,
        district: districtFinal,
        participating_school_id: partSchoolId,
        registered_by_user_id: current.school.registered_by_user_id || userId,
        status: schoolData.status || current.school.status || 'draft',
        principal_phone: schoolData.principal_phone || current.school.principal_phone || schoolData.contact_number || '',
        updated_at: now
      };

      const updatedMentor: Mentor = {
        ...current.mentor,
        ...mentorData,
        school_id: updatedSchool.id
      };

      const updatedStudents: Student[] = [1, 2, 3].map(num => {
        const existingStu = current.students?.find(s => s.student_number === num);
        const incomingStu = studentsData.find(s => s.student_number === num) || {};
        return {
          id: existingStu?.id || `stu-${updatedSchool.id}-${num}`,
          school_id: updatedSchool.id,
          student_number: num,
          full_name: incomingStu.full_name || existingStu?.full_name || '',
          class_name: incomingStu.class_name || existingStu?.class_name || '',
          student_registration_number: incomingStu.student_registration_number || existingStu?.student_registration_number || (incomingStu as any).registration_number || (existingStu as any)?.registration_number || '',
          photo_path: incomingStu.photo_path || existingStu?.photo_path,
          school_id_document_path: incomingStu.school_id_document_path || existingStu?.school_id_document_path,
          identity_document_type: incomingStu.identity_document_type || existingStu?.identity_document_type || 'school_id',
          identity_document_path: incomingStu.identity_document_path || existingStu?.identity_document_path,
          created_at: existingStu?.created_at || now
        };
      });

      updatedReg = {
        school: updatedSchool,
        mentor: updatedMentor,
        students: updatedStudents,
        reviews: current.reviews || []
      };

      schools[existingIndex] = updatedReg;
    } else {
      // Create new registration for selected master school
      const newSchoolId = `sch-${Date.now()}`;
      const regId = schoolData.registration_id || `EVT-2026-${String(schools.length + 1).padStart(3, '0')}`;

      const newSchool: School = {
        id: newSchoolId,
        registration_id: regId,
        participating_school_id: partSchoolId,
        school_name: schoolNameFinal,
        district: districtFinal,
        school_code: schoolData.school_code || '',
        address: schoolData.address || '',
        city: schoolData.city || districtFinal,
        principal_name: schoolData.principal_name || '',
        principal_phone: schoolData.principal_phone || schoolData.contact_number || '',
        school_email: schoolData.school_email || '',
        contact_number: schoolData.contact_number || schoolData.principal_phone || '',
        logo_path: schoolData.logo_path || '',
        status: schoolData.status || 'draft',
        registered_by_user_id: userId,
        is_representative_verified: false,
        payment_amount: schoolData.payment_amount ?? 1000,
        payment_transaction_id: schoolData.payment_transaction_id || '',
        payment_status: schoolData.payment_status || 'paid',
        payment_method: schoolData.payment_method || 'UPI (GPay / PhonePe)',
        created_at: now,
        updated_at: now
      };

      const newMentor: Mentor = {
        id: `men-${Date.now()}`,
        school_id: newSchoolId,
        full_name: mentorData.full_name || '',
        phone: mentorData.phone || '',
        email: mentorData.email || '',
        designation: mentorData.designation || '',
        photo_path: mentorData.photo_path || '',
        id_document_path: mentorData.id_document_path || '',
        created_at: now
      };

      const newStudents: Student[] = [1, 2, 3].map(num => {
        const incoming = studentsData.find(s => s.student_number === num) || {};
        return {
          id: `stu-${newSchoolId}-${num}`,
          school_id: newSchoolId,
          student_number: num,
          full_name: incoming.full_name || '',
          class_name: incoming.class_name || '',
          student_registration_number: incoming.student_registration_number || (incoming as any).registration_number || '',
          photo_path: incoming.photo_path || '',
          school_id_document_path: incoming.school_id_document_path || '',
          identity_document_type: incoming.identity_document_type || 'school_id',
          identity_document_path: incoming.identity_document_path || '',
          created_at: now
        };
      });

      updatedReg = {
        school: newSchool,
        mentor: newMentor,
        students: newStudents,
        reviews: []
      };

      schools.push(updatedReg);
    }

    // Attempt database persistence (Supabase)
    await persistSchoolToDatabase(updatedReg.school, updatedReg.mentor, updatedReg.students);

    // Optional cache update - MUST be non-blocking and protected against QuotaExceededError
    try {
      const sanitized = schools.map(sanitizeForCache);
      safeSetCache(STORAGE_KEYS.SCHOOLS, sanitized);
      safeSetCache(`user_school_${userId}`, updatedReg.school.id);
    } catch (cacheErr) {
      console.warn('Optional browser cache write failed (non-critical):', cacheErr);
    }

    return updatedReg;
  },

  /**
   * Final Submission of School Registration
   * Database persistence is prioritized; optional cache write failure cannot interrupt registration.
   */
  async submitRegistration(schoolId: string, actorEmail: string): Promise<FullSchoolRegistration> {
    const schools = await this.getAllSchools();

    const index = schools.findIndex(s => s.school.id === schoolId || s.school.participating_school_id === schoolId);
    if (index === -1) {
      throw new Error('School registration not found.');
    }

    let reg = schools[index];

    // Enforce 1 Mentor presence
    if (!reg.mentor.full_name || !reg.mentor.phone) {
      throw new Error('Incomplete Mentor details. Full name and contact phone are required.');
    }

    // Enforce 3 mandatory students with full details
    if (!reg.students || reg.students.length < 3) {
      throw new Error('All 3 student delegates must be registered.');
    }

    for (let i = 0; i < 3; i++) {
      const student = reg.students[i];
      if (!student || !student.full_name?.trim() || !student.class_name?.trim()) {
        throw new Error(`Student #${i + 1} details are incomplete (Name and Class are required).`);
      }
    }

    // Preserve legacy attachments: convert and upload any remaining data URLs to Supabase Storage
    reg = await preserveLegacyDraftAttachments(reg);

    // Update status to submitted
    const now = new Date().toISOString();
    reg.school.status = 'submitted';
    reg.school.submitted_at = now;
    reg.school.updated_at = now;
    delete reg.school.correction_remarks;

    // Cache update: Always save submitted status locally so it is immediately visible in Admin Page
    try {
      schools[index] = reg;
      const sanitized = schools.map(sanitizeForCache);
      safeSetCache(STORAGE_KEYS.SCHOOLS, sanitized);
    } catch (cacheErr) {
      console.warn('Optional cache update warning:', cacheErr);
    }

    // Persist to Database if Supabase is live
    let dbSuccess = false;
    if (isSupabaseConfigured && supabase) {
      try {
        dbSuccess = await persistSchoolToDatabase(reg.school, reg.mentor, reg.students);
        if (!dbSuccess) {
          console.warn('Supabase DB persistence notice: Remote database insert was not confirmed (RLS policy or network). Registration is safely preserved in local store and attachments are preserved in Storage.');
        }
      } catch (err) {
        console.warn('Supabase DB persistence error:', err);
      }
    }

    // Non-blocking audit log
    try {
      await this.logAudit({
        actor_id: schoolId,
        actor_email: actorEmail,
        action: 'SUBMITTED_REGISTRATION',
        resource_type: 'school',
        resource_id: schoolId,
        details: { registration_id: reg.school.registration_id, school_name: reg.school.school_name, db_persisted: dbSuccess }
      });
    } catch (auditErr) {
      console.warn('Audit log write error (non-critical):', auditErr);
    }

    return reg;
  },

  /**
   * Fetch All Schools (Administrator View)
   * Queries Supabase database first; merges and preserves all local registrations.
   */
  async getAllSchools(): Promise<FullSchoolRegistration[]> {
    let dbSchools: FullSchoolRegistration[] = [];
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: schoolsData, error } = await supabase
          .from('schools')
          .select(`
            *,
            mentors (*),
            students (*),
            registration_reviews (*)
          `)
          .order('created_at', { ascending: false });

        if (!error && schoolsData && schoolsData.length > 0) {
          dbSchools = schoolsData.map(mapDbSchoolToFullRegistration);
        }
      } catch (err) {
        console.warn('Supabase getAllSchools fetch error:', err);
      }
    }

    const raw = localStorage.getItem(STORAGE_KEYS.SCHOOLS);
    const cachedSchools: FullSchoolRegistration[] = raw ? JSON.parse(raw) : [];

    if (dbSchools.length > 0) {
      // Merge: preserve local drafts AND submitted registrations that haven't synced to database yet
      const combined = [...dbSchools];
      for (const cached of cachedSchools) {
        if (!cached || !cached.school) continue;
        const existsInDb = combined.some(
          d => d.school.id === cached.school.id || 
               (cached.school.participating_school_id && d.school.participating_school_id === cached.school.participating_school_id) ||
               (cached.school.school_name && d.school.school_name && cached.school.school_name.trim().toLowerCase() === d.school.school_name.trim().toLowerCase()) ||
               (cached.school.registration_id && d.school.registration_id === cached.school.registration_id)
        );
        if (!existsInDb) {
          combined.push(cached);
        }
      }
      safeSetCache(STORAGE_KEYS.SCHOOLS, combined.map(sanitizeForCache));
      return combined;
    }

    return cachedSchools;
  },

  /**
   * Fetch Single School by ID (Administrator Detail View)
   */
  async getSchoolById(schoolId: string): Promise<FullSchoolRegistration | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: dbSchool, error } = await supabase
          .from('schools')
          .select(`
            *,
            mentors (*),
            students (*),
            registration_reviews (*)
          `)
          .eq('id', schoolId)
          .maybeSingle();
        if (!error && dbSchool) {
          return mapDbSchoolToFullRegistration(dbSchool);
        }
      } catch (err) {
        console.warn('Supabase getSchoolById query error:', err);
      }
    }
    const schools = await this.getAllSchools();
    return schools.find(s => s.school.id === schoolId) || null;
  },

  /**
   * Fetch Single School by Master Participating School ID
   */
  async getSchoolByParticipatingSchoolId(participatingSchoolId: string): Promise<FullSchoolRegistration | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: dbSchool, error } = await supabase
          .from('schools')
          .select(`
            *,
            mentors (*),
            students (*),
            registration_reviews (*)
          `)
          .eq('participating_school_id', participatingSchoolId)
          .maybeSingle();
        if (!error && dbSchool) {
          return mapDbSchoolToFullRegistration(dbSchool);
        }
      } catch (err) {
        console.warn('Supabase getSchoolByParticipatingSchoolId query error:', err);
      }
    }
    const schools = await this.getAllSchools();
    return schools.find(s => s.school.participating_school_id === participatingSchoolId) || null;
  },

  /**
   * Administrator Verify Representative Action
   */
  async verifyRepresentative(schoolId: string, adminUser: UserProfile): Promise<FullSchoolRegistration> {
    const schools = await this.getAllSchools();
    const index = schools.findIndex(s => s.school.id === schoolId);
    if (index === -1) {
      throw new Error('School not found.');
    }

    const reg = schools[index];
    reg.school.is_representative_verified = true;
    reg.school.updated_at = new Date().toISOString();
    schools[index] = reg;
    safeSetCache(STORAGE_KEYS.SCHOOLS, schools.map(sanitizeForCache));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('schools').update({
          is_representative_verified: true,
          updated_at: reg.school.updated_at
        }).eq('id', schoolId);
      } catch (err) {
        console.warn('Supabase verify representative sync error:', err);
      }
    }

    await this.logAudit({
      actor_id: adminUser.id,
      actor_email: adminUser.google_email,
      action: 'VERIFIED_SCHOOL_REPRESENTATIVE',
      resource_type: 'school',
      resource_id: schoolId,
      details: { school_name: reg.school.school_name, registration_id: reg.school.registration_id }
    });

    return reg;
  },

  /**
   * Administrator Review Action: Approve, Reject, or Request Correction
   */
  async reviewSchool(
    schoolId: string,
    adminUser: UserProfile,
    newStatus: RegistrationStatus,
    remarks: string
  ): Promise<FullSchoolRegistration> {
    const schools = await this.getAllSchools();
    const index = schools.findIndex(s => s.school.id === schoolId);
    if (index === -1) {
      throw new Error('School not found.');
    }

    const reg = schools[index];
    const prevStatus = reg.school.status;
    const now = new Date().toISOString();

    reg.school.status = newStatus;
    reg.school.updated_at = now;

    if (newStatus === 'correction_required') {
      reg.school.correction_remarks = remarks;
    } else {
      delete reg.school.correction_remarks;
    }

    const newReview: RegistrationReview = {
      id: `rev-${Date.now()}`,
      school_id: schoolId,
      admin_id: adminUser.id,
      admin_name: adminUser.full_name,
      previous_status: prevStatus,
      new_status: newStatus,
      remarks,
      created_at: now
    };

    if (!reg.reviews) reg.reviews = [];
    reg.reviews.unshift(newReview);

    schools[index] = reg;
    safeSetCache(STORAGE_KEYS.SCHOOLS, schools.map(sanitizeForCache));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('schools').update({
          status: newStatus,
          correction_remarks: newStatus === 'correction_required' ? remarks : null,
          updated_at: now
        }).eq('id', schoolId);

        await supabase.from('registration_reviews').insert({
          school_id: schoolId,
          admin_id: adminUser.id,
          previous_status: prevStatus,
          new_status: newStatus,
          remarks
        });
      } catch (err) {
        console.warn('Supabase review sync error:', err);
      }
    }

    await this.logAudit({
      actor_id: adminUser.id,
      actor_email: adminUser.google_email,
      action: `REVIEW_STATUS_${newStatus.toUpperCase()}`,
      resource_type: 'school',
      resource_id: schoolId,
      details: {
        registration_id: reg.school.registration_id,
        school_name: reg.school.school_name,
        previous_status: prevStatus,
        new_status: newStatus,
        remarks
      }
    });

    return reg;
  },

  /**
   * Secure Upload of Document or Photo
   */
  async uploadFile(file: File, folder: 'photos' | 'documents'): Promise<{ path: string; previewUrl: string }> {
    const isPhoto = folder === 'photos';
    const maxSize = isPhoto ? 5 * 1024 * 1024 : 10 * 1024 * 1024;

    if (file.size > maxSize) {
      throw new Error(`File is too large. Maximum allowed size is ${isPhoto ? '5 MB' : '10 MB'}.`);
    }

    const validExtensions = isPhoto ? ['jpg', 'jpeg', 'png', 'webp'] : ['pdf', 'jpg', 'jpeg', 'png'];
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!fileExt || !validExtensions.includes(fileExt)) {
      throw new Error(`Invalid file type (.${fileExt}). Permitted types: ${validExtensions.join(', ').toUpperCase()}`);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const bucket = isPhoto ? 'school-photos' : 'school-documents';
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, { upsert: false });

        if (!uploadError) {
          const { data: pubData } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

          const publicUrl = pubData?.publicUrl || filePath;
          return {
            path: publicUrl,
            previewUrl: publicUrl
          };
        }
      } catch (err) {
        console.warn('Supabase storage upload failed, falling back to local object URL', err);
      }
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve({
          path: `secure_private/${folder}/${Date.now()}_${file.name}`,
          previewUrl: result
        });
      };
      reader.readAsDataURL(file);
    });
  },

  /**
   * Generate Secure Temporary Signed URL for preview
   */
  async getSecureSignedUrl(path: string, adminUser?: UserProfile): Promise<string> {
    if (!path) return '';

    if (path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://')) {
      if (adminUser) {
        await this.logAudit({
          actor_id: adminUser.id,
          actor_email: adminUser.google_email,
          action: 'VIEWED_DOCUMENT_PREVIEW',
          resource_type: 'document',
          resource_id: path.substring(0, 40),
          details: { path }
        });
      }
      return path;
    }

    if (isSupabaseConfigured && supabase) {
      const bucket = path.includes('photos') ? 'school-photos' : 'school-documents';
      const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 1800);
      return data?.signedUrl || path;
    }

    return path;
  },

  /**
   * Audit Logging
   */
  async logAudit(logData: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    const logs: AuditLog[] = raw ? JSON.parse(raw) : [];
    const newLog: AuditLog = {
      ...logData,
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog);
    if (logs.length > 200) logs.pop();
    safeSetCache(STORAGE_KEYS.AUDIT_LOGS, logs);
  },

  /**
   * Get Audit Logs
   */
  async getAuditLogs(): Promise<AuditLog[]> {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return raw ? JSON.parse(raw) : [];
  },

  /**
   * Admin: Update registration data (school, mentor, and students)
   */
  async updateRegistrationByAdmin(
    schoolIdOrParticipatingId: string,
    updated: {
      school?: Partial<School>;
      mentor?: Partial<Mentor>;
      students?: Partial<Student>[];
      status?: RegistrationStatus;
    },
    adminEmail: string = 'admin@eventportal.org'
  ): Promise<FullSchoolRegistration> {
    const schools = await this.getAllSchools();
    const index = schools.findIndex(
      s => s.school.id === schoolIdOrParticipatingId || 
           s.school.participating_school_id === schoolIdOrParticipatingId ||
           (s.school.school_name && schoolIdOrParticipatingId && 
            s.school.school_name.trim().toLowerCase() === schoolIdOrParticipatingId.trim().toLowerCase())
    );

    if (index === -1) {
      throw new Error('Registration record not found.');
    }

    const current = schools[index];
    const now = new Date().toISOString();

    const updatedSchool: School = {
      ...current.school,
      ...(updated.school || {}),
      status: updated.status || updated.school?.status || current.school.status,
      principal_phone: updated.school?.principal_phone || current.school.principal_phone || updated.school?.contact_number || current.school.contact_number,
      updated_at: now
    };

    const updatedMentor: Mentor = {
      ...current.mentor,
      ...(updated.mentor || {})
    };

    let updatedStudents = current.students || [];
    if (updated.students && updated.students.length > 0) {
      updatedStudents = [1, 2, 3].map(num => {
        const existingStu = current.students?.find(s => s.student_number === num);
        const incomingStu = updated.students?.find(s => s.student_number === num);
        if (!incomingStu) return existingStu || {
          id: `stu-${updatedSchool.id}-${num}`,
          school_id: updatedSchool.id,
          student_number: num,
          full_name: '',
          class_name: '',
          created_at: now
        };
        return {
          id: existingStu?.id || `stu-${updatedSchool.id}-${num}`,
          school_id: updatedSchool.id,
          student_number: num,
          full_name: incomingStu.full_name !== undefined ? incomingStu.full_name : (existingStu?.full_name || ''),
          class_name: incomingStu.class_name !== undefined ? incomingStu.class_name : (existingStu?.class_name || ''),
          student_registration_number: incomingStu.student_registration_number !== undefined ? incomingStu.student_registration_number : (existingStu?.student_registration_number || ''),
          photo_path: incomingStu.photo_path !== undefined ? incomingStu.photo_path : existingStu?.photo_path,
          school_id_document_path: incomingStu.school_id_document_path !== undefined ? incomingStu.school_id_document_path : existingStu?.school_id_document_path,
          identity_document_type: incomingStu.identity_document_type || existingStu?.identity_document_type || 'school_id',
          identity_document_path: incomingStu.identity_document_path !== undefined ? incomingStu.identity_document_path : existingStu?.identity_document_path,
          created_at: existingStu?.created_at || now
        };
      });
    }

    const updatedReg: FullSchoolRegistration = {
      school: updatedSchool,
      mentor: updatedMentor,
      students: updatedStudents,
      reviews: current.reviews || []
    };

    schools[index] = updatedReg;
    safeSetCache(STORAGE_KEYS.SCHOOLS, schools.map(sanitizeForCache));

    // Supabase update if live
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('schools').update({
          school_code: updatedSchool.school_code,
          contact_number: updatedSchool.contact_number,
          school_email: updatedSchool.school_email,
          status: updatedSchool.status,
          updated_at: now
        }).eq('id', updatedSchool.id);

        await supabase.from('mentors').update({
          full_name: updatedMentor.full_name,
          phone: updatedMentor.phone,
          email: updatedMentor.email,
          designation: updatedMentor.designation
        }).eq('school_id', updatedSchool.id);

        for (const stu of updatedStudents) {
          await supabase.from('students').upsert({
            school_id: updatedSchool.id,
            student_number: stu.student_number,
            full_name: stu.full_name,
            class_name: stu.class_name,
            student_registration_number: stu.student_registration_number
          }, { onConflict: 'school_id,student_number' });
        }
      } catch (err) {
        console.warn('Supabase admin update sync error:', err);
      }
    }

    await this.logAudit({
      actor_id: 'admin',
      actor_email: adminEmail,
      action: 'ADMIN_UPDATED_REGISTRATION',
      resource_type: 'school',
      resource_id: updatedSchool.id,
      details: { school_name: updatedSchool.school_name, status: updatedSchool.status }
    });

    return updatedReg;
  },

  /**
   * Admin: Delete registration record (Resets school back to 'not_registered')
   * Verifies affected registration before clearing any storage.
   */
  async deleteRegistrationByAdmin(
    schoolIdOrParticipatingId: string,
    adminEmail: string = 'admin@eventportal.org'
  ): Promise<boolean> {
    const schools = await this.getAllSchools();
    const index = schools.findIndex(
      s => s.school.id === schoolIdOrParticipatingId || 
           s.school.participating_school_id === schoolIdOrParticipatingId ||
           (s.school.school_name && schoolIdOrParticipatingId && 
            s.school.school_name.trim().toLowerCase() === schoolIdOrParticipatingId.trim().toLowerCase())
    );

    if (index === -1) {
      return false;
    }

    const removed = schools[index];
    schools.splice(index, 1);
    safeSetCache(STORAGE_KEYS.SCHOOLS, schools.map(sanitizeForCache));

    // Clear user mapping if present
    if (removed.school.registered_by_user_id) {
      localStorage.removeItem(`user_school_${removed.school.registered_by_user_id}`);
    }

    // Supabase cascade delete if live
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('schools').delete().eq('id', removed.school.id);
      } catch (err) {
        console.warn('Supabase delete error:', err);
      }
    }

    await this.logAudit({
      actor_id: 'admin',
      actor_email: adminEmail,
      action: 'ADMIN_DELETED_REGISTRATION',
      resource_type: 'school',
      resource_id: removed.school.id,
      details: { school_name: removed.school.school_name, registration_id: removed.school.registration_id }
    });

    return true;
  },

  /**
   * Reset local demo database to initial seed.
   * Existing drafts are verified and preserved unless force is explicitly requested.
   */
  resetDemoData(force: boolean = false): void {
    if (!force) {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.SCHOOLS);
        const schools: FullSchoolRegistration[] = raw ? JSON.parse(raw) : [];
        const drafts = schools.filter(s => s.school.status === 'draft');
        localStorage.removeItem(STORAGE_KEYS.MASTER_SCHOOLS);
        localStorage.removeItem(STORAGE_KEYS.SETTINGS);
        localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
        if (drafts.length > 0) {
          safeSetCache(STORAGE_KEYS.SCHOOLS, drafts.map(sanitizeForCache));
        } else {
          localStorage.removeItem(STORAGE_KEYS.SCHOOLS);
        }
        initializeLocalStorage();
        return;
      } catch (e) {
        console.warn('Error during safe reset:', e);
      }
    }
    localStorage.removeItem(STORAGE_KEYS.MASTER_SCHOOLS);
    localStorage.removeItem(STORAGE_KEYS.SCHOOLS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    initializeLocalStorage();
  },

  /**
   * Completely purge each and every registration record from database and local storage.
   */
  async clearAllRegistrationsAndData(): Promise<void> {
    // 1. Supabase Database deletion if live
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('registration_reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('students').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('mentors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('schools').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('audit_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      } catch (err) {
        console.warn('Supabase database purge warning:', err);
      }

      // 2. Clear storage bucket files
      try {
        for (const bucket of ['school-photos', 'school-documents']) {
          for (const folder of ['photos', 'documents']) {
            const { data: files } = await supabase.storage.from(bucket).list(folder, { limit: 1000 });
            if (files && files.length > 0) {
              const filePaths = files.map(f => `${folder}/${f.name}`);
              await supabase.storage.from(bucket).remove(filePaths);
            }
          }
        }
      } catch (storageErr) {
        console.warn('Supabase storage purge warning:', storageErr);
      }
    }

    // 3. Clear all browser local storage cache
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.removeItem(STORAGE_KEYS.SCHOOLS);
        localStorage.removeItem(STORAGE_KEYS.SETTINGS);
        localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
        // Clear user-school mappings
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('user_school_') || key.startsWith('school_event_'))) {
            localStorage.removeItem(key);
          }
        }
      } catch (cacheErr) {
        console.warn('LocalStorage clear warning:', cacheErr);
      }
    }

    initializeLocalStorage();
  },

  /**
   * Diagnostic check for Supabase database connectivity and RLS permissions
   */
  async getDatabaseDiagnostics(): Promise<{
    isConfigured: boolean;
    supabaseUrl: string;
    dbReachable: boolean;
    dbCount: number;
    localCount: number;
    rlsBlocked: boolean;
    errorMessage?: string;
  }> {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.SCHOOLS) : null;
    const localSchools: FullSchoolRegistration[] = raw ? JSON.parse(raw) : [];
    const localSubmittedCount = localSchools.filter(s => s && s.school && s.school.status === 'submitted').length;

    if (!isSupabaseConfigured || !supabase) {
      return {
        isConfigured: false,
        supabaseUrl: '',
        dbReachable: false,
        dbCount: 0,
        localCount: localSubmittedCount,
        rlsBlocked: false,
        errorMessage: 'Supabase URL or Anon key is not configured.'
      };
    }

    try {
      const { data: schoolsData, error: fetchErr } = await supabase
        .from('schools')
        .select('id, school_name, status')
        .neq('school_name', '__probe__');
      
      if (fetchErr) {
        return {
          isConfigured: true,
          supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'https://dfmsrevoyldpwkhsypud.supabase.co',
          dbReachable: false,
          dbCount: 0,
          localCount: localSubmittedCount,
          rlsBlocked: fetchErr.code === '42501',
          errorMessage: fetchErr.message
        };
      }

      const dbSubmittedCount = (schoolsData || []).filter((s: any) => s.status === 'submitted').length;

      return {
        isConfigured: true,
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'https://dfmsrevoyldpwkhsypud.supabase.co',
        dbReachable: true,
        dbCount: dbSubmittedCount,
        localCount: localSubmittedCount,
        rlsBlocked: false
      };
    } catch (err: any) {
      return {
        isConfigured: true,
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'https://dfmsrevoyldpwkhsypud.supabase.co',
        dbReachable: false,
        dbCount: 0,
        localCount: localSubmittedCount,
        rlsBlocked: false,
        errorMessage: err.message || 'Network error connecting to Supabase'
      };
    }
  },

  /**
   * Sync all local registrations to Supabase PostgreSQL database
   */
  async syncLocalRegistrationsToDatabase(): Promise<{
    synced: number;
    failed: number;
    errors: string[];
  }> {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.SCHOOLS) : null;
    const localSchools: FullSchoolRegistration[] = raw ? JSON.parse(raw) : [];
    
    let synced = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const reg of localSchools) {
      if (!reg || !reg.school) continue;
      try {
        const ok = await persistSchoolToDatabase(reg.school, reg.mentor, reg.students);
        if (ok) {
          synced++;
        } else {
          failed++;
          errors.push(`Could not persist "${reg.school.school_name}" to remote DB (Check RLS policy in Supabase)`);
        }
      } catch (e: any) {
        failed++;
        errors.push(e.message || `Error syncing "${reg.school.school_name}"`);
      }
    }

    return { synced, failed, errors };
  }
};


