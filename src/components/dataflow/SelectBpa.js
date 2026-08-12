// src/components/dataflow/SelectBpa.js
import React from "react";
import { baseurl, initURL } from "@/config/config";
import RemoteSelect from "./RemoteSelect";

const BPA_ENDPOINT = `${baseurl}/${initURL}/dataflow/bpas`;

export default function SelectBpa({ value, onChange, className }) {
  return (
    <RemoteSelect
      label="BPA"
      placeholder="Select a Business Process Activity"
      value={value}
      onChange={onChange}
      endpoint={BPA_ENDPOINT}
      toOptions={(b) => ({ value: b._id || b.id, label: b.name })}
      queryParam="search"
      extraParams={{ limit: 50 }}
      className={className}
    />
  );
}
