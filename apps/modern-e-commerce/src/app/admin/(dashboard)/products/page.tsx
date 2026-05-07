import { columns } from "@/app/admin/(dashboard)/products/columns";
import { DataTable } from "@/app/admin/(dashboard)/products/data-table";
import { ProductsType } from "@repo/types";
const getData = async (): Promise<ProductsType> => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/products`,
    );
    const data: ProductsType = await res.json();
    return data;
  } catch (e) {
    console.log(e);
    return [];
  }
};

const ProductsPage = async () => {
  const data = await getData();
  return (
    <div className="">
      <div className="mb-8 px-4 py-2 bg-secondary rounded-md">
        <h1 className="font-semibold">All Products</h1>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
};

export default ProductsPage;
