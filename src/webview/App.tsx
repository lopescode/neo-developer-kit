import type { FC } from "react";
import { RouterProvider, useRouter } from "./router";
import { Home } from "./screens/Home";
import { TestInvoke } from "./screens/TestInvoke";

const SCREENS: Record<string, FC> = {
  home: Home,
  invoke: TestInvoke,
};

function Outlet() {
  const { route } = useRouter();
  const Screen = SCREENS[route] ?? Home;
  return <Screen />;
}

export function App() {
  return (
    <RouterProvider>
      <Outlet />
    </RouterProvider>
  );
}
