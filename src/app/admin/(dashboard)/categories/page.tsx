import { getAdminCategories } from "@/actions/admin";
import { AdminCategoriesView } from "@/components/admin/AdminCategoriesView";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();
  return <AdminCategoriesView initialCategories={categories} />;
}
