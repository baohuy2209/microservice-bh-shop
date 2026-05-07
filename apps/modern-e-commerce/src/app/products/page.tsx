import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ProductList from "@/components/ProductList";

const ProductsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ category: string; sort: string; search: string }>;
}) => {
  const { category, sort, search } = await searchParams;
  return (
    <div className="mx-auto p-4 sm:px-0 sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-6xl">
      <Navbar />
      <ProductList
        params="products"
        category={category}
        sort={sort}
        search={search}
      />
      <Footer />
    </div>
  );
};

export default ProductsPage;
