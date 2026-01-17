import { useMemo } from "react";
import type { NavigateOptions, To } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export function useRouter() {
  const navigate = useNavigate();

  const canGoBack = () => window.history.length > 1;

  const router = useMemo(
    () => ({
      back: () => navigate(-1),
      forward: () => navigate(1),
      reload: () => window.location.reload(),
      push: (href: string, data?: unknown) => {
        navigate(href, { replace: false, state: data });
      },
      replace: (href: To, options?: NavigateOptions | undefined) =>
        navigate(href, { replace: true, ...options }),
      canGoBack,
    }),
    [navigate]
  );

  return router;
}
