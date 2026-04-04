import { HeroUIProvider } from "@heroui/system";
import type { NavigateOptions } from "react-router-dom";
import { useHref, useNavigate } from "react-router-dom";
import { ToastProvider } from "./components/toast";
import { LoadingProvider } from "./context/LoadingContext";

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NavigateOptions;
  }
}

export function Provider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  return (
    <HeroUIProvider navigate={navigate} useHref={useHref}>
      <ToastProvider>
        <LoadingProvider>{children}</LoadingProvider>
      </ToastProvider>
    </HeroUIProvider>
  );
}
