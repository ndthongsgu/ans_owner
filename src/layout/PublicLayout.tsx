import ChatComponent from "@/components/chat";
import AppFooter from "./AppFooter";
import AppHeader from "./AppHeader";

function PublicLayout({ children }: { children: React.ReactNode }) {
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
          paddingBottom: "56px",
        }}
      >
        <div style={{ position: "relative" }}>{children}</div>
      </div>
      <ChatComponent />

      <AppFooter />
    </div>
  );
}

export default PublicLayout;
