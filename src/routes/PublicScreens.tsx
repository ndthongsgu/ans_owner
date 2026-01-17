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
const BookingResultScreen = lazy(
  () => import("../pages/publics/search-booking/result-search")
);
const BookingScreen = lazy(() => import("../pages/publics/booking"));
const ContactScreen = lazy(() => import("../pages/publics/contact"));
const PaymentScreen = lazy(() => import("../pages/publics/payment"));
const ResultPaymentScreen = lazy(
  () => import("../pages/publics/payment/result-booking")
);
const VNPayReturnPage = lazy(
  () => import("../pages/publics/payment/vnpay-return")
);

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
  [PUBLIC_ROUTES.BOOKING_RESULT]: <BookingResultScreen />,
  [PUBLIC_ROUTES.BOOKING]: <BookingScreen />,
  [PUBLIC_ROUTES.CONTACT]: <ContactScreen />,
  [PUBLIC_ROUTES.PAYMENT]: <PaymentScreen />,
  [PUBLIC_ROUTES.RESULT_PAYMENT]: <ResultPaymentScreen />,
  [PUBLIC_ROUTES.VNPAY_RETURN]: <VNPayReturnPage />,
};
