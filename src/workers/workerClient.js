// Import the worker using Vite's ?worker syntax
import WordWorker from './wordWorker?worker';

class WorkerClient {
  constructor() {
    this.worker = new WordWorker();
    this.callbacks = new Map();
    this.msgId = 0;

    this.worker.onmessage = (e) => {
      const { id, payload, error } = e.data;
      if (this.callbacks.has(id)) {
        const { resolve, reject } = this.callbacks.get(id);
        if (error) {
          reject(new Error(error));
        } else {
          resolve(payload);
        }
        this.callbacks.delete(id);
      }
    };
  }

  validateWord(guess, target) {
    return new Promise((resolve, reject) => {
      const id = ++this.msgId;
      this.callbacks.set(id, { resolve, reject });
      this.worker.postMessage({
        id,
        type: 'VALIDATE_WORD',
        payload: { guess, target }
      });
    });
  }
}

// Export a singleton instance
export const wordWorkerClient = new WorkerClient();
