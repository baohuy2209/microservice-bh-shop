import React from "react";
import Image from "next/image";
import Link from "next/link";

function Footer() {
  return (
    <div className="mt-16 flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-between md:gap-0 bg-gray-800 p-8 rounded-lg">
      <div className="flex flex-col items-center md:items-start gap-4">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Logo"
            width={36}
            height={36}
            className="w-6 h-6 md:w-9 md:h-9"
          />
          <p className="hidden md:block text-md font-medium tracking-wider text-white">
            BHShop
          </p>
        </Link>
        <p className="text-sm text-gray-400">
          &copy; {new Date().getFullYear()} BHShop
        </p>
        <p className="text-sm text-gray-400">All rights reserved.</p>
      </div>
      <div className="flex flex-col gap-4 text-sm text-gray-400 items-center md:items-start md:justify-between">
        <p className="text-sm text-amber-50">Links</p>
        <Link href="/">Home</Link>
        <Link href="/about">Contact</Link>
        <Link href="/contact">Term of service</Link>
        <Link href="/privacy">Privacy policy</Link>
      </div>
      <div className="flex flex-col gap-4 text-sm text-gray-400 items-center md:items-start md:justify-between">
        <p className="text-sm text-amber-50">Products</p>
        <Link href="/">All Products</Link>
        <Link href="/about">New Arrivals</Link>
        <Link href="/contact">Best Sellers</Link>
        <Link href="/privacy">Sale</Link>
      </div>
      <div className="flex flex-col gap-4 text-sm text-gray-400 items-center md:items-start md:justify-between">
        <p className="text-sm text-amber-50">Company</p>
        <Link href="/">About</Link>
        <Link href="/about">Contact</Link>
        <Link href="/contact">Blog</Link>
        <Link href="/privacy">Affiliate Program</Link>
      </div>
    </div>
  );
}

export default Footer;
