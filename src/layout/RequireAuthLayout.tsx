import { type ReactNode } from "react";
import AppFooter from "./AppFooter";
import AppHeader from "./AppHeader";

function RequireAuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
        backgroundColor: "#f6f6f6",
      }}
    >
      <AppHeader />
      <div
        style={{
          position: "relative",
        }}
      >
        <div style={{ position: "relative" }}>{children}</div>
      </div>

      <AppFooter />
    </div>
  );
}

export default RequireAuthLayout;
