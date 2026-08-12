import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import CustomAxios from "@/config/CustomAxios";
import { baseurl, initURL } from "@/config/config";
import Image from "next/image";
import { toast } from "react-toastify";
import GuideButton from "@/components/Tour/GuideButton";
import Tour from "@/components/Tour/Tour";

function Field({ label, name, hint, children, required = false, errors = {} }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {required ? <span className="ml-1 text-red-600">*</span> : null}
      </label>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
      <div className="mt-1.5">{children}</div>
      {errors[name] ? (
        <p className="mt-1.5 text-xs text-red-600" role="alert">
          {errors[name]}
        </p>
      ) : null}
    </div>
  );
}

function AccordionSection({
  title,
  sectionKey,
  openSection,
  setOpenSection,
  dataTour, // Add this prop
  children,
}) {
  const isOpen = openSection === sectionKey;

  return (
    <section className="rounded-2xl border border-[#2B245C] bg-white shadow-lg hover:shadow-2xl transition-shadow duration-300">
      <button
        type="button"
        title={`Click to ${isOpen ? 'collapse' : 'expand'} ${title}`}
        data-tour={dataTour} // Add this attribute
        onClick={() => setOpenSection(isOpen ? "" : sectionKey)}
        className="flex w-full items-center justify-between rounded-2xl bg-blue-50 px-6 py-4 text-left hover:bg-blue-100 hover:shadow-md transition-shadow duration-300"
      >
        <h2 className="text-2xl font-bold text-[#2B245C]">{title}</h2>
        <span className="text-xl font-bold text-[#2B245C]">
          {isOpen ? "−" : "+"}
        </span>
      </button>

      {isOpen && (
        <div className="p-6">{children}</div>
      )}
    </section>
  );
}

export default function ChildConsentConfigPage() {
  const router = useRouter();
  const { id, wId } = router.query;

  const isNew = router.isReady && id === "new";

  const STATIC_TENANT_ID = "NA";
  const axiosTenantConfig = useMemo(
    () => ({ headers: { "x-tenant-id": STATIC_TENANT_ID } }),
    [],
  );

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [websites, setWebsites] = useState([]);
  const [loadingWebsites, setLoadingWebsites] = useState(false);
  const [policies, setPolicies] = useState([]);
  const [loadingPolicies, setLoadingPolicies] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState("");
  const [errors, setErrors] = useState({});
  const [configs, setConfigs] = useState([]);
  const [configsError, setConfigsError] = useState("");
  const [copiedId, setCopiedId] = useState("");
  const [openSection, setOpenSection] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [tourOpen, setTourOpen] = useState(false);

  const getDefaultForm = () => ({
    domain: "",
    formId: "f_child_consent_widget",
    flowType: "child_consent",
    showModal: false,
    title: "Child Consent Form",
    subtitle: "Please complete the appropriate consent flow.",
    submitLabel: "Submit Consent",
    policyVersion: "v1",
    consentVersion: "v1",
    branding: {
      name: "",
      logoUrl: "",
      logoAlt: "",
    },
    theme: {
      primaryColor: "#4f46e5",
      primaryHoverColor: "#4338ca",
    },
    settings: {
      minorAgeThreshold: 18,
      requireParentVerification: true,
      requireRelationship: true,
      requirePhone: false,
      verificationMethod: "otp",
      relationshipOptions: ["Mother", "Father", "Legal Guardian", "Other"],
    },
    consentStatements: {
      intro:
        "If the user is under the required age, parent or guardian consent is required.",
      identityNote:
        "Date of birth is used to determine the applicable consent path.",
      adult:
        "You may provide your own consent if you meet the minimum age threshold.",
      adultCheckbox:
        "I have read and agree to the privacy notice and consent terms.",
      minorNotice: "A parent or guardian must provide consent for minors.",
      guardianDeclaration:
        "I confirm that I am the parent or legal guardian of the child.",
      guardianCheckbox:
        "I consent to the collection and processing of the child’s personal data as described.",
      footerNote:
        "Submission records are logged for audit and compliance purposes.",
    },
    isActive: true,
  });

  const safeParse = (value) => {
    if (!value) return {};
    if (typeof value === "object") return value;
    if (typeof value !== "string") return {};
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  };

  const normalizeDomain = (value) =>
    String(value || "")
      .trim()
      .replace(/^https?:\/\//i, "")
      .replace(/\/+$/, "");

  const mapConfigToForm = (cfg) => {
    const branding = safeParse(cfg?.branding);
    const theme = safeParse(cfg?.theme);
    const settings = safeParse(cfg?.settings);
    const consentStatements = safeParse(cfg?.consentStatements);

    return {
      domain: cfg?.domain || "",
      formId: cfg?.formId || "f_child_consent_widget",
      flowType: cfg?.flowType || "child_consent",
      showModal: !!cfg?.showModal,
      title: cfg?.title || "Child Consent Form",
      subtitle:
        cfg?.subtitle || "Please complete the appropriate consent flow.",
      submitLabel: cfg?.submitLabel || "Submit Consent",
      policyVersion: cfg?.policyVersion || "v1",
      consentVersion: cfg?.consentVersion || "v1",
      branding: {
        name: branding?.name || "",
        logoUrl: branding?.logoUrl || "",
        logoAlt: branding?.logoAlt || "",
      },
      theme: {
        primaryColor: theme?.primaryColor || "#4f46e5",
        primaryHoverColor: theme?.primaryHoverColor || "#4338ca",
      },
      settings: {
        minorAgeThreshold: settings?.minorAgeThreshold ?? 18,
        requireParentVerification: settings?.requireParentVerification ?? true,
        requireRelationship: settings?.requireRelationship ?? true,
        requirePhone: settings?.requirePhone ?? false,
        verificationMethod: settings?.verificationMethod || "otp",
        relationshipOptions: settings?.relationshipOptions || [
          "Mother",
          "Father",
          "Legal Guardian",
          "Other",
        ],
      },
      consentStatements: {
        intro:
          consentStatements?.intro ||
          "If the user is under the required age, parent or guardian consent is required.",
        identityNote:
          consentStatements?.identityNote ||
          "Date of birth is used to determine the applicable consent path.",
        adult:
          consentStatements?.adult ||
          "You may provide your own consent if you meet the minimum age threshold.",
        adultCheckbox:
          consentStatements?.adultCheckbox ||
          "I have read and agree to the privacy notice and consent terms.",
        minorNotice:
          consentStatements?.minorNotice ||
          "A parent or guardian must provide consent for minors.",
        guardianDeclaration:
          consentStatements?.guardianDeclaration ||
          "I confirm that I am the parent or legal guardian of the child.",
        guardianCheckbox:
          consentStatements?.guardianCheckbox ||
          "I consent to the collection and processing of the child’s personal data as described.",
        footerNote:
          consentStatements?.footerNote ||
          "Submission records are logged for audit and compliance purposes.",
      },
      isActive: cfg?.isActive ?? true,
    };
  };

  const [form, setForm] = useState(getDefaultForm());

  const resetFormForNew = () => {
    setForm(getDefaultForm());
    setErrors({});
    setIsLoaded(false);
  };

  useEffect(() => {
    if (!router.isReady || isNew || !id) return;

    (async () => {
      setLoading(true);
      try {
        const res = await CustomAxios.get(
          `${baseurl}/${initURL}/child-consent-configs/${id}${wId ? `?wId=${wId}` : ""
          }`,
          axiosTenantConfig,
        );
        const cfg = res?.data?.data ?? res?.data ?? {};
        setForm(mapConfigToForm(cfg));
      } catch (err) {
        console.error(err);
        toast.error("Failed to load child consent config.");
      } finally {
        setLoading(false);
      }
    })();
  }, [router.isReady, id, isNew, wId]);

  const fetchConfigs = async () => {
    setListLoading(true);
    setConfigsError("");

    try {
      const { data } = await CustomAxios.get(
        `${baseurl}/${initURL}/child-consent-configs${wId ? `?wId=${wId}` : ""
        }`,
        axiosTenantConfig,
      );

      const normalized = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : data && typeof data === "object"
            ? [data]
            : [];

      setConfigs(normalized);
      setPage(1);
    } catch (err) {
      console.error(err);
      setConfigs([]);
      setConfigsError("Failed to load child consent configs.");
    } finally {
      setListLoading(false);
    }
  };

  const loadConfigByDomain = async (domainValue) => {
    const domain = normalizeDomain(domainValue);
    if (!domain) return;

    setListLoading(true);
    setConfigsError("");

    try {
      const { data } = await CustomAxios.get(
        `${baseurl}/${initURL}/child-consent-configs${wId ? `?wId=${wId}` : ""}`,
        axiosTenantConfig,
      );

      const normalized = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : data && typeof data === "object"
            ? [data]
            : [];

      const filtered = normalized.filter(
        (cfg) => normalizeDomain(cfg?.domain || "") === domain,
      );

      setConfigs(filtered);
      setPage(1);

      if (filtered.length > 0) {
        setForm(mapConfigToForm(filtered[0]));
        const selectedId = filtered[0]?._id || filtered[0]?.id;
        if (selectedId) {
          router.replace(
            {
              pathname: router.pathname,
              query: { ...router.query, id: selectedId },
            },
            undefined,
            { shallow: true },
          );
        }
      }
    } catch (err) {
      console.error(err);
      setConfigs([]);
      setConfigsError("Failed to load child consent configs for this domain.");
    } finally {
      setListLoading(false);
    }
  };

  const handleRowsPerPageChange = (e) => {
    const value = Number(e.target.value);
    setRowsPerPage(value);
    setPage(1);
  };

  const handleCancelEdit = () => {
    resetFormForNew();

    router.replace(
      {
        pathname: router.pathname,
        query: { ...router.query, id: "new" },
      },
      undefined,
      { shallow: true },
    );
  };

  useEffect(() => {
    if (!router.isReady) return;
    fetchConfigs();
  }, [router.isReady, wId]);

  useEffect(() => {
    let cancelled = false;

    async function fetchWebsites() {
      setLoadingWebsites(true);
      try {
        const res = await CustomAxios.get(
          `${baseurl}/${initURL}/cmp/websites`,
          axiosTenantConfig,
        );
        if (!cancelled) setWebsites(res.data || []);
      } catch (err) {
        console.error("Failed to load websites:", err);
        toast.warn("Failed to fetch websites.");
      } finally {
        if (!cancelled) setLoadingWebsites(false);
      }
    }

    fetchWebsites();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchPolicies() {
      setLoadingPolicies(true);
      try {
        const res = await CustomAxios.get(
          `${baseurl}/${initURL}/policy/all`,
          axiosTenantConfig,
        );
        const list = Array.isArray(res?.data) ? res.data : res?.data?.data || [];
        const normalized = Array.isArray(list)
          ? list.filter((p) => p?.Is_Deleted === false)
          : [];
        if (!cancelled) setPolicies(normalized);
      } catch (err) {
        console.error("Failed to load policies:", err);
        toast.warn("Failed to fetch privacy policies.");
      } finally {
        if (!cancelled) setLoadingPolicies(false);
      }
    }

    fetchPolicies();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!router.isReady || !isNew) return;

    const queryDomain = normalizeDomain(router.query.domain || "");
    if (!queryDomain) return;

    loadConfigByDomain(queryDomain);
  }, [router.isReady, router.query.domain, isNew, wId]);

  const previewStyles = useMemo(
    () => ({
      "--preview-primary": form.theme.primaryColor || "#4f46e5",
      "--preview-primary-hover": form.theme.primaryHoverColor || "#4338ca",
    }),
    [form.theme.primaryColor, form.theme.primaryHoverColor],
  );

  const handleTopChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleNestedChange = (section, field, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
    setErrors((prev) => ({ ...prev, [`${section}.${field}`]: "" }));
  };

  const handleDomainChange = (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, domain: value }));
    setErrors((prev) => ({ ...prev, domain: "" }));
  };

  const handleRelationshipOptionsChange = (value) => {
    setForm((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        relationshipOptions: value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      },
    }));
    setErrors((prev) => ({ ...prev, "settings.relationshipOptions": "" }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.domain.trim()) nextErrors.domain = "Domain is required.";
    if (!form.formId.trim()) nextErrors.formId = "Form ID is required.";
    if (!form.title.trim()) nextErrors.title = "Title is required.";
    if (!form.submitLabel.trim()) {
      nextErrors.submitLabel = "Submit label is required.";
    }
    if (!form.policyVersion.trim()) {
      nextErrors.policyVersion = "Privacy policy is required.";
    }
    if (!form.consentVersion.trim()) {
      nextErrors.consentVersion = "Version is required.";
    } else if (!/^\d+\.\d+$/.test(form.consentVersion.trim())) {
      nextErrors.consentVersion = "Version must be in X.Y format (e.g., 1.1).";
    }

    if (
      !form.settings.minorAgeThreshold ||
      Number(form.settings.minorAgeThreshold) < 1
    ) {
      nextErrors["settings.minorAgeThreshold"] =
        "Minor age threshold must be greater than 0.";
    }

    if (!form.settings.relationshipOptions.length) {
      nextErrors["settings.relationshipOptions"] =
        "At least one relationship option is required.";
    }

    if (!form.consentStatements.intro.trim()) {
      nextErrors["consentStatements.intro"] = "Intro text is required.";
    }

    if (!form.consentStatements.adultCheckbox.trim()) {
      nextErrors["consentStatements.adultCheckbox"] =
        "Adult checkbox text is required.";
    }

    if (!form.consentStatements.guardianCheckbox.trim()) {
      nextErrors["consentStatements.guardianCheckbox"] =
        "Guardian checkbox text is required.";
    }

    return nextErrors;
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = validateForm();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setSaving(true);

    const payload = {
      ...form,
      domain: normalizeDomain(form.domain),
      tenantId: STATIC_TENANT_ID,
    };

    try {
      if (isNew) {
        await CustomAxios.post(
          `${baseurl}/${initURL}/child-consent-configs${wId ? `?wId=${wId}` : ""
          }`,
          payload,
          axiosTenantConfig,
        );

        resetFormForNew();
        toast.success("Child consent config created successfully!");

        await fetchConfigs();

        router.replace(
          {
            pathname: router.pathname,
            query: {
              ...router.query,
              id: "new",
              domain: "",
            },
          },
          undefined,
          { shallow: true },
        );
      } else {
        await CustomAxios.patch(
          `${baseurl}/${initURL}/child-consent-configs/${id}${wId ? `?wId=${wId}` : ""
          }`,
          payload,
          axiosTenantConfig,
        );
        setIsLoaded(false);
        toast.success("Child consent config updated successfully!");
        await fetchConfigs();
      }
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Failed to save child consent config.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfig = async (configId) => {
    if (!configId) return;

    // const confirmed = window.confirm(
    //   "Are you sure you want to delete this config?",
    // );

    // if (!confirmed) return;

    setDeletingId(configId);

    try {
      await CustomAxios.delete(
        `${baseurl}/${initURL}/child-consent-configs/${configId}${wId ? `?wId=${wId}` : ""
        }`,
        axiosTenantConfig,
      );

      toast.success("Child consent config deleted successfully!");

      const isCurrentEditing = !isNew && String(id) === String(configId);

      if (isCurrentEditing) {
        resetFormForNew();
        router.replace(
          {
            pathname: router.pathname,
            query: { ...router.query, id: "new" },
          },
          undefined,
          { shallow: true },
        );
      }

      await fetchConfigs();
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message ||
        "Failed to delete child consent config.",
      );
    } finally {
      setDeletingId("");
    }
  };

  const getChildConsentScriptTag = (cfg) => {
    const domain = normalizeDomain(cfg?.domain || "");
    const configId = cfg?._id || "";
    const formId = cfg?.formId || "f_child_consent_widget";

    return `<div id="${formId}"></div>
<script
  src="${baseurl}/${initURL}/child-consent-runtime.js"
  data-domain="${domain}"
  data-form-id="${formId}"
  async
></script>`;
  };

  async function copyToClipboard(text) {
    if (typeof window === "undefined") return false;

    try {
      if (navigator?.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (_e) { }

    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }

  const sectionClass =
    "rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300";
  const inputBaseClass =
    "w-full rounded-lg border bg-white px-4 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:ring-4";
  const fieldClass = (key) =>
    `${inputBaseClass} ${errors[key]
      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
      : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"
    }`;

  const cardTitleClass = "mb-4 text-2xl font-bold text-[#2B245C]";

  const actionBtnClass =
    "inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors duration-150";

  const totalPages = Math.max(1, Math.ceil(configs.length / rowsPerPage));

  const paginatedConfigs = configs.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage,
  );

  const steps = [
    {
      target: '[data-tour="cc-header"]',
      title: "Child Consent Config",
      content:
        "This page allows you to create and manage child consent form configurations for your websites.",
      placement: "bottom",
    },
    {
      target: '[data-tour="basic-details"]',
      title: "Basic Details",
      content: "Set the domain, form ID, privacy policy, and version here. Ensure the domain is selected from your websites.",
      placement: "right",
    },
    {
      target: '[data-tour="branding"]',
      title: "Branding",
      content: "Customize the title, subtitle, submit label, and brand elements like logo and name.",
      placement: "right",
    },
    {
      target: '[data-tour="theme"]',
      title: "Theme",
      content: "Adjust primary and hover colors to match your brand.",
      placement: "right",
    },
    {
      target: '[data-tour="settings"]',
      title: "Settings",
      content: "Configure age threshold, verification method, relationship options, and requirements for parent verification.",
      placement: "right",
    },
    {
      target: '[data-tour="consent-statements"]',
      title: "Consent Statements",
      content: "Edit the text for intro, adult consent, guardian consent, and footer notes.",
      placement: "right",
    },
    {
      target: '[data-tour="live-preview"]', 
      title: "Live Preview",
      content: "See a real-time preview of the form based on your settings. Changes update instantly.",
      placement: "left",
    },
    {
      target: '[data-tour="existing-configs"]', 
      title: "Existing Configs",
      content: "View, load, edit, or delete saved configurations. Use pagination and filters as needed.",
      placement: "top",
    },
  ]

  if (loading) {
    return <div className="p-6 text-sm text-slate-600">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-5 bg-white rounded-lg p-5 my-3">
        <div className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex items-center justify-between" data-tour="cc-header">
          <div>
            <h1 className="text-3xl font-bold text-cyan-50">
              {isNew ? "Child Consent Config" : "Edit Child Consent Config"}
            </h1>
            <p className="mt-1 text-sm text-white">
              Please review and tailor the form settings, consent documentation, and configuration parameters to align with your requirements.
            </p>
          </div>

          <GuideButton
            onClick={() => setTourOpen(true)}
            variant="primary"
            size="md"
            className="!from-blue-500 !to-blue-600 hover:!from-blue-400 hover:!to-blue-500 !text-white !border-blue-400/70 !shadow-blue-600/30"
          >
            Help
          </GuideButton>
        </div>

        <div className="py-5 space-y-10">
          <form onSubmit={onSubmit} noValidate>
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(380px,0.8fr)]">
              <div className="space-y-6 min-w-0">
                <section className={sectionClass} data-tour="basic-details">
                  <h2 className={cardTitleClass}>Basic Details</h2>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field
                      label="Domain"
                      name="domain"
                      required
                      // hint="Example: dev.grc3.io"
                      errors={errors}
                    >
                      <select
                        name="domain"
                        value={form.domain}
                        onChange={handleDomainChange}
                        className={fieldClass("domain")}
                      >
                        <option value="">
                          {loadingWebsites ? "Loading…" : "Select a website…"}
                        </option>
                        {websites.map((w) => (
                          <option key={w.id || w.domain} value={w.domain}>
                            {w.domain}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field
                      label="Form ID"
                      name="formId"
                      required
                      errors={errors}
                    >
                      <input
                        name="formId"
                        value={form.formId}
                        onChange={handleTopChange}
                        className={fieldClass("formId")}
                      />
                    </Field>

                    <Field label="Flow Type" name="flowType" errors={errors}>
                      <input
                        name="flowType"
                        value={form.flowType}
                        readOnly
                        className={`${fieldClass("flowType")} bg-slate-100`}
                      />
                    </Field>

                    <Field
                      label="Privacy Policy"
                      name="policyVersion"
                      required
                      errors={errors}
                    >
                      <select
                        name="policyVersion"
                        value={form.policyVersion}
                        onChange={handleTopChange}
                        className={fieldClass("policyVersion")}
                      >
                        <option value="">
                          {loadingPolicies
                            ? "Loading…"
                            : "Select a privacy policy…"}
                        </option>
                        {policies.map((p) => (
                          <option
                            key={p?._id || p?.id || p?.name}
                            value={p?.name || ""}
                          >
                            {p?.name}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field
                      label="Version"
                      name="consentVersion"
                      required
                      errors={errors}
                    >
                      <input
                        name="consentVersion"
                        value={form.consentVersion}
                        onChange={handleTopChange}
                        placeholder="e.g. 1.1"
                        className={fieldClass("consentVersion")}
                      />
                    </Field>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        name="showModal"
                        checked={form.showModal}
                        onChange={handleTopChange}
                      />
                      Show as modal
                    </label>

                    <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={form.isActive}
                        onChange={handleTopChange}
                      />
                      Active
                    </label>
                  </div>
                </section>

                <AccordionSection
                  title="Branding"
                  sectionKey="branding"
                  openSection={openSection}
                  setOpenSection={setOpenSection}
                  dataTour="branding" // Add this prop
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="Title" name="title" required errors={errors}>
                      <input
                        name="title"
                        value={form.title}
                        onChange={handleTopChange}
                        className={fieldClass("title")}
                      />
                    </Field>

                    <Field label="Subtitle" name="subtitle" errors={errors}>
                      <input
                        name="subtitle"
                        value={form.subtitle}
                        onChange={handleTopChange}
                        className={fieldClass("subtitle")}
                      />
                    </Field>

                    <Field
                      label="Submit Label"
                      name="submitLabel"
                      required
                      errors={errors}
                    >
                      <input
                        name="submitLabel"
                        value={form.submitLabel}
                        onChange={handleTopChange}
                        className={fieldClass("submitLabel")}
                      />
                    </Field>

                    <Field
                      label="Brand Name"
                      name="branding.name"
                      errors={errors}
                    >
                      <input
                        value={form.branding.name}
                        onChange={(e) =>
                          handleNestedChange("branding", "name", e.target.value)
                        }
                        className={fieldClass("branding.name")}
                      />
                    </Field>

                    <Field
                      label="Logo URL"
                      name="branding.logoUrl"
                      errors={errors}
                    >
                      <input
                        value={form.branding.logoUrl}
                        onChange={(e) =>
                          handleNestedChange(
                            "branding",
                            "logoUrl",
                            e.target.value,
                          )
                        }
                        className={fieldClass("branding.logoUrl")}
                      />
                    </Field>

                    <Field
                      label="Logo Alt Text"
                      name="branding.logoAlt"
                      errors={errors}
                    >
                      <input
                        value={form.branding.logoAlt}
                        onChange={(e) =>
                          handleNestedChange(
                            "branding",
                            "logoAlt",
                            e.target.value,
                          )
                        }
                        className={fieldClass("branding.logoAlt")}
                      />
                    </Field>
                  </div>
                </AccordionSection>

                <AccordionSection
                  title="Theme"
                  sectionKey="theme"
                  openSection={openSection}
                  setOpenSection={setOpenSection}
                  dataTour="theme" // Add this prop
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field
                      label="Primary Color"
                      name="theme.primaryColor"
                      errors={errors}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={form.theme.primaryColor}
                          onChange={(e) =>
                            handleNestedChange(
                              "theme",
                              "primaryColor",
                              e.target.value,
                            )
                          }
                          className="h-11 w-14 rounded-xl border border-slate-300 bg-white p-1 shrink-0"
                        />
                        <input
                          value={form.theme.primaryColor}
                          onChange={(e) =>
                            handleNestedChange(
                              "theme",
                              "primaryColor",
                              e.target.value,
                            )
                          }
                          className={fieldClass("theme.primaryColor")}
                        />
                      </div>
                    </Field>

                    <Field
                      label="Primary Hover Color"
                      name="theme.primaryHoverColor"
                      errors={errors}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={form.theme.primaryHoverColor}
                          onChange={(e) =>
                            handleNestedChange(
                              "theme",
                              "primaryHoverColor",
                              e.target.value,
                            )
                          }
                          className="h-11 w-14 rounded-xl border border-slate-300 bg-white p-1 shrink-0"
                        />
                        <input
                          value={form.theme.primaryHoverColor}
                          onChange={(e) =>
                            handleNestedChange(
                              "theme",
                              "primaryHoverColor",
                              e.target.value,
                            )
                          }
                          className={fieldClass("theme.primaryHoverColor")}
                        />
                      </div>
                    </Field>
                  </div>
                </AccordionSection>

                <AccordionSection
                  title="Settings"
                  sectionKey="settings"
                  openSection={openSection}
                  setOpenSection={setOpenSection}
                  dataTour="settings" // Add this prop
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field
                      label="Age Threshold"
                      name="settings.minorAgeThreshold"
                      required
                      errors={errors}
                    >
                      <input
                        type="number"
                        min="1"
                        value={form.settings.minorAgeThreshold}
                        onChange={(e) =>
                          handleNestedChange(
                            "settings",
                            "minorAgeThreshold",
                            Number(e.target.value),
                          )
                        }
                        className={fieldClass("settings.minorAgeThreshold")}
                      />
                    </Field>

                    <Field
                      label="Verification Method"
                      name="settings.verificationMethod"
                      errors={errors}
                    >
                      <select
                        value={form.settings.verificationMethod}
                        onChange={(e) =>
                          handleNestedChange(
                            "settings",
                            "verificationMethod",
                            e.target.value,
                          )
                        }
                        className={fieldClass("settings.verificationMethod")}
                      >
                        <option value="otp">OTP</option>
                        <option value="link">Link</option>
                      </select>
                    </Field>

                    <div className="md:col-span-2">
                      <Field
                        label="Relationship Options"
                        name="settings.relationshipOptions"
                        required
                        hint="Comma separated"
                        errors={errors}
                      >
                        <input
                          value={form.settings.relationshipOptions.join(", ")}
                          onChange={(e) =>
                            handleRelationshipOptionsChange(e.target.value)
                          }
                          className={fieldClass("settings.relationshipOptions")}
                        />
                      </Field>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={form.settings.requireParentVerification}
                        onChange={(e) =>
                          handleNestedChange(
                            "settings",
                            "requireParentVerification",
                            e.target.checked,
                          )
                        }
                      />
                      Require parent verification
                    </label>

                    <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={form.settings.requireRelationship}
                        onChange={(e) =>
                          handleNestedChange(
                            "settings",
                            "requireRelationship",
                            e.target.checked,
                          )
                        }
                      />
                      Require relationship
                    </label>

                    <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={form.settings.requirePhone}
                        onChange={(e) =>
                          handleNestedChange(
                            "settings",
                            "requirePhone",
                            e.target.checked,
                          )
                        }
                      />
                      Require phone
                    </label>
                  </div>
                </AccordionSection>

                <AccordionSection
                  title="Consent Statements"
                  sectionKey="consentStatements"
                  openSection={openSection}
                  setOpenSection={setOpenSection}
                  dataTour="consent-statements" // Add this prop
                >
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      ["intro", "Intro", 3],
                      ["identityNote", "Identity Note", 3],
                      ["adult", "Adult Consent Text", 3],
                      ["adultCheckbox", "Adult Checkbox Text", 2],
                      ["minorNotice", "Minor Notice", 3],
                      ["guardianDeclaration", "Guardian Declaration", 2],
                      ["guardianCheckbox", "Guardian Checkbox Text", 2],
                      ["footerNote", "Footer Note", 3],
                    ].map(([key, label, rows]) => (
                      <Field
                        key={key}
                        label={label}
                        name={`consentStatements.${key}`}
                        required={[
                          "intro",
                          "adultCheckbox",
                          "guardianCheckbox",
                        ].includes(key)}
                        errors={errors}
                      >
                        <textarea
                          rows={rows}
                          value={form.consentStatements[key]}
                          onChange={(e) =>
                            handleNestedChange(
                              "consentStatements",
                              key,
                              e.target.value,
                            )
                          }
                          className={`${fieldClass(
                            `consentStatements.${key}`,
                          )} resize-y`}
                        />
                      </Field>
                    ))}
                  </div>
                </AccordionSection>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    title={saving ? "Saving configuration..." : isNew ? "Click to create a new configuration" : "Click to save changes"}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#2B245C] px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-60 transition-all"
                  >
                    {saving
                      ? "Saving..."
                      : isNew
                        ? "Create Config"
                        : "Save Changes"}
                  </button>

                  {isLoaded && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="inline-flex items-center gap-2 rounded-lg border border-[#2B245C] bg-white px-6 py-2.5 text-sm font-medium text-[#2B245C] hover:bg-indigo-50 transition-all"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-6 min-w-0">
                <section className={sectionClass} data-tour="live-preview">
                  <h2 className={cardTitleClass}>Live Preview</h2>

                  <div style={previewStyles}>
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <div className="p-5">
                        <div className="mb-4 flex items-center gap-3">
                          {form.branding.logoUrl ? (
                            <div className="flex items-center gap-2">
                              <Image
                                src={form.branding.logoUrl}
                                alt="logo"
                                width={40}
                                height={40}
                                className="object-contain rounded"
                                unoptimized
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  handleNestedChange("branding", "logoUrl", "")
                                }
                                className="text-xs text-red-600"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <div
                              className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold text-white"
                              style={{
                                backgroundColor: form.theme.primaryColor,
                              }}
                            >
                              {form.branding.name?.[0] || "B"}
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="truncate text-lg font-semibold text-slate-900">
                              {form.title}
                            </div>
                            <div className="text-sm text-slate-500">
                              {form.subtitle}
                            </div>
                          </div>
                        </div>

                        <div className="mb-4 rounded-xl bg-indigo-50 px-3 py-2 text-sm text-indigo-800">
                          {form.consentStatements.intro}
                        </div>

                        <div className="space-y-4">
                          <div className="rounded-xl border border-slate-200 p-4">
                            <div className="mb-3 text-sm font-semibold text-slate-900">
                              Your Details
                            </div>
                            <div className="mb-2 text-xs text-slate-500">
                              {form.consentStatements.identityNote}
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                              <input
                                className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                                placeholder="Full Name"
                                disabled
                              />
                              <input
                                className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                                placeholder="Email"
                                disabled
                              />
                              <input
                                className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                                placeholder="Date of Birth"
                                disabled
                              />
                            </div>
                          </div>

                          <div className="rounded-xl border border-slate-200 p-4">
                            <div className="mb-3 text-sm font-semibold text-slate-900">
                              Adult Consent
                            </div>
                            <div className="mb-3 text-xs text-slate-500">
                              {form.consentStatements.adult}
                            </div>
                            <label className="mb-2 flex items-start gap-2 text-sm text-slate-700">
                              <input
                                type="checkbox"
                                disabled
                                className="mt-1"
                              />
                              <span>
                                I confirm that I am{" "}
                                {form.settings.minorAgeThreshold} years of age
                                or older.
                              </span>
                            </label>
                            <label className="flex items-start gap-2 text-sm text-slate-700">
                              <input
                                type="checkbox"
                                disabled
                                className="mt-1"
                              />
                              <span>
                                {form.consentStatements.adultCheckbox}
                              </span>
                            </label>
                          </div>

                          <div className="rounded-xl border border-slate-200 p-4">
                            <div className="mb-3 text-sm font-semibold text-slate-900">
                              Parent / Guardian Consent
                            </div>
                            <div className="mb-3 text-xs text-slate-500">
                              {form.consentStatements.minorNotice}
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                              <input
                                className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                                placeholder="Parent/Guardian Full Name"
                                disabled
                              />
                              <input
                                className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                                placeholder="Parent/Guardian Email"
                                disabled
                              />
                              {form.settings.requirePhone ? (
                                <input
                                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                                  placeholder="Phone"
                                  disabled
                                />
                              ) : null}
                              {form.settings.requireRelationship ? (
                                <select
                                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                                  disabled
                                  defaultValue=""
                                >
                                  <option value="">Relationship</option>
                                  {form.settings.relationshipOptions.map(
                                    (opt) => (
                                      <option key={opt}>{opt}</option>
                                    ),
                                  )}
                                </select>
                              ) : null}
                            </div>

                            <div className="mt-3 space-y-2">
                              <label className="flex items-start gap-2 text-sm text-slate-700">
                                <input
                                  type="checkbox"
                                  disabled
                                  className="mt-1"
                                />
                                <span>
                                  {form.consentStatements.guardianDeclaration}
                                </span>
                              </label>
                              <label className="flex items-start gap-2 text-sm text-slate-700">
                                <input
                                  type="checkbox"
                                  disabled
                                  className="mt-1"
                                />
                                <span>
                                  {form.consentStatements.guardianCheckbox}
                                </span>
                              </label>
                            </div>

                            {form.settings.requireParentVerification ? (
                              <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
                                Parent verification method:{" "}
                                <span className="font-medium uppercase">
                                  {form.settings.verificationMethod}
                                </span>
                              </div>
                            ) : null}
                          </div>

                          <button
                            type="button"
                            disabled
                            className="inline-flex rounded-xl px-4 py-2.5 text-sm font-medium text-white"
                            style={{ backgroundColor: form.theme.primaryColor }}
                          >
                            {form.submitLabel}
                          </button>

                          <div className="text-xs text-slate-500">
                            {form.consentStatements.footerNote}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </form>

          <hr className="border-t-2 border-gray-300" />

          <section className={`${sectionClass}`} data-tour="existing-configs">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-[#2B245C]">
                Existing Configs
              </h2>
              <button
                type="button"
                onClick={() => fetchConfigs()}
                disabled={listLoading}
                className="inline-flex items-center gap-2 rounded-lg border border-[#2B245C] bg-white px-5 py-2 text-sm font-medium text-[#2B245C] hover:bg-blue-50 transition-all"
              >
                {listLoading ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            {configsError ? (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {configsError}
              </div>
            ) : null}

            <div className="overflow-x-auto rounded-lg border border-gray-800">
              <table className="min-w-full text-sm">
                <thead className="bg-[#2B245C] text-left text-white border-b border-gray-800">
                  <tr>
                    <th className="px-4 py-2 font-medium">Title</th>
                    <th className="px-4 py-2 font-medium">Domain</th>
                    <th className="px-4 py-2 font-medium">Form ID</th>
                    <th className="px-4 py-2 font-medium">Brand</th>
                    <th className="px-4 py-2 font-medium">Version</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                    <th className="px-4 py-2 font-medium">Updated</th>
                    <th className="px-4 py-2 font-medium">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {configs.length > 0 ? (
                    paginatedConfigs.map((cfg) => {
                      const branding = safeParse(cfg.branding);

                      return (
                        <tr key={cfg._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-slate-900">
                            {cfg.title || "-"}
                          </td>
                          <td className="px-4 py-3">{cfg.domain || "-"}</td>
                          <td className="px-4 py-3">{cfg.formId || "-"}</td>
                          <td className="px-4 py-3">{branding?.name || "-"}</td>
                          <td className="px-4 py-3">
                            {cfg.policyVersion || "-"} /{" "}
                            {cfg.consentVersion || "-"}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.isActive
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                                }`}
                            >
                              {cfg.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {cfg.updatedAt
                              ? new Date(cfg.updatedAt).toLocaleString()
                              : "-"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setForm(mapConfigToForm(cfg));
                                  setErrors({});
                                  setIsLoaded(true);

                                  toast.success("Config loaded!");

                                  router.replace(
                                    {
                                      pathname: router.pathname,
                                      query: { ...router.query, id: cfg._id },
                                    },
                                    undefined,
                                    { shallow: true },
                                  );
                                }}
                                className={`${actionBtnClass} border border-[#2B245C] bg-white text-[#2B245C] hover:bg-blue-50`}
                              >
                                Load
                              </button>

                              <button
                                type="button"
                                onClick={async () => {
                                  const scriptTag =
                                    getChildConsentScriptTag(cfg);
                                  const ok = await copyToClipboard(scriptTag);

                                  if (ok) {
                                    setCopiedId(cfg._id);
                                    toast.success(
                                      "Script copied to clipboard!",
                                    );
                                    setTimeout(() => setCopiedId(""), 1800);
                                  } else {
                                    toast.error("Failed to copy script.");
                                  }
                                }}
                                className={`${actionBtnClass} border border-blue-600 bg-white text-blue-700 hover:bg-blue-50`}
                                title="Copy script tag"
                              >
                                {copiedId === cfg._id
                                  ? "Copied"
                                  : "Copy Script"}
                              </button>

                              <button
                                type="button"
                                onClick={() => setDeleteId(cfg._id)}
                                disabled={deletingId === cfg._id}
                                className={`${actionBtnClass} border border-red-600 bg-white text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60`}
                                title="Delete config"
                              >
                                {deletingId === cfg._id
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        className="px-4 py-8 text-center text-sm text-slate-500"
                        colSpan={8}
                      >
                        No configurations found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={handleRowsPerPageChange}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out"
                >
                  Prev
                </button>

                <div className="text-sm text-slate-600">
                  Page {page} of {totalPages}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={page === totalPages}
                  className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out"
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-[#2B245C]">
              Delete Config
            </h3>

            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete this config? This action cannot be
              undone.
            </p>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  await handleDeleteConfig(deleteId);
                  setDeleteId(null);
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <Tour steps={steps} open={tourOpen} onClose={() => setTourOpen(false)} />

    </div>
  );
}

