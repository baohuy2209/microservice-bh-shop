"use client";
import { useAuth } from "@clerk/nextjs";

async function Page() {
  const { getToken } = useAuth();

  const token = await getToken();
  console.log(token);
  return <div>Page</div>;
}

export default Page;
