export const SUPER_ADMIN_EMAILS: string[] = [
  'argaikwad24@gmail.com',
  'rehanchougle2000@gmail.com'
];
export const DEFAULT_SUPER_ADMIN = 'argaikwad24@gmail.com';
const ADMIN_EMAILS_STORAGE_KEY = 'team_tameer_admin_emails_v1';

export function isSuperAdmin(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return SUPER_ADMIN_EMAILS.some(sa => sa.toLowerCase() === clean);
}

export function getAuthorizedAdmins(): string[] {
  try {
    const raw = localStorage.getItem(ADMIN_EMAILS_STORAGE_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    const normalized = list.map(e => e.trim().toLowerCase()).filter(Boolean);
    for (const sa of SUPER_ADMIN_EMAILS) {
      if (!normalized.includes(sa.toLowerCase())) {
        normalized.push(sa.toLowerCase());
      }
    }
    return normalized;
  } catch {
    return SUPER_ADMIN_EMAILS.map(e => e.toLowerCase());
  }
}

export function isAuthorizedAdmin(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  if (isSuperAdmin(clean)) return true;
  const list = getAuthorizedAdmins();
  return list.includes(clean);
}

export function addAuthorizedAdmin(email: string): { success: boolean; message: string } {
  const clean = email.trim().toLowerCase();
  if (!clean || !clean.includes('@') || !clean.includes('.')) {
    return { success: false, message: 'Please enter a valid email address.' };
  }
  if (isSuperAdmin(clean)) {
    return { success: false, message: 'This email is already designated as a Super Administrator.' };
  }
  const list = getAuthorizedAdmins();
  if (list.includes(clean)) {
    return { success: false, message: 'This email is already in the authorized admin list.' };
  }
  list.push(clean);
  localStorage.setItem(ADMIN_EMAILS_STORAGE_KEY, JSON.stringify(list));
  return { success: true, message: `Successfully added ${clean} as an authorized administrator (View-Only).` };
}

export function removeAuthorizedAdmin(email: string): { success: boolean; message: string } {
  const clean = email.trim().toLowerCase();
  if (isSuperAdmin(clean)) {
    return { success: false, message: `Super Administrator (${clean}) cannot be removed.` };
  }
  let list = getAuthorizedAdmins();
  if (!list.includes(clean)) {
    return { success: false, message: 'Email not found in authorized admin list.' };
  }
  list = list.filter(e => e !== clean);
  localStorage.setItem(ADMIN_EMAILS_STORAGE_KEY, JSON.stringify(list));
  return { success: true, message: `Removed ${clean} from authorized administrators.` };
}
