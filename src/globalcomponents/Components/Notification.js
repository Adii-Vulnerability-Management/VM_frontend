// File: sendNotification.js
import CustomAxios from "../CustomAxios";
import { baseurl, initURL } from "../../../BaseUrl";

const sendNotification = async (opts = {}) => {
  const {
    action, // preferred key
    actionType, // older key some callers use
    payload = {},
    onSuccess,
    onError,
  } = opts;

  // normalize action
  const finalAction =
    (typeof action === "string" && action.trim()) ||
    (typeof actionType === "string" && actionType.trim()) ||
    "default";

  if (!finalAction) {
    const err = new Error(
      "sendNotification: 'action' must be a non-empty string"
    );
    console.error(err);
    if (onError) onError(err);
    throw err;
  }
  if (payload == null || typeof payload !== "object") {
    const err = new Error("sendNotification: 'payload' must be an object");
    console.error(err);
    if (onError) onError(err);
    throw err;
  }

  const endpoint = `${baseurl}/${initURL}/notifications`;
  const body = { action: finalAction, payload };

  console.log("Sending notification", body);

  try {
    const res = await CustomAxios.post(endpoint, body, {
      headers: { "Content-Type": "application/json" },
    });
    if (res?.data?.success) {
      console.log("Notification success:", res.data);
      onSuccess?.(res.data);
    } else {
      console.error("Notification error:", res?.data);
      onError?.(res?.data);
    }
    return res?.data;
  } catch (err) {
    console.error("Notification request failed:", err);
    onError?.(err);
    throw err;
  }
};

export default sendNotification;
