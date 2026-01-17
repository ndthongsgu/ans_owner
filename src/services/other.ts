export const handleGoogleLogin = () => {
  window.location.href = `${
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/bookvexe-be-j2e"
  }/oauth2/authorization/google`;
};
