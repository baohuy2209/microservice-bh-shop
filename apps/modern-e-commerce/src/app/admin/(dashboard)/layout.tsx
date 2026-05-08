import "../../globals.css";
import AppSidebar from "@/components/admin/AppSidebar";
import Navbar from "@/components/admin/Navbar";
import QueryProvider from "@/components/providers/QueryProvider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cookies } from "next/headers";
import { ToastContainer } from "react-toastify";
export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  return (
    <QueryProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <main className="w-full">
          <Navbar />
          <div className="px-4">{children}</div>
        </main>
      </SidebarProvider>
      <ToastContainer position="bottom-right" />
    </QueryProvider>
  );
}
