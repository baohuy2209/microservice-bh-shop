import { Payment, columns } from "@/app/admin/(dashboard)/orders/columns";
import { DataTable } from "@/app/admin/(dashboard)/orders/data-table";
import { auth } from "@clerk/nextjs/server";
import { OrderType } from "@repo/types";

const getData = async (): Promise<OrderType[]> => {
  try {
    const { getToken } = await auth();
    const token = await getToken();
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_ORDER_SERVICE_URL}/orders`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const data = await res.json();
    return data;
  } catch (e) {
    console.log(e);
    return [];
  }
};

const OrdersPage = async () => {
  const data = await getData();
  return (
    <div className="">
      <div className="mb-8 px-4 py-2 bg-secondary rounded-md">
        <h1 className="font-semibold">All Payments</h1>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
};

export default OrdersPage;
