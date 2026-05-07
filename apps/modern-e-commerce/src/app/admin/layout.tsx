import type { Metadata } from "next";
import "../globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
export const metaData: Metadata = {
  title: "Admin - Modern E-Commerce",
  description: "Authorized Nguyen Bao Huy",
};

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
