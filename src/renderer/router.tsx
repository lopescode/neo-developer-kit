import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";
import { getState, setState } from "./vscode";

interface RouterValue {
  route: string;
  navigate: (route: string) => void;
}

interface PersistedRoute {
  route?: string;
}

const RouterContext = createContext<RouterValue | null>(null);

/**
 * A minimal screen router. The current route is persisted to the webview state
 * so the panel reopens on the same screen.
 */
export function RouterProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<string>(
    () => getState<PersistedRoute>()?.route ?? "home",
  );

  const navigate = useCallback((next: string) => {
    setRoute(next);
    const prev = getState<Record<string, unknown>>() ?? {};
    setState({ ...prev, route: next });
  }, []);

  return (
    <RouterContext.Provider value={{ route, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

/** Access the current route and the navigate function. */
export function useRouter(): RouterValue {
  const ctx = useContext(RouterContext);
  if (!ctx) {
    throw new Error("useRouter must be used within a RouterProvider");
  }
  return ctx;
}
