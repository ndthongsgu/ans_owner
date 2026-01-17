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
        path: REQUIRE_AUTH_ROUTES.CUSTOMER_PROFILE,
        element: REQUIRE_AUTH_SCREEN[REQUIRE_AUTH_ROUTES.CUSTOMER_PROFILE],
      },
      {
        path: REQUIRE_AUTH_ROUTES.PROFILE_SETUP,
        element: REQUIRE_AUTH_SCREEN[REQUIRE_AUTH_ROUTES.PROFILE_SETUP],
      },
      {
        path: REQUIRE_AUTH_ROUTES.CHANGE_PASSWORD,
        element: REQUIRE_AUTH_SCREEN[REQUIRE_AUTH_ROUTES.CHANGE_PASSWORD],
      },
      {
        path: REQUIRE_AUTH_ROUTES.NOTIFICATION_LIST,
        element: REQUIRE_AUTH_SCREEN[REQUIRE_AUTH_ROUTES.NOTIFICATION_LIST],
      },
      {
        path: REQUIRE_AUTH_ROUTES.NOTIFICATION_DETAIL,
        element: REQUIRE_AUTH_SCREEN[REQUIRE_AUTH_ROUTES.NOTIFICATION_DETAIL],
      },
      {
        path: REQUIRE_AUTH_ROUTES.BOOKING_HISTORY,
        element: REQUIRE_AUTH_SCREEN[REQUIRE_AUTH_ROUTES.BOOKING_HISTORY],
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
        path: PUBLIC_ROUTES.SEARCH_BOOKING,
        element: PUBLIC_SCREENS[PUBLIC_ROUTES.SEARCH_BOOKING],
      },
      {
        path: PUBLIC_ROUTES.BOOKING_RESULT,
        element: PUBLIC_SCREENS[PUBLIC_ROUTES.BOOKING_RESULT],
      },
      {
        path: PUBLIC_ROUTES.BOOKING,
        element: PUBLIC_SCREENS[PUBLIC_ROUTES.BOOKING],
      },
      {
        path: PUBLIC_ROUTES.ABOUT,
        element: PUBLIC_SCREENS[PUBLIC_ROUTES.ABOUT],
      },
      {
        path: PUBLIC_ROUTES.CONTACT,
        element: PUBLIC_SCREENS[PUBLIC_ROUTES.CONTACT],
      },
      {
        path: PUBLIC_ROUTES.PAYMENT,
        element: PUBLIC_SCREENS[PUBLIC_ROUTES.PAYMENT],
      },
      {
        path: PUBLIC_ROUTES.RESULT_PAYMENT,
        element: PUBLIC_SCREENS[PUBLIC_ROUTES.RESULT_PAYMENT],
      },
      {
        path: PUBLIC_ROUTES.VNPAY_RETURN,
        element: PUBLIC_SCREENS[PUBLIC_ROUTES.VNPAY_RETURN],
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
