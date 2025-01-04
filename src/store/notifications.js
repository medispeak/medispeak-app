import { atom, getDefaultStore } from "jotai";

export const notificationAtom = atom([]); // null means no notification

export const notify = (notification, duration = 5000) => {
  const store = getDefaultStore();
  store.set(notificationAtom, (prev) => [...prev, notification]);

  // Auto clear after duration (default 5 seconds)
  setTimeout(() => {
    store.set(notificationAtom, (prev) =>
      prev.filter((n) => n !== notification)
    );
  }, duration);
};
