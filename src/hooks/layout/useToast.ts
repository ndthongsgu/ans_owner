import { useToastContext } from "@/components/toast";

export const useToast = () => {
  const { showToast } = useToastContext();
  return showToast;
};
