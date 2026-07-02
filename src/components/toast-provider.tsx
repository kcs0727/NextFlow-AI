"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={16}
        toastOptions={{
          duration: 3000,
          style: {
            background: "white",
            color: "black",
            border: "1px solid rgba(255, 255, 255, 1)",
            backdropFilter: "blur(12px)",
          },
          success: {
            style: {
              background: "white",
              color:"green",
              borderColor: "rgba(16, 185, 129, 1)",
            },
          },
          error: {
            style: {
              background: "white",
              color: "red",
              borderColor: "rgba(244, 63, 94, 1)",
            },
            duration: 5000,
          },
        }}
      />
    </>
  );
}
