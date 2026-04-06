import Link from "next/link";
import React from "react";
import Image from "next/image";
import Searchbar from "@/components/Searchbar";
import { Bell, Home } from "lucide-react";
import ShoppingCartIcon from "@/components/ShoppingCartIcon";

export default function Navbar() {
  return (
    <nav className="w-full flex items-center justify-between border-b boder-gray-200 pb-4">
      {/* LEFT */}
      <Link href="/" className="flex items-center">
        <Image
          src="/logo.png"
          alt="Logo"
          width={36}
          height={36}
          className="w-6 h-6 md:w-9 md:h-9"
        />
        <p className="hidden md:block text-md font-medium tracking-wider">
          BHShop
        </p>
      </Link>
      {/* RIGHT */}
      <div className="flex items-center gap-6">
        <Searchbar />
        <Link href="/">
          <Home className="w-4 h-4 text-gray-600" />
        </Link>
        <Bell className="w-4 h-4 text-gray-600" />
        <ShoppingCartIcon />
        <Link href="/login">Sign in</Link>
      </div>
    </nav>
  );
}
