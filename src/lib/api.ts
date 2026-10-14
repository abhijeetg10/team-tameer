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

  // District: Satara (6 Schools)
  { id: 'ps-sat-01', school_name: 'Husen Kasam Danekari Anglo Urdu Highschool Karad', district: 'Satara', is_active: true, created_at: '2026-09-01T00:00:00Z' },
  { id: 'ps-sat-02', school_name: 'Anjuman Khairul Islam Urdu High School Satara', district: 'Satara', is_active: true, created_at: '2026-09-01T00:00:00Z' },
  { id: 'ps-sat-03', school_name: 'Shaheen High School Karad', district: 'Satara', is_active: true, created_at: '2026-09-01T00:00:00Z' },
  { id: 'ps-sat-04', school_name: 'Satara Urdu Highschool & Junior College Nagthane', district: 'Satara', is_active: true, created_at: '2026-09-01T00:00:00Z' },
  { id: 'ps-sat-05', school_name: 'Haji Abdul Rajjak Urdu Highschool And Junior College Phaltan', district: 'Satara', is_active: true, created_at: '2026-09-01T00:00:00Z' },
  { id: 'ps-sat-06', school_name: 'Madrasa Islamiya Ziya Ul Quran Malkapur', district: 'Satara', is_active: true, created_at: '2026-09-01T00:00:00Z' },
];

const INITIAL_EVENT_SETTINGS: EventSettings = {
  id: 'evt-settings-default',
  event_name: 'Interschool Educational Excellence Championship 2026',
  event_date: 'November 28, 2026',
  registration_open: true,
  registration_deadline: '2026-11-15T23:59:59Z',
  maximum_schools: 34,
  support_email: 'events@educationchampionship.org',
  contact_phone: '+91 (0231) 265-4321 / +91 98220-44550',
  venue: 'Dr. APJ Abdul Kalam Auditorium, South Maharashtra Education Centre',
  rules_summary: [
    'Predefined Institutional Roster: Only the 34 authorized participating schools across Kolhapur, Sangli, and Satara are eligible to register.',
    'Each participating institution must register exactly one mentor and four student delegates.',
    'Identity documents must be verified and uploaded by the authorized principal or mentor.',
    'Strict Aadhaar Privacy: Raw unmasked Aadhaar numbers must not be submitted. Only masked copies or School IDs.',
    'Registration confirmation passes and photo admit cards will be issued upon administrative review.'
  ]
};

// Seed sample registered schools from the 34 participating schools list
const SEED_SCHOOLS: FullSchoolRegistration[] = [
  {
    school: {
      id: 'sch-001',
      registration_id: 'EVT-2026-001',
      participating_school_id: 'ps-san-02',
      school_name: 'Jawahar Urdu High School & Jr College Miraj',
      district: 'Sangli',
      school_code: '27350600102',
      address: 'Station Road, Miraj',
      city: 'Miraj, Sangli',
      principal_name: 'Dr. Mohammed Farooq',
      school_email: 'principal.jawahar@urdueducation.org',
      contact_number: '+91 233 222 3456',
      logo_path: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=150&auto=format&fit=crop&q=80',
      status: 'approved',
      is_representative_verified: true,
      registered_by_user_id: 'usr-school-representative-001',
      submitted_at: '2026-10-01T10:30:00Z',
      created_at: '2026-09-28T09:00:00Z',
      updated_at: '2026-10-02T14:20:00Z'
    },
    mentor: {
      id: 'men-001',
      school_id: 'sch-001',
      full_name: 'Prof. Abdul Rauf Khan',
      phone: '+91 98221 44556',
      email: 'abdul.khan@jawahar.edu',
      designation: 'Senior Lecturer in Physics',
      photo_path: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      id_document_path: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      created_at: '2026-09-28T09:10:00Z'
    },
    students: [
      {
        id: 'stu-001-1',
        school_id: 'sch-001',
        student_number: 1,
        full_name: 'Zaid Shaikh',
        class_name: 'Class 11-Sci',
        photo_path: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
        school_id_document_path: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        identity_document_type: 'school_id',
        identity_document_path: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        created_at: '2026-09-28T09:20:00Z'
      },
      {
        id: 'stu-001-2',
        school_id: 'sch-001',
        student_number: 2,
        full_name: 'Sana Inamdar',
        class_name: 'Class 11-Sci',
        photo_path: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
        school_id_document_path: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        identity_document_type: 'masked_aadhaar',
        identity_document_path: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        created_at: '2026-09-28T09:25:00Z'
      },
      {
        id: 'stu-001-3',
        school_id: 'sch-001',
        student_number: 3,
        full_name: 'Bilal Bagwan',
        class_name: 'Class 12-Sci',
        photo_path: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        school_id_document_path: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        identity_document_type: 'school_id',
        identity_document_path: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        created_at: '2026-09-28T09:30:00Z'
      },
      {
        id: 'stu-001-4',
        school_id: 'sch-001',
        student_number: 4,
        full_name: 'Aafiya Patel',
        class_name: 'Class 12-Sci',
        photo_path: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
        school_id_document_path: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        identity_document_type: 'passport',
        identity_document_path: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        created_at: '2026-09-28T09:35:00Z'
      }
    ],
    reviews: [
      {
        id: 'rev-001',
        school_id: 'sch-001',
        admin_id: 'admin-001',
        admin_name: 'Event Registrar',
        previous_status: 'submitted',
        new_status: 'approved',
        remarks: 'Representative authorization confirmed. All 4 student IDs and mentor credentials in order.',
        created_at: '2026-10-02T14:20:00Z'
      }
    ]
  },
  {
    school: {
      id: 'sch-002',
      registration_id: 'EVT-2026-002',
      participating_school_id: 'ps-kol-04',
      school_name: 'Maulana Azad High School and Jr College Kolhapur',
      district: 'Kolhapur',
      school_code: '27340900201',
      address: 'Dasara Chowk, Kolhapur',
      city: 'Kolhapur',
      principal_name: 'Mr. Rafique Mulla',
      school_email: 'azadcollege.kop@gmail.com',
      contact_number: '+91 231 265 1122',
      logo_path: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&auto=format&fit=crop&q=80',
      status: 'under_review',
      is_representative_verified: true,
      registered_by_user_id: 'usr-school-representative-002',
      submitted_at: '2026-10-04T11:45:00Z',
      created_at: '2026-10-03T15:10:00Z',
      updated_at: '2026-10-04T12:00:00Z'
    },
    mentor: {
      id: 'men-002',
      school_id: 'sch-002',
      full_name: 'Mrs. Shabana Jamadar',
      phone: '+91 98901 33445',
      email: 'shabana.j@azadcollege.org',
      designation: 'Vice Principal & Activity Head',
      photo_path: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      id_document_path: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      created_at: '2026-10-03T15:15:00Z'
    },
    students: [
      {
        id: 'stu-002-1',
        school_id: 'sch-002',
        student_number: 1,
        full_name: 'Amaan Kazi',
        class_name: 'Class 10-A',
        photo_path: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
        school_id_document_path: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        identity_document_type: 'school_id',
        identity_document_path: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        created_at: '2026-10-03T15:20:00Z'
      },
      {
        id: 'stu-002-2',
        school_id: 'sch-002',
        student_number: 2,
        full_name: 'Muskan Pinjari',
        class_name: 'Class 10-B',
        photo_path: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80',
        school_id_document_path: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        identity_document_type: 'school_id',
        identity_document_path: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        created_at: '2026-10-03T15:22:00Z'
      },
      {
        id: 'stu-002-3',
        school_id: 'sch-002',
        student_number: 3,
        full_name: 'Faizan Jamadar',
        class_name: 'Class 11-Sci',
        photo_path: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
        school_id_document_path: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        identity_document_type: 'masked_aadhaar',
        identity_document_path: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        created_at: '2026-10-03T15:25:00Z'
      },
      {
        id: 'stu-002-4',
        school_id: 'sch-002',
        student_number: 4,
        full_name: 'Zoya Mulla',
        class_name: 'Class 11-Sci',
        photo_path: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
        school_id_document_path: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        identity_document_type: 'school_id',
        identity_document_path: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        created_at: '2026-10-03T15:28:00Z'
      }
    ],
    reviews: []
  },
  {
    school: {
      id: 'sch-003',
      registration_id: 'EVT-2026-003',
      participating_school_id: 'ps-sat-03',
      school_name: 'Shaheen High School Karad',
      district: 'Satara',
      school_code: '27310200503',
      address: 'Vidyanagar, Karad',
      city: 'Karad, Satara',
      principal_name: 'Mr. Salim Shaikh',
      school_email: 'shaheenkarad@gmail.com',
      contact_number: '+91 2164 220 789',
      logo_path: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=150&auto=format&fit=crop&q=80',
      status: 'correction_required',
      is_representative_verified: true,
      correction_remarks: 'Student 3 (Danish) School ID card scan is blurry. Please re-upload a clear photograph of his School Identity Card.',
      submitted_at: '2026-10-06T14:10:00Z',
      created_at: '2026-10-05T10:00:00Z',
      updated_at: '2026-10-07T09:30:00Z'
    },
    mentor: {
      id: 'men-003',
      school_id: 'sch-003',
      full_name: 'Mr. Altaf Tamboli',
      phone: '+91 97654 11223',
      email: 'altaf.t@shaheenkarad.org',
      designation: 'PGT Mathematics',
      photo_path: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
      id_document_path: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      created_at: '2026-10-05T10:15:00Z'
    },
    students: [
      {
        id: 'stu-003-1',
        school_id: 'sch-003',
        student_number: 1,
        full_name: 'Sameer Mujawar',
        class_name: 'Class 12-Sci',
        photo_path: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
        school_id_document_path: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        identity_document_type: 'school_id',
        identity_document_path: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        created_at: '2026-10-05T10:20:00Z'
      },
      {
        id: 'stu-003-2',
        school_id: 'sch-003',
        student_number: 2,
        full_name: 'Arshiya Sanadi',
        class_name: 'Class 12-Sci',
        photo_path: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        school_id_document_path: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        identity_document_type: 'school_id',
        identity_document_path: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        created_at: '2026-10-05T10:25:00Z'
      },
      {
        id: 'stu-003-3',
        school_id: 'sch-003',
        student_number: 3,
        full_name: 'Danish Attar',
        class_name: 'Class 11-Sci',
        photo_path: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
        school_id_document_path: '', // Blur issue
        identity_document_type: 'masked_aadhaar',
        identity_document_path: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        created_at: '2026-10-05T10:30:00Z'
      },
      {
        id: 'stu-003-4',
        school_id: 'sch-003',
        student_number: 4,
        full_name: 'Almas Patel',
        class_name: 'Class 11-Sci',
        photo_path: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80',
        school_id_document_path: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        identity_document_type: 'school_id',
        identity_document_path: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        created_at: '2026-10-05T10:35:00Z'
      }
    ],
    reviews: [
      {
        id: 'rev-003',
        school_id: 'sch-003',
        admin_id: 'admin-001',
        admin_name: 'Event Registrar',
        previous_status: 'submitted',
        new_status: 'correction_required',
        remarks: 'Student 3 (Danish) School ID card scan is blurry. Please re-upload a clear photograph of his School Identity Card.',
        created_at: '2026-10-07T09:30:00Z'
      }
    ]
  },
  {
    school: {
      id: 'sch-004',
      registration_id: 'EVT-2026-004',
      participating_school_id: 'ps-kol-02',
      school_name: 'Dr. Zakir Husain Anglo Urdu High School & Jr. College Aajra',
      district: 'Kolhapur',
      school_code: '27340100304',
      address: 'Main Road, Aajra',
      city: 'Aajra, Kolhapur',
      principal_name: 'Dr. A. K. Deshmukh',
      school_email: 'zakirhusainaajra@gmail.com',
      contact_number: '+91 2323 263 218',
      logo_path: 'https://images.unsplash.com/photo-1562774053-701939374585?w=150&auto=format&fit=crop&q=80',
      status: 'submitted',
      is_representative_verified: true,
      registered_by_user_id: 'usr-school-representative-004',
      submitted_at: '2026-10-10T16:00:00Z',
      created_at: '2026-10-10T08:00:00Z',
      updated_at: '2026-10-10T16:00:00Z'
    },
    mentor: {
      id: 'men-004',
      school_id: 'sch-004',
      full_name: 'Mr. Yunus Mulla',
      phone: '+91 94220 55667',
      email: 'yunus.mulla@aajra.edu',
      designation: 'PGT Chemistry',
      photo_path: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
      id_document_path: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      created_at: '2026-10-10T08:15:00Z'
    },
    students: [
      {
        id: 'stu-004-1',
        school_id: 'sch-004',
        student_number: 1,
        full_name: 'Rehan Patel',
        class_name: 'Class 12-Sci',
        photo_path: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        school_id_document_path: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        identity_document_type: 'school_id',
        identity_document_path: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        created_at: '2026-10-10T08:20:00Z'
      },
      {
        id: 'stu-004-2',
        school_id: 'sch-004',
        student_number: 2,
        full_name: 'Rida Sayyad',
        class_name: 'Class 12-Sci',
        photo_path: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
        school_id_document_path: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        identity_document_type: 'masked_aadhaar',
        identity_document_path: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        created_at: '2026-10-10T08:25:00Z'
      },
      {
        id: 'stu-004-3',
        school_id: 'sch-004',
        student_number: 3,
        full_name: 'Farhan Nadaf',
        class_name: 'Class 11-Sci',
        photo_path: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        school_id_document_path: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        identity_document_type: 'school_id',
        identity_document_path: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        created_at: '2026-10-10T08:30:00Z'
      },
      {
        id: 'stu-004-4',
        school_id: 'sch-004',
        student_number: 4,
        full_name: 'Tanzeela Mulla',
        class_name: 'Class 11-Sci',
        photo_path: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
        school_id_document_path: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        identity_document_type: 'school_id',
        identity_document_path: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        created_at: '2026-10-10T08:35:00Z'
      }
    ],
    reviews: []
  }
];

const STORAGE_KEYS = {
  MASTER_SCHOOLS: 'school_event_master_participating_schools_v1',
  SCHOOLS: 'school_event_schools_v2',
  SETTINGS: 'school_event_settings_v1',
  AUDIT_LOGS: 'school_event_audit_v1',
};

// Initialize Storage with Seed Data if empty
function initializeLocalStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.MASTER_SCHOOLS)) {
    localStorage.setItem(STORAGE_KEYS.MASTER_SCHOOLS, JSON.stringify(OFFICIAL_PARTICIPATING_SCHOOLS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SCHOOLS)) {
    localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(SEED_SCHOOLS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_EVENT_SETTINGS));
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
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(seedAuditLogs));
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
    const raw = localStorage.getItem(STORAGE_KEYS.SCHOOLS);
    const schools: FullSchoolRegistration[] = raw ? JSON.parse(raw) : [];

    const existing = schools.find(s => s.school.participating_school_id === participatingSchoolId);
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
   * Get all 34 participating schools merged with their registration status (For Admin Directory)
   */
  async getAllParticipatingSchoolsWithStatus(): Promise<MasterSchoolListItem[]> {
    const masterSchools = await this.getParticipatingSchools();
    const raw = localStorage.getItem(STORAGE_KEYS.SCHOOLS);
    const registrations: FullSchoolRegistration[] = raw ? JSON.parse(raw) : [];

    return masterSchools.map(ps => {
      const reg = registrations.find(r => r.school.participating_school_id === ps.id);
      return {
        participatingSchool: ps,
        registration: reg || null,
        status: reg ? reg.school.status : 'not_registered'
      };
    });
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
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
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
   */
  async saveSchoolDraft(
    userId: string,
    schoolData: Partial<School>,
    mentorData: Partial<Mentor>,
    studentsData: Partial<Student>[]
  ): Promise<FullSchoolRegistration> {
    if (!schoolData.participating_school_id) {
      throw new Error('Please select an official participating school from the list.');
    }

    // Verify master school exists
    const masterSchool = await this.getParticipatingSchoolById(schoolData.participating_school_id);
    if (!masterSchool) {
      throw new Error('Selected school does not exist in the official participating schools directory.');
    }

    const raw = localStorage.getItem(STORAGE_KEYS.SCHOOLS);
    const schools: FullSchoolRegistration[] = raw ? JSON.parse(raw) : [];

    // Check duplicate claim by another user
    const existingOther = schools.find(s => 
      s.school.participating_school_id === schoolData.participating_school_id &&
      s.school.registered_by_user_id && 
      s.school.registered_by_user_id !== userId
    );

    if (existingOther) {
      throw new Error(
        `This school (${masterSchool.school_name}) has already been registered or claimed by another representative. Please contact the administrator.`
      );
    }

    let existingIndex = -1;
    let schoolId = schoolData.id || localStorage.getItem(`user_school_${userId}`);

    if (schoolId) {
      existingIndex = schools.findIndex(s => s.school.id === schoolId);
    } else {
      existingIndex = schools.findIndex(s => s.school.participating_school_id === schoolData.participating_school_id);
    }

    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      // Update existing draft
      const current = schools[existingIndex];
      const updatedSchool: School = {
        ...current.school,
        ...schoolData,
        school_name: masterSchool.school_name, // Strict name preservation
        district: masterSchool.district,
        participating_school_id: masterSchool.id,
        registered_by_user_id: current.school.registered_by_user_id || userId,
        updated_at: now
      };

      const updatedMentor: Mentor = {
        ...current.mentor,
        ...mentorData,
        school_id: updatedSchool.id
      };

      const updatedStudents: Student[] = [1, 2, 3, 4].map(num => {
        const existingStu = current.students.find(s => s.student_number === num);
        const incomingStu = studentsData.find(s => s.student_number === num) || {};
        return {
          id: existingStu?.id || `stu-${updatedSchool.id}-${num}`,
          school_id: updatedSchool.id,
          student_number: num,
          full_name: incomingStu.full_name || existingStu?.full_name || '',
          class_name: incomingStu.class_name || existingStu?.class_name || '',
          photo_path: incomingStu.photo_path || existingStu?.photo_path,
          school_id_document_path: incomingStu.school_id_document_path || existingStu?.school_id_document_path,
          identity_document_type: incomingStu.identity_document_type || existingStu?.identity_document_type || 'school_id',
          identity_document_path: incomingStu.identity_document_path || existingStu?.identity_document_path,
          created_at: existingStu?.created_at || now
        };
      });

      const updatedReg: FullSchoolRegistration = {
        school: updatedSchool,
        mentor: updatedMentor,
        students: updatedStudents,
        reviews: current.reviews || []
      };

      schools[existingIndex] = updatedReg;
      localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(schools));
      localStorage.setItem(`user_school_${userId}`, updatedSchool.id);
      return updatedReg;
    } else {
      // Create new registration for selected master school
      const newSchoolId = `sch-${Date.now()}`;
      const regId = `EVT-2026-${String(schools.length + 1).padStart(3, '0')}`;

      const newSchool: School = {
        id: newSchoolId,
        registration_id: regId,
        participating_school_id: masterSchool.id,
        school_name: masterSchool.school_name,
        district: masterSchool.district,
        school_code: schoolData.school_code || '',
        address: schoolData.address || '',
        city: schoolData.city || masterSchool.district,
        principal_name: schoolData.principal_name || '',
        school_email: schoolData.school_email || '',
        contact_number: schoolData.contact_number || '',
        logo_path: schoolData.logo_path || '',
        status: 'draft',
        registered_by_user_id: userId,
        is_representative_verified: false,
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

      const newStudents: Student[] = [1, 2, 3, 4].map(num => {
        const incoming = studentsData.find(s => s.student_number === num) || {};
        return {
          id: `stu-${newSchoolId}-${num}`,
          school_id: newSchoolId,
          student_number: num,
          full_name: incoming.full_name || '',
          class_name: incoming.class_name || '',
          photo_path: incoming.photo_path || '',
          school_id_document_path: incoming.school_id_document_path || '',
          identity_document_type: incoming.identity_document_type || 'school_id',
          identity_document_path: incoming.identity_document_path || '',
          created_at: now
        };
      });

      const fullReg: FullSchoolRegistration = {
        school: newSchool,
        mentor: newMentor,
        students: newStudents,
        reviews: []
      };

      schools.push(fullReg);
      localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(schools));
      localStorage.setItem(`user_school_${userId}`, newSchoolId);
      return fullReg;
    }
  },

  /**
   * Final Submission of School Registration
   */
  async submitRegistration(schoolId: string, actorEmail: string): Promise<FullSchoolRegistration> {
    const raw = localStorage.getItem(STORAGE_KEYS.SCHOOLS);
    const schools: FullSchoolRegistration[] = raw ? JSON.parse(raw) : [];

    const index = schools.findIndex(s => s.school.id === schoolId);
    if (index === -1) {
      throw new Error('School registration not found.');
    }

    const reg = schools[index];

    // Enforce 1 Mentor presence
    if (!reg.mentor.full_name || !reg.mentor.phone) {
      throw new Error('Incomplete Mentor details. Full name and contact phone are required.');
    }

    // Enforce exactly 4 students with full details
    if (reg.students.length !== 4) {
      throw new Error('Exactly 4 students must be registered.');
    }

    for (const student of reg.students) {
      if (!student.full_name || !student.class_name) {
        throw new Error(`Student ${student.student_number} details are incomplete (Name and Class are required).`);
      }
    }

    // Update status to submitted
    const now = new Date().toISOString();
    reg.school.status = 'submitted';
    reg.school.submitted_at = now;
    reg.school.updated_at = now;
    delete reg.school.correction_remarks;

    schools[index] = reg;
    localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(schools));

    await this.logAudit({
      actor_id: schoolId,
      actor_email: actorEmail,
      action: 'SUBMITTED_REGISTRATION',
      resource_type: 'school',
      resource_id: schoolId,
      details: { registration_id: reg.school.registration_id, school_name: reg.school.school_name }
    });

    return reg;
  },

  /**
   * Fetch All Schools (Administrator View)
   */
  async getAllSchools(): Promise<FullSchoolRegistration[]> {
    const raw = localStorage.getItem(STORAGE_KEYS.SCHOOLS);
    return raw ? JSON.parse(raw) : [];
  },

  /**
   * Fetch Single School by ID (Administrator Detail View)
   */
  async getSchoolById(schoolId: string): Promise<FullSchoolRegistration | null> {
    const schools = await this.getAllSchools();
    return schools.find(s => s.school.id === schoolId) || null;
  },

  /**
   * Fetch Single School by Master Participating School ID
   */
  async getSchoolByParticipatingSchoolId(participatingSchoolId: string): Promise<FullSchoolRegistration | null> {
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
    localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(schools));

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
    localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(schools));

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
          const { data: signedData } = await supabase.storage
            .from(bucket)
            .createSignedUrl(filePath, 3600);

          return {
            path: filePath,
            previewUrl: signedData?.signedUrl || ''
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
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
  },

  /**
   * Get Audit Logs
   */
  async getAuditLogs(): Promise<AuditLog[]> {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return raw ? JSON.parse(raw) : [];
  }
};
