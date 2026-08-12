// components/ui/Button.js
import React from "react";

export default function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  className = "",
  ...props
}) {
  const base = [
    "cursor-pointer",
    "px-3", // slimmer
    "py-1.5", // shorter
    "rounded-lg",
    "font-medium",
    "text-sm", // smaller text
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-offset-2",
    "transition",
    "disabled:opacity-50",
    "disabled:cursor-not-allowed",
  ].join(" ");

  const variants = {
    primary: "bg-[#2B245C] hover:bg-[#1F1A4A] text-white focus:ring-[#2B245C]",
    outline:
      "border border-[#2B245C] text-[#2B245C] hover:bg-[#2B245C] hover:text-white focus:ring-[#2B245C]",
  };

  const classes = [base, variants[variant] || variants.primary, className]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      onClick={onClick}
      className={classes}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
