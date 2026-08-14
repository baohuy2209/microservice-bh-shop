/**
 * In-memory test harness for Apache Kafka messaging in BH Shop microservices.
 * Emulates producer send and consumer subscription handlers with strict typing.
 */

export interface TestMessage<T = any> {
  topic: string;
  value: T;
  timestamp: number;
}

export class InMemoryKafkaHarness {
  private eventLog: TestMessage[] = [];
  private subscriptions: Map<string, Array<(message: { value: any }) => Promise<void> | void>> = new Map();

  public async send(topic: string, message: { value: any }): Promise<void> {
    const entry: TestMessage = {
      topic,
      value: message.value,
      timestamp: Date.now(),
    };
    this.eventLog.push(entry);

    const handlers = this.subscriptions.get(topic) || [];
    for (const handler of handlers) {
      await handler({ value: message.value });
    }
  }

  public subscribe(topicName: string, handler: (message: { value: any }) => Promise<void> | void): void {
    const existing = this.subscriptions.get(topicName) || [];
    existing.push(handler);
    this.subscriptions.set(topicName, existing);
  }

  public getEventsByTopic(topic: string): TestMessage[] {
    return this.eventLog.filter((e) => e.topic === topic);
  }

  public getAllEvents(): TestMessage[] {
    return [...this.eventLog];
  }

  public clear(): void {
    this.eventLog = [];
    this.subscriptions.clear();
  }
}

export const createMockProducer = () => {
  const published: Array<{ topic: string; message: any }> = [];
  return {
    connect: async () => {},
    send: async (topic: string, message: object) => {
      published.push({ topic, message });
    },
    disconnect: async () => {},
    getPublishedEvents: () => [...published],
    clear: () => {
      published.length = 0;
    },
  };
};

export const createMockConsumer = () => {
  const subscriptions: Array<{ topicName: string; topicHandler: (msg: any) => Promise<void> }> = [];
  return {
    connect: async () => {},
    subscribe: async (topics: Array<{ topicName: string; topicHandler: (msg: any) => Promise<void> }>) => {
      subscriptions.push(...topics);
    },
    disconnect: async () => {},
    triggerMessage: async (topicName: string, value: any) => {
      const matched = subscriptions.find((s) => s.topicName === topicName);
      if (matched) {
        await matched.topicHandler(value);
      }
    },
    getSubscriptions: () => [...subscriptions],
  };
};
