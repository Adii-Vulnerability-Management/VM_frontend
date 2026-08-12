// File: sendNotification.js
import CustomAxios from "@/config/CustomAxios";
import { baseurl, initURL } from "@/config/config";

const sendNotification = async ({
  templateId,
  recipientEmail,
  variables = {},
  actionType,
  payload = {},
  onSuccess,
  onError,
}) => {
  try {
    const endpoint = `${baseurl}/${initURL}/notifications`;
    const isTemplatePayload = !!templateId || !!recipientEmail;

    const body = isTemplatePayload
      ? {
          templateId,
          recipientEmail,
          variables,
        }
      : {
          action: actionType,
          payload,
        };

    const response = await CustomAxios.post(endpoint, body);

    if (response.data?.success) {
      if (onSuccess) onSuccess(response.data);
    } else {
      if (onError) onError(response.data);
    }
  } catch (err) {
    if (onError) onError(err);
  }
};

export default sendNotification;
