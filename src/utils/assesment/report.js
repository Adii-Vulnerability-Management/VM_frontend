import { baseurl, initURL } from "@/config/config";
import CustomAxios from "@/config/CustomAxios";
import Cookies from "js-cookie";

const slugify = (s = "") =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const STATUS_MODE_TYPES = new Set([
  "dpdp-controllers",
  "dpdp-information-security-checklist",
  "dpdp-records-management-checklist",
  "dpdp-direct-marketing-checklist",
  "dpdp-cctv-checklist",
  "dpdp-processors-checklist",
  "dpdp-data-sharing-and-subject-access-checklist",
]);

const isDpdpTitle = (title = "") => {
  const slug = slugify(title);
  const label = String(title).toLowerCase();
  return (
    STATUS_MODE_TYPES.has(slug) ||
    /(^|[^a-z])dpdp\s+(controllers|information\s+security\s+checklist|records\s+management\s+checklist|direct\s+marketing\s+checklist|test|cctv\s+checklist|processors\s+checklist|data\s+sharing\s+and\s+subject\s+access\s+checklist)([^a-z]|$)/i.test(
      label
    )
  );
};

export const getUserId = () => {
  const raw = Cookies.get("user_data");
  if (!raw) throw new Error("User not found. Please sign in again.");
  try {
    const u = JSON.parse(raw);
    const id = u?.user_uuid || u?.id || u?._id;
    if (!id) throw new Error("User not found. Please sign in again.");
    return id;
  } catch {
    throw new Error("User not found. Please sign in again.");
  }
};

export const fetchUserResults = async () => {
  const uid = getUserId();
  const url = `${baseurl}/${initURL}/assessment-result/user/${uid}?t=${Date.now()}`;
  const res = await CustomAxios.get(url);
  const data = res?.data?.data ?? res?.data ?? [];
  return Array.isArray(data) ? data : [];
};

export const flattenForReports = (data) => {
  const arr = Array.isArray(data) ? data : [data];
  const rows = [];
  arr.forEach((run) => {
    const common = {
      assessmentTitle: run?.title ?? "",
      unit: run?.unit ?? "",
      currency: run?.currency ?? "",
      score: run?.score ?? 0,
      createdAt: run?.createdAt ?? run?.updatedAt ?? "",
      _id: run?._id ?? "",
    };
    const dpdp = isDpdpTitle(common.assessmentTitle);
    (run?.subType || []).forEach((st) => {
      (st?.question || []).forEach((q) => {
        rows.push({
          ...common,
          isDpdp: dpdp,
          section: st?.name ?? "",
          qno: q?.qno ?? "",
          qId: q?.qId ?? "",
          question: q?.question ?? "",
          rating: q?.rating ?? "",
          SuggestedRemediationPlan: q?.SuggestedRemediationPlan ?? "",
        });
      });
    });
  });
  return rows;
};

const dpdpRatingLabel = (val) => {
  if (val === 0) return "Not yet implemented or planned";
  if (val === 1) return "Partially implemented or planned";
  if (val === 2) return "Successfully implemented";
  if (val === "" || val === null || typeof val === "undefined")
    return "Not applicable";
  return String(val);
};

const mapSelectedRating = (row) =>
  row.isDpdp ? dpdpRatingLabel(row.rating) : String(row.rating ?? "");

const pickLatestAssessmentRows = (rows) => {
  if (!rows.length) return { title: "", rows: [] };
  const byKey = new Map();
  rows.forEach((r) => {
    const key = r._id || r.assessmentTitle || "unknown";
    const list = byKey.get(key) || [];
    list.push(r);
    byKey.set(key, list);
  });
  let best = [];
  let bestDate = -Infinity;
  byKey.forEach((list) => {
    const maxD = Math.max(
      ...list.map((x) => Date.parse(x.createdAt || 0) || 0)
    );
    if (maxD > bestDate) {
      bestDate = maxD;
      best = list;
    }
  });
  const title = best[0]?.assessmentTitle || "";
  return { title, rows: best };
};

const buildWordReportPretty = async (title, rows) => {
  const docx = await import("docx");
  const saver = await import("file-saver");
  const saveAs = saver.default || saver.saveAs;
  if (typeof saveAs !== "function") {
    throw new Error("file-saver saveAs() not available in this environment.");
  }

  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    UnderlineType,
    ShadingType,
  } = docx;

  const bySection = new Map();
  rows.forEach((r) => {
    const sec = r.section || "General";
    const list = bySection.get(sec) || [];
    list.push(r);
    bySection.set(sec, list);
  });

  const HILITE = "F6E7D4";

  const makeShadedLine = (text) =>
    new Paragraph({
      children: [
        new TextRun({
          text,
          bold: true,
          shading: { type: ShadingType.CLEAR, fill: HILITE, color: "auto" },
        }),
      ],
      spacing: { after: 100 },
    });

  const children = [
    new Paragraph({
      children: [
        new TextRun({
          text: `${title} report`,
          bold: true,
          size: 48,
          underline: { type: UnderlineType.SINGLE },
        }),
      ],
      spacing: { after: 300 },
    }),
  ];

  for (const [sectionName, items] of bySection.entries()) {
    children.push(
      new Paragraph({
        text: sectionName,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 150 },
      })
    );

    items.forEach((r) => {
      children.push(makeShadedLine(r.question || ""));
      if (r.selectedRating) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: "Selected rating: ", bold: true }),
              new TextRun({ text: r.selectedRating }),
            ],
            spacing: { after: 100 },
          })
        );
      }

      if (r.SuggestedRemediationPlan) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: r.SuggestedRemediationPlan })],
            spacing: { after: 200 },
          })
        );
      } else {
        children.push(new Paragraph({ text: "", spacing: { after: 100 } }));
      }
    });
  }

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, "assessment_report.docx");
};

const buildExcelReport = async (rows) => {
  // use the browser bundle so Next won’t try to pull Node streams/fs
  const ExcelJS = await import("exceljs/dist/exceljs.min.js");
  const { default: saver } = await import("file-saver");
  const saveAs = saver || (await import("file-saver")).saveAs;

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Report", {
    views: [{ state: "frozen", ySplit: 3 }], // freeze title + header
  });

  // ---------- Title ----------
  const title = "Assessment Report";
  ws.mergeCells("A1", "H1");
  const titleCell = ws.getCell("A1");
  titleCell.value = title;
  titleCell.font = { bold: true, size: 16 };
  titleCell.alignment = { vertical: "middle" };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFEFF4FF" },
  };
  ws.getRow(1).height = 24;

  // ---------- Columns ----------
  const columns = [
    { header: "Assessment Title", key: "assessmentTitle", width: 28 },
    { header: "Section", key: "section", width: 24 },
    { header: "Q#", key: "qno", width: 6 },
    { header: "Question", key: "question", width: 50 },
    { header: "Selected Rating", key: "selectedRating", width: 24 },
    {
      header: "Suggested Remediation Plan",
      key: "SuggestedRemediationPlan",
      width: 50,
    },
    { header: "Score", key: "score", width: 10 },
    { header: "Created At", key: "createdAt", width: 20 },
  ];
  ws.columns = columns;
  ws.addRow([]);
  const headerRow = ws.addRow(columns.map((c) => c.header));

  // ---------- Header styling ----------
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2F5597" },
    };
    cell.border = {
      top: { style: "thin", color: { argb: "FFDEE3F0" } },
      bottom: { style: "thin", color: { argb: "FFDEE3F0" } },
      left: { style: "thin", color: { argb: "FFE6EAF2" } },
      right: { style: "thin", color: { argb: "FFE6EAF2" } },
    };
  });
  ws.getRow(headerRow.number).height = 20;

  // ---------- Data rows ----------
  const zebra1 = "FFFFFFFF";
  const zebra2 = "FFF7F9FC"; // very light blue-gray

  rows.forEach((r, i) => {
    const row = ws.addRow([
      r.assessmentTitle ?? "",
      r.section ?? "",
      r.qno ?? "",
      r.question ?? "",
      r.selectedRating ?? "",
      r.SuggestedRemediationPlan ?? "",
      r.score ?? "",
      r.createdAt ? new Date(r.createdAt) : "",
    ]);
    row.getCell("D").alignment = { wrapText: true, vertical: "top" };
    row.getCell("F").alignment = { wrapText: true, vertical: "top" };
    row.getCell("G").numFmt = "0.00"; // score
    row.getCell("H").numFmt = "yyyy-mm-dd hh:mm";

    const fill = i % 2 === 0 ? zebra1 : zebra2;
    row.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: fill },
      };
      cell.border = {
        bottom: { style: "hair", color: { argb: "FFCDD6E6" } },
      };
      cell.alignment = cell.alignment || { vertical: "top" };
    });
  });

  // ---------- AutoFilter ----------
  ws.autoFilter = {
    from: { row: headerRow.number, column: 1 },
    to: { row: headerRow.number, column: columns.length },
  };

  // ---------- Create a formal Excel Table (banded rows) ----------
  const lastRow = ws.lastRow.number;
  if (lastRow > headerRow.number) {
    ws.addTable({
      name: "AssessmentTable",
      ref: `A${headerRow.number}`,
      headerRow: true,
      totalsRow: false,
      style: { theme: "TableStyleMedium9", showRowStripes: true },
      columns: columns.map((c) => ({ name: c.header })),
      rows:
        ws
          .getRows(headerRow.number + 1, lastRow - headerRow.number)
          ?.map((r) => r.values.slice(1)) || [],
    });
  }

  for (let r = headerRow.number + 1; r <= ws.lastRow.number; r++) {
    const questionLen = String(ws.getCell(`D${r}`).value || "").length;
    const remLen = String(ws.getCell(`F${r}`).value || "").length;
    const lines = Math.ceil(questionLen / 60 + remLen / 60);
    ws.getRow(r).height = Math.min(80, Math.max(18, lines * 14));
  }

  // ---------- Export ----------
  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, "assessment_report.xlsx");
};

const generateReport = async (kind = "" /* 'word' | 'excel' */) => {
  const type = String(kind || "")
    .toLowerCase()
    .trim();
  if (type !== "word" && type !== "excel") {
    throw new Error("Unsupported report type");
  }

  const data = await fetchUserResults();
  const flat = flattenForReports(data);

  if (type === "word") {
    const { title, rows } = pickLatestAssessmentRows(flat);
    const forWord = rows.map((r) => ({
      section: r.section,
      question: r.question,
      SuggestedRemediationPlan: r.SuggestedRemediationPlan,
      selectedRating: mapSelectedRating(r),
    }));
    await buildWordReportPretty(title || "Checklist", forWord);
    return;
  }
  await buildExcelReport(flat);
};

export default generateReport;
