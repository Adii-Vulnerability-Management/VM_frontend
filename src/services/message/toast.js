import { toast } from "react-toastify";

const toastOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  newestOnTop: true,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  draggable: true,
  pauseOnHover: true,
};

export const useToast = () => {
  return (message, type = "info") => {
    const msg = String(message || "");
    switch (String(type || "").toLowerCase()) {
      case "success":
        return toast.success(msg, toastOptions);
      case "error":
        return toast.error(msg, toastOptions);
      case "warning":
      case "warn":
        return toast.warning(msg, toastOptions);
      case "info":
      default:
        return toast.info(msg, toastOptions);
    }
  };
};

