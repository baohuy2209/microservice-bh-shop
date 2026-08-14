/**
 * Mock Prisma client for unit & integration testing of Product Service.
 */

export interface MockPrismaProduct {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  sizes: string[];
  colors: string[];
  images: Record<string, string>;
  categorySlug: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockPrismaCategory {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export const createMockPrismaClient = () => {
  const products: MockPrismaProduct[] = [];
  const categories: MockPrismaCategory[] = [];

  return {
    product: {
      create: async ({ data }: { data: any }) => {
        const item: MockPrismaProduct = {
          id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: data.name,
          shortDescription: data.shortDescription || "",
          description: data.description || "",
          price: data.price,
          sizes: data.sizes || [],
          colors: data.colors || [],
          images: data.images || {},
          categorySlug: data.categorySlug,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        products.push(item);
        return item;
      },
      findMany: async (query?: any) => {
        let result = [...products];
        if (query?.where?.category?.slug) {
          result = result.filter((p) => p.categorySlug === query.where.category.slug);
        }
        if (query?.where?.name?.contains) {
          const search = query.where.name.contains.toLowerCase();
          result = result.filter((p) => p.name.toLowerCase().includes(search));
        }
        if (query?.take) {
          result = result.slice(0, query.take);
        }
        return result;
      },
      findUnique: async ({ where }: { where: { id: string } }) => {
        return products.find((p) => p.id === where.id) || null;
      },
      update: async ({ where, data }: { where: { id: string }; data: any }) => {
        const index = products.findIndex((p) => p.id === where.id);
        if (index === -1) throw new Error("Product not found");
        products[index] = { ...products[index], ...data, updatedAt: new Date() };
        return products[index];
      },
      delete: async ({ where }: { where: { id: string } }) => {
        const index = products.findIndex((p) => p.id === where.id);
        if (index === -1) throw new Error("Product not found");
        const [deleted] = products.splice(index, 1);
        return deleted;
      },
    },
    category: {
      create: async ({ data }: { data: any }) => {
        const item: MockPrismaCategory = {
          id: `cat_${Date.now()}`,
          name: data.name,
          slug: data.slug,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        categories.push(item);
        return item;
      },
      findMany: async () => [...categories],
      findUnique: async ({ where }: { where: { slug: string } }) => {
        return categories.find((c) => c.slug === where.slug) || null;
      },
    },
    $reset: () => {
      products.length = 0;
      categories.length = 0;
    },
  };
};
