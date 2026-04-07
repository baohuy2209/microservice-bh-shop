import type { Product, Category } from "@repo/product-db";
export type ProductType = Product;
export type ProductsType = ProductType[];
export type CategoryType = Category;
export type StripeProductType = {
  id: string;
  name: string;
  price: number;
};
