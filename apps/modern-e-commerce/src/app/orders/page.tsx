import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { auth } from "@clerk/nextjs/server";
import { OrderType } from "@repo/types";

const fetchOrders = async () => {
  const { getToken } = await auth();
  const token = await getToken();
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_ORDER_SERVICE_URL}/user-orders`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const data: OrderType[] = await res.json();
  return data;
};
async function OrdersPage() {
  const orders = await fetchOrders();
  if (!orders) {
    return <div className="">No Orders Found!</div>;
  }
  return (
    <div className="mx-auto p-4 sm:px-0 sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-6xl">
      <Navbar />
      <div className="mt-4">
        <h1 className="text-2xl my-4 font-medium">Your Orders</h1>

        {/* Header row */}
        <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-2 mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400 border-b border-gray-100">
          <div className="col-span-3">Order ID</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-1 text-right">Total</div>
          <div className="col-span-2 text-center">Status</div>
          <div className="col-span-4">Products</div>
        </div>

        <ul className="w-full divide-y divide-gray-100">
          {orders.map((order: OrderType) => (
            <li
              key={order._id}
              className="grid grid-cols-12 gap-4 px-4 py-4 items-center hover:bg-gray-50 transition-colors rounded-lg group"
            >
              {/* Order ID */}
              <div className="col-span-12 sm:col-span-3">
                <span className="sm:hidden text-xs font-semibold uppercase tracking-widest text-gray-400 block mb-0.5">
                  Order ID
                </span>
                <span className="font-mono text-sm text-gray-700 truncate block">
                  #{order._id.toUpperCase()}
                </span>
              </div>

              {/* Date */}
              <div className="col-span-6 sm:col-span-2">
                <span className="sm:hidden text-xs font-semibold uppercase tracking-widest text-gray-400 block mb-0.5">
                  Date
                </span>
                <span className="text-sm text-gray-600">
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"}
                </span>
              </div>

              {/* Total */}
              <div className="col-span-6 sm:col-span-1 sm:text-right">
                <span className="sm:hidden text-xs font-semibold uppercase tracking-widest text-gray-400 block mb-0.5">
                  Total
                </span>
                <span className="text-sm font-semibold text-gray-800">
                  ${(order.amount / 100).toFixed(2)}
                </span>
              </div>

              {/* Status */}
              <div className="col-span-6 sm:col-span-2 sm:text-center">
                <span className="sm:hidden text-xs font-semibold uppercase tracking-widest text-gray-400 block mb-0.5">
                  Status
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              {/* Products */}
              <div className="col-span-12 sm:col-span-4">
                <span className="sm:hidden text-xs font-semibold uppercase tracking-widest text-gray-400 block mb-0.5">
                  Products
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {order.products?.length ? (
                    order.products.map((product, i) => (
                      <span
                        key={i}
                        className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs truncate max-w-40"
                        title={product.name}
                      >
                        {product.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">—</span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>

        {orders.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">No orders yet.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default OrdersPage;
