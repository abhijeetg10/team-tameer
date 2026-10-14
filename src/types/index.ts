export type UserRole = 'school' | 'admin' | 'superadmin';

export type District = 'Kolhapur' | 'Sangli' | 'Satara';

export type RegistrationStatus = 
  | 'not_registered'
  | 'draft' 
  | 'pending_verification'
  | 'submitted' 
  | 'under_review' 
  | 'correction_required' 
  | 'approved' 
  | 'rejected';

export interface UserProfile {
  id: string;
  google_email: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
}

export interface ParticipatingSchool {
  id: string;
  school_name: string;
  district: District;
  is_active: boolean;
  created_at: string;
}

export interface School {
  id: string;
  registration_id: string; // e.g. EVT-2026-001
  participating_school_id?: string;
  school_name: string;
  district?: District;
  school_code?: string; // UDISE ID
  address: string;
  city: string;
  principal_name: string;
  school_email: string;
  contact_number: string;
  logo_path?: string;
  status: RegistrationStatus;
  registered_by_user_id?: string;
  is_representative_verified?: boolean;
  submitted_at?: string;
  created_at: string;
  updated_at: string;
  correction_remarks?: string;
}

export interface SchoolMember {
  id: string;
  school_id: string;
  user_id: string;
  membership_role: 'owner' | 'representative';
  invited_by?: string;
}

export interface Mentor {
  id: string;
  school_id: string;
  full_name: string;
  phone: string;
  email?: string;
  designation?: string;
  photo_path?: string;
  id_document_path?: string;
  created_at: string;
}

export type IdentityDocType = 'school_id' | 'masked_aadhaar' | 'passport' | 'other_id';

export interface Student {
  id: string;
  school_id: string;
  student_number: number; // 1, 2, 3, or 4
  full_name: string;
  class_name: string;
  photo_path?: string;
  school_id_document_path?: string;
  identity_document_type?: IdentityDocType;
  identity_document_path?: string;
  created_at: string;
}

export interface RegistrationReview {
  id: string;
  school_id: string;
  admin_id: string;
  admin_name?: string;
  previous_status: RegistrationStatus;
  new_status: RegistrationStatus;
  remarks: string;
  created_at: string;
}

export interface EventSettings {
  id: string;
  event_name: string;
  event_date: string;
  registration_open: boolean;
  registration_deadline: string;
  maximum_schools: number;
  support_email: string;
  contact_phone: string;
  venue: string;
  rules_summary: string[];
}

export interface AuditLog {
  id: string;
  actor_id: string;
  actor_email: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface FullSchoolRegistration {
  school: School;
  mentor: Mentor;
  students: Student[];
  reviews?: RegistrationReview[];
}

export interface MasterSchoolListItem {
  participatingSchool: ParticipatingSchool;
  registration?: FullSchoolRegistration | null;
  status: RegistrationStatus;
}
