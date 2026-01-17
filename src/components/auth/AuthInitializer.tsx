import { useAuthHydrationStore } from "@/hooks/auth/useAuthStore";
import { useEffect } from "react";

export default function AuthInitializer() {
  const setHasHydrated = useAuthHydrationStore((state) => state.setHasHydrated);

  useEffect(() => {
    setHasHydrated(true);
  }, [setHasHydrated]);

  return null;
}
