export const DEFAULT_SUPER_ADMIN = 'argaikwad24@gmail.com';
const ADMIN_EMAILS_STORAGE_KEY = 'team_tameer_admin_emails_v1';

export function getAuthorizedAdmins(): string[] {
  try {
    const raw = localStorage.getItem(ADMIN_EMAILS_STORAGE_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    const normalized = list.map(e => e.trim().toLowerCase()).filter(Boolean);
    if (!normalized.includes(DEFAULT_SUPER_ADMIN.toLowerCase())) {
      normalized.unshift(DEFAULT_SUPER_ADMIN.toLowerCase());
    }
    return normalized;
  } catch {
    return [DEFAULT_SUPER_ADMIN.toLowerCase()];
  }
}

export function isAuthorizedAdmin(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  const list = getAuthorizedAdmins();
  return list.includes(clean);
}

export function isSuperAdmin(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === DEFAULT_SUPER_ADMIN.toLowerCase();
}

export function addAuthorizedAdmin(email: string): { success: boolean; message: string } {
  const clean = email.trim().toLowerCase();
  if (!clean || !clean.includes('@') || !clean.includes('.')) {
    return { success: false, message: 'Please enter a valid email address.' };
  }
  const list = getAuthorizedAdmins();
  if (list.includes(clean)) {
    return { success: false, message: 'This email is already in the authorized admin list.' };
  }
  list.push(clean);
  localStorage.setItem(ADMIN_EMAILS_STORAGE_KEY, JSON.stringify(list));
  return { success: true, message: `Successfully added ${clean} as an authorized administrator.` };
}

export function removeAuthorizedAdmin(email: string): { success: boolean; message: string } {
  const clean = email.trim().toLowerCase();
  if (clean === DEFAULT_SUPER_ADMIN.toLowerCase()) {
    return { success: false, message: 'The primary Super Admin (argaikwad24@gmail.com) cannot be removed.' };
  }
  let list = getAuthorizedAdmins();
  if (!list.includes(clean)) {
    return { success: false, message: 'Email not found in authorized admin list.' };
  }
  list = list.filter(e => e !== clean);
  localStorage.setItem(ADMIN_EMAILS_STORAGE_KEY, JSON.stringify(list));
  return { success: true, message: `Removed ${clean} from authorized administrators.` };
}
