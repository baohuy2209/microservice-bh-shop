import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Link from "next/link";

async function ReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id: string }> | undefined;
}) {
  const session_id = (await searchParams)?.session_id;
  if (!session_id) {
    return <div>No session id found!</div>;
  }
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL}/session/${session_id}`,
  );
  const data = await res.json();
  return (
    <div className="mx-auto p-4 sm:px-0 sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-6xl">
      <Navbar />
      <div className="">
        <h1>Payment {data.status}</h1>
        <p>Payment Status: {data.paymentStatus}</p>
        <Link href="/orders">See yours orders</Link>
      </div>
      <Footer />
    </div>
  );
}

export default ReturnPage;
