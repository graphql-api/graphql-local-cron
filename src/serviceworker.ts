// Service Worker implementation for background job processing
self.addEventListener('install', (event) => {
  // @ts-ignore
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  // @ts-ignore
  event.waitUntil(self.clients.claim());
});

// Handle background sync events
self.addEventListener('sync', (event) => {
  // @ts-ignore
  if (event.tag === 'graphql-cron-sync') {
    // @ts-ignore
    event.waitUntil(syncJobs());
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  // @ts-ignore
  const data = event.data ? event.data.json() : {};
  
  if (data.type === 'job-notification') {
    const title = data.title || 'Cron Job Notification';
    const options = {
      body: data.body || 'A scheduled task requires your attention',
      icon: data.icon || '/notification-icon.png',
      data: data.data || {}
    };
    
    // @ts-ignore
    event.waitUntil(self.registration.showNotification(title, options));
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  // @ts-ignore
  event.notification.close();
  
  // @ts-ignore
  const data = event.notification.data;
  
  if (data.url) {
    // @ts-ignore
    event.waitUntil(
      // @ts-ignore
      self.clients.matchAll({ type: 'window' }).then((clientList) => {
        // Check if a window is already open
        for (const client of clientList) {
          if (client.url === data.url && 'focus' in client) {
            return client.focus();
          }
        }
        // Open a new window if none are open
        // @ts-ignore
        if (self.clients.openWindow) {
          // @ts-ignore
          return self.clients.openWindow(data.url);
        }
        return null;
      })
    );
  }
});

// Sync jobs from IndexedDB
async function syncJobs() {
  try {
    // Request clients to perform job sync
    // @ts-ignore
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_JOBS',
        timestamp: Date.now()
      });
    });
  } catch (error) {
    console.error('Error syncing jobs:', error);
  }
}

// Register service worker
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/graphql-cron-sw.js');
      console.log('Service Worker registered with scope:', registration.scope);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }
  console.warn('Service Workers are not supported in this browser');
  return null;
}

// Request background sync
export async function requestBackgroundSync(registration: ServiceWorkerRegistration): Promise<boolean> {
  if ('sync' in registration) {
    try {
      // @ts-ignore
      await registration.sync.register('graphql-cron-sync');
      return true;
    } catch (error) {
      console.error('Background Sync registration failed:', error);
      return false;
    }
  }
  console.warn('Background Sync is not supported in this browser');
  return false;
}

// Request permission and subscribe to push notifications
export async function subscribeToPushNotifications(
  registration: ServiceWorkerRegistration,
  applicationServerKey: string
): Promise<PushSubscription | null> {
  try {
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      console.warn('Notification permission not granted');
      return null;
    }
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey
    });
    
    return subscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return null;
  }
}