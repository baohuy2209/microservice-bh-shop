/**
 * Mock Mongoose Model for Order Service unit & integration testing.
 */

export interface MockOrderDocument {
  _id: string;
  userId: string;
  email: string;
  amount: number;
  status: "success" | "failed";
  products: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  createdAt: Date;
}

export const createMockOrderModel = () => {
  const store: MockOrderDocument[] = [];

  class MockOrder {
    public data: Partial<MockOrderDocument>;

    constructor(data: Partial<MockOrderDocument>) {
      this.data = {
        ...data,
        _id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: data.createdAt || new Date(),
      };
    }

    public async save(): Promise<MockOrderDocument> {
      store.push(this.data as MockOrderDocument);
      return this.data as MockOrderDocument;
    }

    public static find(query?: any) {
      const results = query?.userId
        ? store.filter((o) => o.userId === query.userId)
        : [...store];

      return {
        limit: (n: number) => ({
          sort: () => results.slice(0, n),
        }),
        sort: () => results,
        then: (resolve: any) => resolve(results),
      };
    }

    public static async aggregate(pipeline: any[]): Promise<any[]> {
      // Return simulated 6-month metric result for aggregation queries
      const now = new Date();
      return [
        { year: now.getFullYear(), month: now.getMonth() + 1, total: store.length, successful: store.filter(s => s.status === "success").length }
      ];
    }

    public static $reset(): void {
      store.length = 0;
    }
  }

  return MockOrder;
};
