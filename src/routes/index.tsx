import { lazy, Suspense } from "react";
import { Navigate, Outlet, useRoutes } from "react-router-dom";
import GlobalLoading from "../components/loading";
import AuthLayout from "../layout/AuthLayout";
import PublicLayout from "../layout/PublicLayout";
import RequireAuthLayout from "../layout/RequireAuthLayout";
import PrivateRoute from "./PrivateRoutes";
import { PUBLIC_SCREENS } from "./PublicScreens";
import { REQUIRE_AUTH_SCREEN } from "./RequireAuthScreens";
import { PUBLIC_ROUTES, REQUIRE_AUTH_ROUTES } from "./routes";

const Page404 = lazy(() => import("../pages/NotFound"));

const RequireAuthRoutes = [
  {
    path: "/",
    element: (
      <RequireAuthLayout>
        <Suspense fallback={<GlobalLoading />}>
          <PrivateRoute />
          {/* <Outlet /> */}
        </Suspense>
      </RequireAuthLayout>
    ),
    children: [
      {
        path: REQUIRE_AUTH_ROUTES.CHANGE_PASSWORD,
        element: REQUIRE_AUTH_SCREEN[REQUIRE_AUTH_ROUTES.CHANGE_PASSWORD],
      },
      {
        path: REQUIRE_AUTH_ROUTES.OWNER_DASHBOARD,
        element: REQUIRE_AUTH_SCREEN[REQUIRE_AUTH_ROUTES.OWNER_DASHBOARD],
      },
      {
        path: REQUIRE_AUTH_ROUTES.OWNER_PROFILE,
        element: REQUIRE_AUTH_SCREEN[REQUIRE_AUTH_ROUTES.OWNER_PROFILE],
      },
      {
        path: REQUIRE_AUTH_ROUTES.OWNER_STALL,
        element: REQUIRE_AUTH_SCREEN[REQUIRE_AUTH_ROUTES.OWNER_STALL],
      },
      {
        path: REQUIRE_AUTH_ROUTES.OWNER_STALL_CONTENT,
        element: REQUIRE_AUTH_SCREEN[REQUIRE_AUTH_ROUTES.OWNER_STALL_CONTENT],
      },
      {
        path: REQUIRE_AUTH_ROUTES.OWNER_SUBSCRIPTION_PACKAGE,
        element:
          REQUIRE_AUTH_SCREEN[REQUIRE_AUTH_ROUTES.OWNER_SUBSCRIPTION_PACKAGE],
      },
      {
        path: REQUIRE_AUTH_ROUTES.OWNER_ANALYTICS_INTERACTION,
        element:
          REQUIRE_AUTH_SCREEN[REQUIRE_AUTH_ROUTES.OWNER_ANALYTICS_INTERACTION],
      },
    ],
  },
];

const AuthRoutes = [
  {
    path: "/",
    element: (
      <AuthLayout>
        <Suspense fallback={<GlobalLoading />}>
          <Outlet />
        </Suspense>
      </AuthLayout>
    ),
    children: [
      {
        path: PUBLIC_ROUTES.LOGIN,
        element: PUBLIC_SCREENS[PUBLIC_ROUTES.LOGIN],
      },
      {
        path: PUBLIC_ROUTES.REGISTER,
        element: PUBLIC_SCREENS[PUBLIC_ROUTES.REGISTER],
      },
      {
        path: PUBLIC_ROUTES.FORGOT_PASSWORD,
        element: PUBLIC_SCREENS[PUBLIC_ROUTES.FORGOT_PASSWORD],
      },
      {
        path: PUBLIC_ROUTES.RESET_PASSWORD,
        element: PUBLIC_SCREENS[PUBLIC_ROUTES.RESET_PASSWORD],
      },
      {
        path: PUBLIC_ROUTES.OAUTH_CALLBACK,
        element: PUBLIC_SCREENS[PUBLIC_ROUTES.OAUTH_CALLBACK],
      },
    ],
  },
];

const PublicRoutes = [
  {
    path: "/",
    element: (
      <PublicLayout>
        <Suspense fallback={<GlobalLoading />}>
          <Outlet />
        </Suspense>
      </PublicLayout>
    ),
    children: [
      {
        index: true,
        element: PUBLIC_SCREENS[PUBLIC_ROUTES.HOME],
      },
      {
        path: PUBLIC_ROUTES.PAYMENT,
        element: PUBLIC_SCREENS[PUBLIC_ROUTES.PAYMENT],
      },
    ],
  },
];

function AppRouter() {
  const routes = useRoutes([
    ...PublicRoutes,
    ...RequireAuthRoutes,
    ...AuthRoutes,
    {
      path: "/404",
      element: (
        <Suspense fallback={<GlobalLoading />}>
          <Page404 />
        </Suspense>
      ),
    },
    {
      path: "*",
      element: <Navigate replace to="/404" />,
    },
  ]);

  return routes;
}

export default AppRouter;
