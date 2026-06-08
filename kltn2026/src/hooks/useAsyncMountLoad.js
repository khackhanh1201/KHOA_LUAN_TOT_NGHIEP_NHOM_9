import { useSyncExternalStore, useRef, useState, useCallback } from 'react';

const PENDING = Symbol('useAsyncMountLoad.pending');

/**
 * Tải dữ liệu async một lần khi mount — không dùng useEffect.
 * Phù hợp với khuyến nghị useSyncExternalStore của React Doctor (no-initialize-state).
 */
export function useAsyncMountLoad(loadFn) {
  const storeRef = useRef(null);

  if (!storeRef.current) {
    let snapshot = PENDING;
    const listeners = new Set();

    storeRef.current = {
      subscribe(onStoreChange) {
        listeners.add(onStoreChange);
        if (snapshot === PENDING) {
          Promise.resolve()
            .then(() => loadFn())
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

  const snapshot = useSyncExternalStore(
    storeRef.current.subscribe,
    storeRef.current.getSnapshot,
    () => PENDING
  );

  if (snapshot === PENDING) {
    return { data: undefined, error: undefined, isLoading: true };
  }
  if (snapshot.ok) {
    return { data: snapshot.data, error: undefined, isLoading: false };
  }
  return {
    data: undefined,
    error: snapshot.error,
    isLoading: false,
  };
}

/**
 * Giống useAsyncMountLoad nhưng có hàm reload() để tải lại sau mutation / nút làm mới.
 */
export function useAsyncMountLoadWithReload(loadFn) {
  const [reloadVersion, setReloadVersion] = useState(0);
  const loadFnRef = useRef(loadFn);
  loadFnRef.current = loadFn;

  const storeRef = useRef(null);
  const versionRef = useRef(-1);

  if (!storeRef.current || versionRef.current !== reloadVersion) {
    versionRef.current = reloadVersion;
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

  const snapshot = useSyncExternalStore(
    storeRef.current.subscribe,
    storeRef.current.getSnapshot,
    () => PENDING
  );

  const reload = useCallback(() => {
    setReloadVersion((v) => v + 1);
  }, []);

  if (snapshot === PENDING) {
    return { data: undefined, error: undefined, isLoading: true, reload };
  }
  if (snapshot.ok) {
    return { data: snapshot.data, error: undefined, isLoading: false, reload };
  }
  return {
    data: undefined,
    error: snapshot.error,
    isLoading: false,
    reload,
  };
}
