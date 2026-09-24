import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * False during the server render and the hydration pass, true from the first
 * client render after that - including the very first render on a client-side
 * navigation, where there is nothing to hydrate.
 *
 * This replaces the `const [isClient, setIsClient] = useState(false)` plus
 * `useEffect(() => setIsClient(true), [])` pattern, which React's lint now flags
 * as a cascading render. Gate browser-only reads (localStorage, window) on it so
 * the hydration pass still matches the server HTML.
 *
 * Restoring saved state then happens during render, guarded so it runs once:
 *
 *   const hydrated = useHydrated();
 *   const [restored, setRestored] = useState(false);
 *   if (hydrated && !restored) {
 *     setRestored(true);
 *     setThing(readSavedThing());
 *   }
 *
 * The hydration pass commits - and runs its effects - before the `true` render,
 * so an effect that *writes* storage must be gated on `restored` (or moved into
 * the event handler that changes the value), or it saves the defaults over what
 * it was about to restore.
 */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
