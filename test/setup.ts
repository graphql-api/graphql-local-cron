// Mock browser APIs for testing in Node.js environment

// Mock IndexedDB
global.indexedDB = {
  open: vi.fn(() => ({
    onupgradeneeded: null,
    onsuccess: null,
    onerror: null,
    result: {
      createObjectStore: vi.fn(),
      transaction: vi.fn(() => ({
        objectStore: vi.fn(() => ({
          put: vi.fn(),
          get: vi.fn(),
          getAll: vi.fn(),
          delete: vi.fn()
        }))
      }))
    }
  }))
};

// Mock BroadcastChannel
global.BroadcastChannel = class {
  constructor(name) {
    this.name = name;
  }
  postMessage = vi.fn();
  onmessage = null;
  close = vi.fn();
};

// Mock ServiceWorker
global.ServiceWorker = class {
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
};

// Mock Navigator
Object.defineProperty(global, 'navigator', {
  value: {
    serviceWorker: {
      register: vi.fn(),
      getRegistrations: vi.fn()
    },
    onLine: true
  },
  writable: true
});

// Mock RequestIdleCallback
global.requestIdleCallback = vi.fn((callback) => {
  callback({ didTimeout: false, timeRemaining: () => 50 });
  return 1;
});
global.cancelIdleCallback = vi.fn();

// Mock Page Visibility API
Object.defineProperty(document, 'visibilityState', {
  value: 'visible',
  writable: true
});