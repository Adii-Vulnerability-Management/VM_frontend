// components/ui/Toast.js
import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const containerProps = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  newestOnTop: true,
  closeOnClick: true,
  rtl: false,
  pauseOnFocusLoss: true,
  draggable: true,
  pauseOnHover: true,
};

const baseStyle = {
  background: "#2B245C",
  color: "#fff",
  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
};

const variantColors = {
  success: "#10b981",
  error: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
};

export const toastSuccess = (msg) =>
  toast(msg, {
    ...containerProps,
    style: { ...baseStyle, borderLeft: `4px solid ${variantColors.success}` },
    icon: "✅",
  });

export const toastError = (msg) =>
  toast(msg, {
    ...containerProps,
    style: { ...baseStyle, borderLeft: `4px solid ${variantColors.error}` },
    icon: "❌",
  });

export const toastWarning = (msg) =>
  toast(msg, {
    ...containerProps,
    style: { ...baseStyle, borderLeft: `4px solid ${variantColors.warning}` },
    icon: "⚠️",
  });

export const toastInfo = (msg) =>
  toast(msg, {
    ...containerProps,
    style: { ...baseStyle, borderLeft: `4px solid ${variantColors.info}` },
    icon: "ℹ️",
  });

export default function Toast() {
  return <ToastContainer {...containerProps} />;
}
