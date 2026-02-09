import React from "react";
import { Toaster } from "react-hot-toast";
import CustomToast from "./CustomToast";

export default function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{ duration: 3000 }}
      containerStyle={{ pointerEvents: "none" }} 
      render={(t) => (
        <CustomToast
          id={t.id}
          title={t.title || ""}
          message={t.message}
          type={t.type || "info"}
          icon={t.icon}
          duration={t.duration || 3000}
        />
      )}
    />
  );
}
