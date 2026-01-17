import { type ReactNode } from "react";

function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        backgroundImage: `url(/background.png)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {children}
    </div>
  );
}

export default AuthLayout;
