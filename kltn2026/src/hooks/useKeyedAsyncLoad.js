import { useSyncExternalStore, useRef } from 'react';

const PENDING = Symbol('useKeyedAsyncLoad.pending');
const IDLE = Symbol('useKeyedAsyncLoad.idle');

const idleStore = {
  subscribe() {
    return () => {};
  },
  getSnapshot() {
    return IDLE;
  },
};

/**
 * Tải async khi loadKey thay đổi — không dùng useEffect + fetch.
 */
export function useKeyedAsyncLoad(loadKey, loadFn) {
  const loadFnRef = useRef(loadFn);
  loadFnRef.current = loadFn;

  const keyRef = useRef(null);
  const storeRef = useRef(idleStore);

  if (keyRef.current !== loadKey) {
    keyRef.current = loadKey;

    if (!loadKey) {
      storeRef.current = idleStore;
    } else {
      let snapshot = PENDING;
      const listeners = new Set();

      storeRef.current = {
        subscribe(onStoreChange) {
          listeners.add(onStoreChange);
          if (snapshot === PENDING) {
            Promise.resolve()
              .then(() => loadFnRef.current())
              .then((data) => {
                snapshot = { ok: true, data };
                listeners.forEach((l) => l());
              })
              .catch((error) => {
                snapshot = { ok: false, error };
                listeners.forEach((l) => l());
              });
          }
          return () => listeners.delete(onStoreChange);
        },
        getSnapshot() {
          return snapshot;
        },
      };
    }
  }

  const snapshot = useSyncExternalStore(
    storeRef.current.subscribe,
    storeRef.current.getSnapshot,
    () => PENDING
  );

  if (snapshot === IDLE) {
    return { data: undefined, error: undefined, isLoading: false };
  }
  if (snapshot === PENDING) {
    return { data: undefined, error: undefined, isLoading: true };
  }
  if (snapshot.ok) {
    return { data: snapshot.data, error: undefined, isLoading: false };
  }
  return { data: undefined, error: snapshot.error, isLoading: false };
}
