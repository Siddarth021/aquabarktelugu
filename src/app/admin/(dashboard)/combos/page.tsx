import { getAdminCombos, getAdminProducts } from "@/actions/admin";
import { AdminCombosView } from "@/components/admin/AdminCombosView";

export const dynamic = "force-dynamic";

export default async function AdminCombosPage() {
  const combos = await getAdminCombos();
  const products = await getAdminProducts();

  return <AdminCombosView initialCombos={combos} allProducts={products} />;
}
