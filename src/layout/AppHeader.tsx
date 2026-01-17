import NotificationBell from "@/components/notification/NotificationBell";
import { useLogout } from "@/hooks/auth/auth";
import { useAuth } from "@/hooks/auth/useAuth";
import { useRouter } from "@/routes/hooks";
import {
  HistoryOutlined,
  LogoutOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Dropdown, message, Space, type MenuProps } from "antd";
import { useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ENFlag, VNFlag } from "../assets/icons";
import { PUBLIC_ROUTES, REQUIRE_AUTH_ROUTES } from "../routes/routes";

export default function AppHeader() {
  const {
    isAuthenticated,
    displayName,
    displayEmail,
    displayInitial,
    clearAuth,
  } = useAuth();
  const logoutMutation = useLogout();
  // const [notifications] = useState(["Bạn có vé mới", "Khuyến mãi đặc biệt"]);
  const [language, setLanguage] = useState("vi");
  const headerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const router = useRouter();

  const isHomePage = location.pathname === PUBLIC_ROUTES.HOME;

  const handleLogin = () => router.push(PUBLIC_ROUTES.LOGIN);
  const handleRegister = () => router.push(PUBLIC_ROUTES.REGISTER);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      message.success("Đăng xuất thành công");
    } catch (error) {
      // Even if API call fails, clear local state
      clearAuth();
      message.info("Đã đăng xuất");
      router.push(PUBLIC_ROUTES.HOME);
    }
  };

  const handleProfileClick = () =>
    router.push(REQUIRE_AUTH_ROUTES.CUSTOMER_PROFILE);

  const handleHistoryClick = () => {
    router.push(REQUIRE_AUTH_ROUTES.BOOKING_HISTORY);
  };

  // Menu cho người dùng chưa đăng nhập
  const guestMenu: MenuProps = {
    items: [
      {
        key: "login",
        label: "Đăng nhập",
        icon: <UserOutlined />,
      },
      {
        key: "register",
        label: "Đăng ký",
        icon: <UserOutlined />,
      },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === "login") handleLogin();
      if (key === "register") handleRegister();
    },
  };

  // Menu cho người dùng đã đăng nhập
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
        disabled: true, // This is just for display
      },
      {
        type: "divider",
      },
      {
        key: "profileDetail",
        label: "Thông tin cá nhân",
        icon: <UserOutlined />,
      },
      {
        key: "history",
        label: "Lịch sử đặt vé",
        icon: <HistoryOutlined />,
      },
      {
        type: "divider",
      },
      {
        key: "logout",
        label: "Đăng xuất",
        icon: <LogoutOutlined />,
        danger: true,
      },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === "profileDetail") handleProfileClick();
      if (key === "history") handleHistoryClick();
      if (key === "logout") handleLogout();
    },
  };

  // const notificationMenu = {
  //   items: notifications.length
  //     ? notifications.map((item, index) => ({ key: index, label: item }))
  //     : [{ key: "none", label: "Không có thông báo" }],
  // };

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
    { path: PUBLIC_ROUTES.HOME, label: "Trang chủ" },
    { path: PUBLIC_ROUTES.BOOKING, label: "Đặt vé" },
    { path: PUBLIC_ROUTES.SEARCH_BOOKING, label: "Chuyến đi của tôi" },
    { path: PUBLIC_ROUTES.CONTACT, label: "Liên hệ" },
    { path: PUBLIC_ROUTES.ABOUT, label: "Giới thiệu" },
  ];

  return (
    <div
      style={{
        width: "100%",
        background: "var(--color-primary-800)",
        color: "var(--color-text-inverse)",
        position: "relative",
        height: isHomePage ? 300 : 150,
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
            href="tel:19001234"
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
            Hotline: 1900 1234
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
            Viet Travel
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
          {/* <Dropdown menu={notificationMenu} placement="bottomRight">
            <Badge count={notifications.length}>
              <BellOutlined
                style={{
                  fontSize: 22,
                  color: "var(--color-accent-100)",
                  cursor: "pointer",
                  transition: "var(--transition-base)",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.color = "var(--color-accent-400)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.color = "var(--color-accent-100)")
                }
              />
            </Badge>
          </Dropdown> */}

          {isAuthenticated ? <NotificationBell /> : undefined}

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
            style={({ isActive }) => ({
              fontWeight: isActive ? 600 : 500,
              color: isActive
                ? "var(--color-accent-100)"
                : "rgba(255,255,255,0.85)",
              textDecoration: "none",
              borderBottom: isActive
                ? "3px solid var(--color-accent-400)"
                : "3px solid transparent",
              padding: "8px 50px",
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
