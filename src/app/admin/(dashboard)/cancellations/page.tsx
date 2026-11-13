import { getAdminCancellations } from "@/actions/admin";
import { AdminCancellationsView } from "@/components/admin/AdminCancellationsView";

export const dynamic = "force-dynamic";

export default async function AdminCancellationsPage() {
  const cancellations = await getAdminCancellations();
  return <AdminCancellationsView initialCancellations={cancellations} />;
}
