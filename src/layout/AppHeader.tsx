import { useLogout } from "@/hooks/auth/auth";
import { useAuth } from "@/hooks/auth/useAuth";
import { useRouter } from "@/routes/hooks";
import { LogoutOutlined, PhoneOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Dropdown, message, Space, type MenuProps } from "antd";
import { useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ENFlag, VNFlag } from "../assets/icons";
import { PUBLIC_ROUTES, REQUIRE_AUTH_ROUTES } from "../routes/routes";

type RoleAwareProfile =
  | {
      roles?: Array<{ code?: string | null }>;
    }
  | null
  | undefined;

export default function AppHeader() {
  const {
    isAuthenticated,
    displayName,
    displayEmail,
    displayInitial,
    clearAuth,
    profile,
  } = useAuth();
  const logoutMutation = useLogout();
  const [language, setLanguage] = useState("vi");
  const headerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const roleCodes = ((profile as RoleAwareProfile)?.roles ?? []).map(
    (role) => role.code ?? "",
  );
  const isOwner = roleCodes.includes("OWNER");

  const handleLogin = () => router.push(PUBLIC_ROUTES.LOGIN);
  const handleRegister = () => router.push(PUBLIC_ROUTES.REGISTER);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      message.success("Đăng xuất thành công");
    } catch {
      clearAuth();
      message.info("Đã đăng xuất");
      router.push(PUBLIC_ROUTES.HOME);
    }
  };

  const guestMenu: MenuProps = {
    items: [
      { key: "login", label: "Đăng nhập", icon: <UserOutlined /> },
      { key: "register", label: "Đăng ký", icon: <UserOutlined /> },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === "login") handleLogin();
      if (key === "register") handleRegister();
    },
  };

  const userMenu: MenuProps = {
    items: [
      {
        key: "profile",
        label: (
          <div>
            <div style={{ fontWeight: 600 }}>{displayName}</div>
            <div style={{ fontSize: 12, color: "#666" }}>{displayEmail}</div>
          </div>
        ),
        icon: <UserOutlined />,
        disabled: true,
      },
      { type: "divider" },
      {
        key: "profileDetail",
        label: "Thông tin tài khoản",
        icon: <UserOutlined />,
      },
      ...(isOwner
        ? [
            {
              key: "ownerDashboard",
              label: "Trang chủ quán",
              icon: <UserOutlined />,
            },
          ]
        : []),
      { type: "divider" },
      {
        key: "logout",
        label: "Đăng xuất",
        icon: <LogoutOutlined />,
        danger: true,
      },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === "profileDetail")
        router.push(REQUIRE_AUTH_ROUTES.OWNER_PROFILE);
      if (key === "ownerDashboard")
        router.push(REQUIRE_AUTH_ROUTES.OWNER_DASHBOARD);
      if (key === "logout") handleLogout();
    },
  };

  const languages = [
    { key: "vi", label: "Tiếng Việt", flag: VNFlag },
    { key: "en", label: "English", flag: ENFlag },
  ];

  const menuItems: MenuProps["items"] = languages.map((lang) => ({
    key: lang.key,
    label: (
      <Space>
        <img src={lang.flag} alt={lang.key} style={{ width: 24, height: 24 }} />
        {lang.label}
      </Space>
    ),
  }));

  const navItems = [
    {
      path: REQUIRE_AUTH_ROUTES.OWNER_DASHBOARD,
      label: "Trang chủ",
    },
    {
      path: REQUIRE_AUTH_ROUTES.OWNER_STALL,
      label: "Quản lý quán ăn",
    },
    {
      path: REQUIRE_AUTH_ROUTES.OWNER_STALL_CONTENT,
      label: "Quản lý nội dung thuyết minh",
    },
    {
      path: REQUIRE_AUTH_ROUTES.OWNER_SUBSCRIPTION_PACKAGE,
      label: "Gói đăng ký",
    },
  ];

  return (
    <div
      style={{
        width: "100%",
        background: "var(--color-primary-800)",
        color: "var(--color-text-inverse)",
        position: "relative",
        height: 140,
      }}
    >
      <div
        ref={headerRef}
        style={{
          height: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          position: "relative",
          zIndex: 10,
        }}
      >
        <Space size="middle" style={{ display: "flex", alignItems: "center" }}>
          <Dropdown
            menu={{
              items: menuItems,
              onClick: ({ key }) => setLanguage(key),
            }}
          >
            <Button
              style={{
                background: "transparent",
                color: "var(--color-text-inverse)",
                border: "none",
                fontWeight: 500,
              }}
            >
              <Space>
                <img
                  src={languages.find((l) => l.key === language)?.flag}
                  alt={language}
                  style={{ width: 24, height: 24 }}
                />
                {languages.find((l) => l.key === language)?.label}
              </Space>
            </Button>
          </Dropdown>

          <a
            href="tel:19005678"
            style={{
              color: "var(--color-accent-200)",
              fontWeight: 500,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 4,
              cursor: "pointer",
            }}
          >
            <PhoneOutlined />
            Hotline tư vấn: 1900 5678
          </a>
        </Space>

        <Link
          to={PUBLIC_ROUTES.HOME}
          style={{
            left: "50%",
            transform: "translateX(-50%)",
            textDecoration: "none",
            position: "absolute",
            background: "var(--color-accent-400)",
            padding: "15px 52px",
            borderRadius: "0 0 100px 100px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "var(--transition-base)",
          }}
        >
          <span
            style={{
              fontFamily: "'Pacifico', cursive",
              fontSize: "32px",
              color: "var(--color-text-primary)",
              fontWeight: "bold",
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
            }}
          >
            STREET FOOD GO
          </span>
        </Link>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            justifyContent: "flex-end",
          }}
        >
          <Dropdown
            menu={isAuthenticated ? userMenu : guestMenu}
            placement="bottomRight"
            trigger={["click"]}
          >
            <Avatar
              icon={!isAuthenticated ? <UserOutlined /> : undefined}
              style={{
                cursor: "pointer",
                backgroundColor: isAuthenticated
                  ? "var(--color-accent-400)"
                  : "var(--color-secondary-500)",
                color: "var(--color-text-inverse)",
                border: isAuthenticated
                  ? "2px solid var(--color-accent-200)"
                  : "none",
              }}
            >
              {isAuthenticated && displayInitial}
            </Avatar>
          </Dropdown>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "10px 0",
          background: "var(--color-primary-800)",
        }}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end
            style={({ isActive }) => ({
              fontWeight: isActive ? 600 : 500,
              color: isActive
                ? "var(--color-accent-100)"
                : "rgba(255,255,255,0.85)",
              textDecoration: "none",
              borderBottom: isActive
                ? "3px solid var(--color-accent-400)"
                : "3px solid transparent",
              padding: "8px 34px",
              transition: "var(--transition-base)",
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
