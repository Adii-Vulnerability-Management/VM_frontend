import { useEffect, useMemo, useState } from "react";
import { initURL } from "BaseUrl";
import CustomAxios from "@/config/CustomAxios";

const pickDocumentUrl = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;

  return (
    value?.documentUrl ||
    value?.document_url ||
    value?.url ||
    value?.signedUrl ||
    value?.signed_url ||
    value?.fileUrl ||
    value?.file_url ||
    value?.data?.documentUrl ||
    value?.data?.document_url ||
    value?.data?.url ||
    value?.data?.signedUrl ||
    value?.data?.signed_url ||
    value?.body?.documentUrl ||
    value?.body?.document_url ||
    value?.body?.url ||
    value?.body?.signedUrl ||
    value?.body?.signed_url ||
    ""
  );
};

export const normalizeDocumentUrl = (rawUrl, baseUrl = "") => {
  const raw = String(rawUrl || "").trim();
  if (!raw || raw === "null" || raw === "undefined") return "";

  const fixed = raw
    .replace(
      "https://dev.grc3.iomandate-management",
      `https://dev.grc3.io/${initURL}/mandate-management`,
    )
    .replace(
      "http://dev.grc3.iomandate-management",
      `http://dev.grc3.io/${initURL}/mandate-management`,
    );

  if (/^https?:\/\//i.test(fixed)) {
    try {
      const url = new URL(fixed);
      if (url.pathname.startsWith(`/${initURL}/mandate-management/documents/`)) {
        url.pathname = url.pathname.replace(`/${initURL}`, "");
      }
      return url.toString();
    } catch {
      return fixed;
    }
  }

  const normalizedBase = String(baseUrl || "").replace(/\/+$/, "");
  const normalizedPath = fixed.startsWith("/") ? fixed : `/${fixed}`;
  const apiPath = normalizedPath.startsWith(
    `/${initURL}/mandate-management/documents/`,
  )
    ? normalizedPath.replace(`/${initURL}`, "")
    : normalizedPath;

  return `${normalizedBase}${apiPath}`;
};

const readBlobAsText = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsText(blob);
  });

const getMandateId = (value) =>
  value?.id || value?._id || value?.mandateId || value?.uuid || "";

const isHtmlResponse = (contentType, data) =>
  contentType.includes("text/html") ||
  (typeof data === "string" &&
    /<html|<!doctype html|please enter your login details/i.test(data));

export default function DocumentPreview({
  mandate,
  mandateId,
  documentUrl,
  baseUrl = "",
}) {
  const [open, setOpen] = useState(false);
  const [resolvedHref, setResolvedHref] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");

  const fallbackHref = useMemo(
    () => normalizeDocumentUrl(documentUrl, baseUrl),
    [baseUrl, documentUrl],
  );

  const resolvedMandateId = mandateId || getMandateId(mandate);
  const docHref = resolvedMandateId ? resolvedHref : fallbackHref;

  useEffect(() => {
    return () => {
      if (resolvedHref.startsWith("blob:")) {
        URL.revokeObjectURL(resolvedHref);
      }
    };
  }, [resolvedHref]);

  const openPreview = async () => {
    setOpen(true);
    setPreviewError("");

    if (!resolvedMandateId) return;

    try {
      setLoading(true);
      const sourceParam = fallbackHref
        ? `&source=${encodeURIComponent(fallbackHref)}`
        : "";
      const res = await CustomAxios.get(
        `/api/mandate-document?id=${encodeURIComponent(
          resolvedMandateId,
        )}${sourceParam}`,
        { responseType: "blob" },
      );
      const contentType = String(res?.headers?.["content-type"] || "");
      let nextUrl = "";

      if (contentType.includes("application/json")) {
        const text = await readBlobAsText(res?.data);
        const payload = JSON.parse(text || "{}");
        const message =
          payload?.message ||
          payload?.error ||
          pickDocumentUrl(payload) ||
          "Unable to load document.";
        throw new Error(message);
      } else if (res?.data instanceof Blob) {
        const text =
          contentType.includes("text/html") || contentType.includes("application/json")
          ? await readBlobAsText(res.data)
          : "";

        if (contentType.includes("application/json")) {
          const payload = JSON.parse(text || "{}");
          throw new Error(
            payload?.message || payload?.error || "Unable to load document.",
          );
        }

        if (isHtmlResponse(contentType, text)) {
          throw new Error(
            "Document request returned the login page. Please refresh and sign in again.",
          );
        }

        nextUrl = URL.createObjectURL(res.data);
      } else {
        nextUrl = normalizeDocumentUrl(pickDocumentUrl(res?.data), baseUrl);
      }

      if (nextUrl) {
        setResolvedHref((previous) => {
          if (previous.startsWith("blob:")) URL.revokeObjectURL(previous);
          return nextUrl;
        });
      } else {
        setPreviewError("Document URL is not available.");
      }
    } catch (error) {
      let message = error?.message || "Unable to load document preview.";

      if (error?.response?.data instanceof Blob) {
        try {
          const text = await readBlobAsText(error.response.data);
          const payload = JSON.parse(text || "{}");
          const attempts = Array.isArray(payload?.attempts)
            ? payload.attempts
            : [];

          const attemptText = attempts
            .map((attempt) => `${attempt.status}: ${attempt.url}`)
            .join("\n");

          message = payload?.message || payload?.error || attemptText || message;
        } catch (_) {}
      } else {
        message =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          message;
      }

      setPreviewError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!fallbackHref && !resolvedMandateId) return "-";

  return (
    <>
      <button
        type="button"
        onClick={openPreview}
        className="inline-flex h-9 min-w-[120px] items-center justify-center whitespace-nowrap rounded-lg bg-[#050038] px-4 text-xs font-semibold text-white transition hover:bg-[#1E335A]"
      >
        View Document
      </button>

      {open ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 bg-[#f8fbff] px-4 py-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#050038]">
                  PDF Preview
                </p>
                <p className="text-[14px] font-bold text-slate-800">
                  Uploaded PDF
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full px-3 py-1 text-[18px] font-bold text-slate-500 hover:bg-slate-100"
                aria-label="Close document preview"
              >
                x
              </button>
            </div>

            <div className="flex h-[75vh] items-center justify-center bg-slate-100">
              {loading ? (
                <p className="text-sm font-semibold text-slate-600">
                  Loading document...
                </p>
              ) : previewError ? (
                <div className="max-w-lg rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {previewError}
                </div>
              ) : docHref ? (
                <iframe
                  src={docHref}
                  title="PDF Preview"
                  className="h-full w-full"
                />
              ) : (
                <p className="text-sm font-semibold text-slate-600">
                  Document URL is not available.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-[#f8fbff] px-4 py-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 min-w-[88px] items-center justify-center whitespace-nowrap rounded-lg bg-[#050038] px-3 text-[12px] font-semibold text-white shadow-sm transition hover:bg-[#1E335A]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
