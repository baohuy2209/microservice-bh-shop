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

      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          {/* Title */}
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">
            Payment {data.status}
          </h1>

          {/* Status pills */}
          <div className="inline-flex flex-col sm:flex-row gap-3 mb-10">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full">
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                Order
              </span>
              <span className="text-xs font-medium capitalize px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                {data.status}
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full">
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                Payment
              </span>
              <span className="text-xs font-medium capitalize px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                {data.paymentStatus}
              </span>
            </div>
          </div>

          {/* CTA */}
          <div>
            <Link
              href="/orders"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              View Your Orders
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default ReturnPage;
