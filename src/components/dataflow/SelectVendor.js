// src/components/dataflow/SelectVendor.js
import React from "react";
import { baseurl, initURL } from "@/config/config";
import RemoteSelect from "./RemoteSelect";

const VENDOR_ENDPOINT = `${baseurl}/${initURL}/dataflow/vendors`; // ✅ plural

export default function SelectVendor({ value, onChange, className }) {
  return (
    <RemoteSelect
      label="Vendor"
      placeholder="Search vendors…"
      value={value}
      onChange={onChange}
      endpoint={VENDOR_ENDPOINT}
      toOptions={(v) => ({
        value: v._id || v.id,
        label: v.name || v.displayName || v.legalName,
      })}
      queryParam="search"
      extraParams={{ limit: 50 }}
      className={className}
    />
  );
}
