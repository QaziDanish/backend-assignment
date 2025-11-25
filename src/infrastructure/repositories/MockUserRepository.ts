import { IUserRepository } from "../../domain/ports/IUserRepository";
import { User } from "../../domain/entities/User";

const MOCK_DB: Record<number, User> = {
  1: { id: 1, name: "John Doe", email: "john@example.com" },
  2: { id: 2, name: "Jane Smith", email: "jane@example.com" },
  3: { id: 3, name: "Alice Johnson", email: "alice@example.com" },
};

export class MockUserRepository implements IUserRepository {
  private pendingRequests = new Map<number, Promise<User | null>>();
  private queue: Array<() => Promise<void>> = [];
  private isProcessing = false;

  async findById(id: number): Promise<User | null> {
    // Request Coalescing: If a request for ID 1 is already flying, reuse the promise
    if (this.pendingRequests.has(id)) {
      return this.pendingRequests.get(id)!;
    }

    const fetchPromise = new Promise<User | null>((resolve, reject) => {
      const task = async () => {
        try {
          // Simulate DB Latency
          await new Promise((r) => setTimeout(r, 200));
          const user = MOCK_DB[id] || null;
          resolve(user);
        } catch (err) {
          reject(err);
        } finally {
          this.pendingRequests.delete(id);
        }
      };

      this.queue.push(task);
      this.processQueue();
    });

    this.pendingRequests.set(id, fetchPromise);
    return fetchPromise;
  }

  async save(user: User): Promise<void> {
    MOCK_DB[user.id] = user;
    return Promise.resolve();
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;
    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) await task();
    }
    this.isProcessing = false;
  }
}
