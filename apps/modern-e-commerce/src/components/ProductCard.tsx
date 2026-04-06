"use client";
import { ProductType } from "@/types";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";

function ProductCard({ product }: { product: ProductType }) {
  const [productTypes, setProductTypes] = React.useState({
    size: product.sizes[0],
    color: product.colors[0],
  });
  const handleProductType = ({
    type,
    value,
  }: {
    type: "size" | "color";
    value: string;
  }) => {
    setProductTypes((prev) => ({
      ...prev,
      [type]: value,
    }));
  };
  return (
    <div className="shadow-lg rounded-lg overflow-hidden">
      {/* IMAGE */}
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-2/3">
          <Image
            src={product.images[productTypes.color || "default"] || "/logo.png"}
            alt={product.name}
            className="object-cover hover:scale-105 transition-all duration-300 ease-out"
            width={500}
            height={500}
          />
        </div>
      </Link>
      {/* INFO */}
      <div className="flex flex-col gap-4 p-4">
        <h1 className="font-medium">{product.name}</h1>
        <p className="text-sm text-gray-500">{product.shortDescription}</p>
        <div className=" flex flex-row items-center gap-4 text-xs">
          {/* SIZE */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-gray-500">Size</span>
            <select
              name="size"
              id="size"
              className="ring ring-gray-300 rounded-md px-2 py-1"
              onChange={(e) =>
                handleProductType({ type: "size", value: e.target.value })
              }
            >
              {product.sizes.map((size, index) => (
                <option key={index} value={size}>
                  {size.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          {/* COLORS */}
          <div className="flex flex-col gap-1">
            <span className="text-gray-500">Color</span>
            <div className="flex items-center gap-2">
              {product.colors.map((color) => (
                <div
                  key={color}
                  className={`ring-1 ring-gray-300 rounded-full  cursor-pointer ${
                    productTypes.color === color
                      ? "border-gray-400 p-[1.2px]"
                      : ""
                  }`}
                  onClick={() =>
                    handleProductType({ type: "color", value: color })
                  }
                >
                  <div
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* PRICE AND ADD TO CART BUTTON */}
        <div className="flex flex-row justify-between items-center">
          <p className="font-normal text-[16px]">${product.price.toFixed(2)}</p>
          <button className="flex flex-row items-center shadow-lg gap-2 px-2 py-1 rounded-md ring-1 ring-gray-300 cursor-pointer hover:text-white hover:bg-black hover:scale-105 transition-all duration-300 ease-out">
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
