import { isAdminAuthenticated, requireAdmin, isValidAdminToken, setTestAdminToken } from "./admin-auth";

export { isValidAdminToken, setTestAdminToken, requireAdmin };

export interface AuthSession {
  userId?: string;
  role: "CUSTOMER" | "ADMIN";
  isAuthenticated: boolean;
}

/**
 * Validates whether the incoming request or action is authenticated as ADMIN.
 * Strictly uses constant-time token comparison against ADMIN_BOOTSTRAP_SECRET and session cookies.
 */
export async function verifyAdminAccess(): Promise<{ authorized: boolean; error?: string }> {
  const isAuth = await isAdminAuthenticated();
  if (isAuth) {
    return { authorized: true };
  }
  return {
    authorized: false,
    error: "Unauthorized: Admin access required. Please log in with admin credentials.",
  };
}

/**
 * Helper to ensure a caller has admin access; throws if unauthorized.
 */
export async function assertAdmin(): Promise<void> {
  await requireAdmin();
}
