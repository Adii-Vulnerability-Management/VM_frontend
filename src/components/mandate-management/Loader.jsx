"use client";

import React from "react";
import styles from "./Loader.module.css";

function cx(...c) {
  return c.filter(Boolean).join(" ");
}

export default function Loader({
  show = false,
  label = "Loading...",
  fullScreen = true,
  blur = true,
  className = "",
}) {
  if (!show) return null;

  const loaderUI = (
    <div
      className={cx(styles.loaderWrap, className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <p className={styles.loaderText}>{label}</p>
      <div className={styles.loader}>
        <span className={styles.load} />
      </div>
    </div>
  );

  if (!fullScreen) return loaderUI;

  return (
    <div
      className={cx(
        "fixed inset-0 z-[9999] flex items-center justify-center px-4",
        "bg-black/25", // overlay only
        blur ? "backdrop-blur-[2px]" : "",
      )}
    >
      {loaderUI}
    </div>
  );
}
