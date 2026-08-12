import { baseurl, initURL } from "BaseUrl";

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
    value?.s3Url ||
    value?.s3_url ||
    value?.s3Key ||
    value?.s3_key ||
    value?.documentKey ||
    value?.document_key ||
    value?.fileKey ||
    value?.file_key ||
    value?.data?.documentUrl ||
    value?.data?.document_url ||
    value?.data?.url ||
    value?.data?.signedUrl ||
    value?.data?.signed_url ||
    value?.data?.s3Url ||
    value?.data?.s3_url ||
    value?.data?.s3Key ||
    value?.data?.s3_key ||
    value?.data?.documentKey ||
    value?.data?.document_key ||
    value?.data?.fileKey ||
    value?.data?.file_key ||
    value?.body?.documentUrl ||
    value?.body?.document_url ||
    value?.body?.url ||
    value?.body?.signedUrl ||
    value?.body?.signed_url ||
    value?.body?.s3Url ||
    value?.body?.s3_url ||
    value?.body?.s3Key ||
    value?.body?.s3_key ||
    value?.body?.documentKey ||
    value?.body?.document_key ||
    value?.body?.fileKey ||
    value?.body?.file_key ||
    ""
  );
};

const toAbsoluteUrl = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;

  const base = String(baseurl || process.env.NEXT_PUBLIC_API_BASE_URL || "")
    .replace(/\/+$/, "");
  const path = raw.startsWith("/") ? raw : `/${raw}`;

  return `${base}${path}`;
};

const getDocumentFileName = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";

  try {
    const url = /^https?:\/\//i.test(raw)
      ? new URL(raw)
      : new URL(raw.startsWith("/") ? raw : `/${raw}`, "https://local");
    const last = url.pathname.split("/").filter(Boolean).pop() || "";
    return decodeURIComponent(last);
  } catch (_) {
    const last = raw.split("?")[0].split("/").filter(Boolean).pop() || "";
    try {
      return decodeURIComponent(last);
    } catch {
      return last;
    }
  }
};

const getDocumentEndpointUrl = (fileName) => {
  const name = String(fileName || "").trim();
  if (!name) return "";

  return toAbsoluteUrl(
    `/${initURL}/mandate-management/documents/${encodeURIComponent(name)}`,
  );
};

const getDocumentUrlCandidates = (value) => {
  const absolute = toAbsoluteUrl(value);
  const fileName = getDocumentFileName(value);
  const documentEndpoint = getDocumentEndpointUrl(fileName);
  if (!absolute && !documentEndpoint) return [];

  const candidates = new Set([documentEndpoint, absolute].filter(Boolean));

  try {
    const url = new URL(absolute);
    const withPrefix = `/${initURL}/mandate-management/documents/`;
    const withoutPrefix = "/mandate-management/documents/";

    if (url.pathname.startsWith(withoutPrefix)) {
      const next = new URL(url.toString());
      next.pathname = `/${initURL}${url.pathname}`;
      candidates.add(next.toString());
    }

    if (url.pathname.startsWith(withPrefix)) {
      const next = new URL(url.toString());
      next.pathname = url.pathname.replace(`/${initURL}`, "");
      candidates.add(next.toString());
    }
  } catch (_) {}

  return Array.from(candidates);
};

const buildForwardHeaders = (req) => {
  const headers = {};

  if (req.headers.authorization) headers.authorization = req.headers.authorization;
  if (req.headers.cookie) headers.cookie = req.headers.cookie;
  if (req.headers["x-tenant-id"]) headers["x-tenant-id"] = req.headers["x-tenant-id"];
  if (req.headers["x-refresh-token"]) {
    headers["x-refresh-token"] = req.headers["x-refresh-token"];
  }

  return headers;
};

const sendUpstreamResponse = async (upstream, res) => {
  const contentType = upstream.headers.get("content-type") || "application/pdf";
  const contentDisposition = upstream.headers.get("content-disposition");
  const buffer = Buffer.from(await upstream.arrayBuffer());

  res.status(upstream.status);
  res.setHeader("Content-Type", contentType);
  res.setHeader("Cache-Control", "no-store");
  if (contentDisposition) res.setHeader("Content-Disposition", contentDisposition);
  res.send(buffer);
};

const fetchFirstAvailableDocument = async (urls, headers) => {
  const attempts = [];

  for (const url of urls) {
    const response = await fetch(url, { headers });
    const contentType = response.headers.get("content-type") || "";

    attempts.push({
      url,
      status: response.status,
      contentType,
    });

    if (response.ok) {
      return { response, attempts };
    }
  }

  return { response: null, attempts };
};

export const handleMandateDocumentProxy = async (req, res, rawId) => {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const rawSource = Array.isArray(req.query.source)
    ? req.query.source[0]
    : req.query.source;
  const sourceUrl = toAbsoluteUrl(rawSource);

  if (!id) {
    res.status(400).json({ message: "Mandate id is required." });
    return;
  }

  try {
    const headers = buildForwardHeaders(req);
    const resolverUrl = toAbsoluteUrl(
      `/${initURL}/mandate-management/${encodeURIComponent(id)}/document-url`,
    );

    const resolverRes = await fetch(resolverUrl, { headers });
    const resolverContentType = resolverRes.headers.get("content-type") || "";

    if (!resolverRes.ok && sourceUrl) {
      const { response, attempts } = await fetchFirstAvailableDocument(
        getDocumentUrlCandidates(sourceUrl),
        headers,
      );

      if (response) {
        await sendUpstreamResponse(response, res);
        return;
      }

      res.status(404).json({
        message: "Mandate document was not found on the backend.",
        resolverStatus: resolverRes.status,
        attempts,
      });
      return;
    }

    if (!resolverContentType.includes("application/json")) {
      await sendUpstreamResponse(resolverRes, res);
      return;
    }

    const payload = await resolverRes.json();
    const documentUrl = toAbsoluteUrl(pickDocumentUrl(payload));

    if (!documentUrl) {
      if (sourceUrl) {
        const { response, attempts } = await fetchFirstAvailableDocument(
          getDocumentUrlCandidates(sourceUrl),
          headers,
        );

        if (response) {
          await sendUpstreamResponse(response, res);
          return;
        }

        res.status(404).json({
          message: "Mandate document URL is not available from the resolver.",
          attempts,
        });
        return;
      }

      res.status(404).json({ message: "Document URL is not available." });
      return;
    }

    const candidates = [
      ...getDocumentUrlCandidates(documentUrl),
      ...getDocumentUrlCandidates(sourceUrl),
    ];
    const { response, attempts } = await fetchFirstAvailableDocument(
      Array.from(new Set(candidates)),
      headers,
    );

    if (response) {
      await sendUpstreamResponse(response, res);
      return;
    }

    res.status(404).json({
      message: "Mandate document was not found on the backend.",
      attempts,
    });
  } catch (error) {
    res.status(500).json({
      message: error?.message || "Unable to load mandate document.",
    });
  }
};
