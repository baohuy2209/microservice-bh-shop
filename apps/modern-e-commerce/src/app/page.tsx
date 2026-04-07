import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ProductList from "@/components/ProductList";
import Image from "next/image";
const Homepage = async ({
  searchParams,
}: {
  searchParams: Promise<{ category: string }>;
}) => {
  const category = (await searchParams).category;

  return (
    <div className="mx-auto p-4 sm:px-0 sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-6xl">
      <Navbar />
      <div className="relative aspect-3/1 mb-12">
        <Image src="/featured.png" alt="Featured" fill />
      </div>
      <ProductList category={category} params="homepage" />
      <Footer />
    </div>
  );
};

export default Homepage;
