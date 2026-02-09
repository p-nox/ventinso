import React from "react";
import { API_URLS } from "@config/Config"

export default function Avatar({ src }) {
  //console.log("Avatar src:", src)
  return (
    <img
      src={API_URLS.AVATAR_FILE(src)}
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