import { createContext, type ReactNode, useContext, useState } from "react";
import GlobalLoading from "../components/loading";

const LoadingContext = createContext({
  showLoading: () => {},
  hideLoading: () => {},
});

export const useLoading = () => useContext(LoadingContext);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);

  const showLoading = () => setIsLoading(true);
  const hideLoading = () => setIsLoading(false);

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading }}>
      {isLoading && <GlobalLoading />}
      {children}
    </LoadingContext.Provider>
  );
}
