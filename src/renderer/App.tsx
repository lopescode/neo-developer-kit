import type { FC } from "react";
import { RouterProvider, useRouter } from "./router";
import { Home } from "./screens/Home";
import { TestInvoke } from "./screens/TestInvoke";
import { WalletHub } from "./screens/wallet/WalletHub";
import { WalletBalance } from "./screens/wallet/WalletBalance";
import { WalletTransfer } from "./screens/wallet/WalletTransfer";

const SCREENS: Record<string, FC> = {
  home: Home,
  invoke: TestInvoke,
  wallet: WalletHub,
  "wallet.balance": WalletBalance,
  "wallet.transfer": WalletTransfer,
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
