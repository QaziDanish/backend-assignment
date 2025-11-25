"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockUserRepository = void 0;
const MOCK_DB = {
    1: { id: 1, name: "John Doe", email: "john@example.com" },
    2: { id: 2, name: "Jane Smith", email: "jane@example.com" },
    3: { id: 3, name: "Alice Johnson", email: "alice@example.com" },
};
class MockUserRepository {
    constructor() {
        this.pendingRequests = new Map();
        this.queue = [];
        this.isProcessing = false;
    }
    async findById(id) {
        // Request Coalescing: If a request for ID 1 is already flying, reuse the promise
        if (this.pendingRequests.has(id)) {
            return this.pendingRequests.get(id);
        }
        const fetchPromise = new Promise((resolve, reject) => {
            const task = async () => {
                try {
                    // Simulate DB Latency
                    await new Promise((r) => setTimeout(r, 200));
                    const user = MOCK_DB[id] || null;
                    resolve(user);
                }
                catch (err) {
                    reject(err);
                }
                finally {
                    this.pendingRequests.delete(id);
                }
            };
            this.queue.push(task);
            this.processQueue();
        });
        this.pendingRequests.set(id, fetchPromise);
        return fetchPromise;
    }
    async save(user) {
        MOCK_DB[user.id] = user;
        return Promise.resolve();
    }
    async processQueue() {
        if (this.isProcessing || this.queue.length === 0)
            return;
        this.isProcessing = true;
        while (this.queue.length > 0) {
            const task = this.queue.shift();
            if (task)
                await task();
        }
        this.isProcessing = false;
    }
}
exports.MockUserRepository = MockUserRepository;
