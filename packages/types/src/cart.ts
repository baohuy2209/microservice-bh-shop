import type { Product, Category } from "@repo/product-db";

export type CartItemType = Product & {
  quantity: number;
  selectSize: string;
  selectedColor: string;
};
export type CartItemsType = CartItemType[];
