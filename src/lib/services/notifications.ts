import { writable } from 'svelte/store';

export type NotificationType = 'success' | 'error' | 'info';

export type Notification = {
  id: string;
  title: string;
  description?: string;
  type: NotificationType;
  timeoutMs?: number;
};

function createNotificationsStore() {
  const { subscribe, update } = writable<Notification[]>([]);

  const remove = (id: string) => {
    update((list) => list.filter((item) => item.id !== id));
  };

  const push = (notification: Omit<Notification, 'id'>) => {
    const id = crypto.randomUUID();
    const item: Notification = {
      ...notification,
      id,
      timeoutMs: notification.timeoutMs ?? 3600
    };

    update((list) => [...list, item]);

    if (item.timeoutMs && item.timeoutMs > 0) {
      setTimeout(() => remove(id), item.timeoutMs);
    }

    return id;
  };

  return { subscribe, push, remove };
}

export const notifications = createNotificationsStore();
