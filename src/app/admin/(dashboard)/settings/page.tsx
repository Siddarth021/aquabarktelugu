import { getAdminSettings } from "@/actions/admin";
import { AdminSettingsView } from "@/components/admin/AdminSettingsView";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getAdminSettings();
  return <AdminSettingsView initialSettings={settings} />;
}
