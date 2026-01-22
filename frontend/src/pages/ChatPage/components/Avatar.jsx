import React from "react";
import { API_BASE_URL } from "@config/Config"

export default function Avatar({ src }) {
  return (
    <img
      src={`${API_BASE_URL}${src}`}
      alt="avatar"
      style={{
        width: "35px",
        height: "35px",
        borderRadius: "50%",
        objectFit: "cover",
      }}
    />
  );
}