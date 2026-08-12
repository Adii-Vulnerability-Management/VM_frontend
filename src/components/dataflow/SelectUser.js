// src/components/dataflow/SelectUser.js
import React from "react";
import { baseurl, initURL } from "@/config/config";
import RemoteSelect from "./RemoteSelect";

const USER_ENDPOINT = `${baseurl}/${initURL}/apiv1/users/db`;

export default function SelectUser({ value, onChange, className, disabled }) {
  return (
    <RemoteSelect
      label="User"
      placeholder="Search users…"
      value={value}
      onChange={onChange}
      endpoint={USER_ENDPOINT}
      toOptions={(user) => ({
        value: user._id || user.id,
        label: `${user.user_name || user.fullName || "Unnamed User"}${
          user.email ? ` (${user.email})` : ""
        }`,
        // label: user.name || user.fullName || user.email,
      })}

   
      queryParam="search"
      extraParams={{ limit: 50 }}
      className={className}
      disabled={disabled}
    />
  );
}