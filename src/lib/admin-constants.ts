export const ADMIN_COOKIE_NAME = "aquabark_admin_token";
export const DEFAULT_ADMIN_SECRET = process.env.ADMIN_BOOTSTRAP_SECRET || (process.env.NODE_ENV === "production" ? "" : "dev-admin-bootstrap-token");
