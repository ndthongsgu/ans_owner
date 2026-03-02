import { lazy } from "react";
import { PUBLIC_ROUTES } from "./routes";
import RegisterPage from "@/pages/auth/RegisterPage";

const HomeScreen = lazy(() => import("../pages/publics/home"));
const LoginScreen = lazy(() => import("../pages/auth/LoginPage"));
// const RegisterScreen = lazy(() => import("../pages/auth/register"));
const ForgotPasswordScreen = lazy(
  () => import("../pages/auth/ForgotPasswordPage")
);
const ResetPasswordScreen = lazy(
  () => import("../pages/auth/ResetPasswordPage")
);
const OAuthCallbackPage = lazy(() => import("@/pages/auth/OAuthCallbackPage"));
const AboutScreen = lazy(() => import("../pages/publics/about"));
const SearchBookingScreen = lazy(
  () => import("../pages/publics/search-booking")
);
const BookingScreen = lazy(() => import("../pages/publics/booking"));
const ContactScreen = lazy(() => import("../pages/publics/contact"));

export const PUBLIC_SCREENS = {
  [PUBLIC_ROUTES.HOME]: <HomeScreen />,
  [PUBLIC_ROUTES.LOGIN]: <LoginScreen />,
  // [PUBLIC_ROUTES.REGISTER]: <RegisterScreen />,
  [PUBLIC_ROUTES.REGISTER]: <RegisterPage />,
  [PUBLIC_ROUTES.ABOUT]: <AboutScreen />,
  [PUBLIC_ROUTES.FORGOT_PASSWORD]: <ForgotPasswordScreen />,
  [PUBLIC_ROUTES.RESET_PASSWORD]: <ResetPasswordScreen />,
  [PUBLIC_ROUTES.OAUTH_CALLBACK]: <OAuthCallbackPage />,
  [PUBLIC_ROUTES.SEARCH_BOOKING]: <SearchBookingScreen />,
  [PUBLIC_ROUTES.BOOKING]: <BookingScreen />,
  [PUBLIC_ROUTES.CONTACT]: <ContactScreen />,
};
