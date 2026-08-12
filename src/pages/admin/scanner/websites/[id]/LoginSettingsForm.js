// src/cmp/components/LoginSettingsForm.js
import Button from "@/components/ui/Button";
import React from "react";
// import { Button } from '@/components/ui/button' // or just use a <button>

export default function LoginSettingsForm({ loginSettings = {}, onChange }) {
  // helper to update nested field
  const update = (path, value) => {
    const parts = path.split(".");
    onChange((prev) => {
      const next = { ...prev };
      let cur = next;
      for (let i = 0; i < parts.length - 1; i++) {
        cur[parts[i]] = { ...cur[parts[i]] };
        cur = cur[parts[i]];
      }
      cur[parts[parts.length - 1]] = value;
      return next;
    });
  };

  // helper to manage array fields
  const updateArray = (key, idx, value) => {
    onChange((prev) => {
      const arr = [...(prev.loginSettings[key] || [])];
      arr[idx] = value;
      return {
        ...prev,
        loginSettings: {
          ...prev.loginSettings,
          [key]: arr,
        },
      };
    });
  };
  const addToArray = (key) => {
    onChange((prev) => ({
      ...prev,
      loginSettings: {
        ...prev.loginSettings,
        [key]: [...(prev.loginSettings[key] || []), ""],
      },
    }));
  };
  const removeFromArray = (key, idx) => {
    onChange((prev) => {
      const arr = [...(prev.loginSettings[key] || [])];
      arr.splice(idx, 1);
      return { ...prev, loginSettings: { ...prev.loginSettings, [key]: arr } };
    });
  };

  const {
    loginPath,
    loginUsername,
    loginPassword,
    usernameSelectors = [],
    passwordSelectors = [],
    submitSelectors = [],
  } = loginSettings;

  return (
    <fieldset className="border px-5 py-3 rounded-lg space-y-5">
      <legend className="font-bold text-[#2B245C] uppercase tracking-wide">
        Login Settings (Optional)
      </legend>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          Login Path
        </label>
        <input
          id="ls-loginPath"
          type="text"
          value={loginPath || ""}
          onChange={(e) => update("loginSettings.loginPath", e.target.value)}
          placeholder="/login"
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          Login Username
        </label>
        <input
          type="text"
          id="ls-username"
          value={loginUsername || ""}
          onChange={(e) =>
            update("loginSettings.loginUsername", e.target.value)
          }
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          Login Password
        </label>
        <input
          id="ls-password"
          type="password"
          value={loginPassword || ""}
          onChange={(e) =>
            update("loginSettings.loginPassword", e.target.value)
          }
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
        />
      </div>

      {[
        {
          key: "usernameSelectors",
          label: "Username Selectors",
          id: "ls-userSel",
        },
        {
          key: "passwordSelectors",
          label: "Password Selectors",
          id: "ls-passSel",
        },
        {
          key: "submitSelectors",
          label: "Submit Button Selectors",
          id: "ls-submitSel",
        },
      ].map(({ key, label, id }) => (
        <div key={key}>
          <p className="block text-xs font-semibold text-gray-700 mb-2" id={id}>
            {label}
          </p>
          {(loginSettings[key] || []).map((sel, idx) => (
            <div className="flex items-center space-x-2 mb-1" key={idx}>
              <input
                type="text"
                value={sel}
                onChange={(e) => updateArray(key, idx, e.target.value)}
                placeholder={`e.g. ${key === "usernameSelectors" ? "#user" : key === "passwordSelectors" ? "#pass" : "button[type=submit]"}`}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              />
              <button
                type="button"
                onClick={() => removeFromArray(key, idx)}
                className="text-red-500 hover:text-red-700"
              >
                &times;
              </button>
            </div>
          ))}
          <Button
            type="button"
            onClick={() => addToArray(key)}
            className="mt-1 p-2 border rounded-lg text-sm"
          >
            + Add selector
          </Button>
        </div>
      ))}
    </fieldset>
  );
}
