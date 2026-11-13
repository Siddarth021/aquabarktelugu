import { getAdminProducts, getAdminCategories } from "@/actions/admin";
import { AdminProductsView } from "@/components/admin/AdminProductsView";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getAdminProducts();
  const categories = await getAdminCategories();

  return <AdminProductsView initialProducts={products} categories={categories} />;
}
