import { Document, Packer, Paragraph, TextRun } from "docx";

const GenerateWordReport = (location) => {
  console.log("Generating Word report for location:", location);

  // *****************************
  // General Information Section
  // *****************************

  const title = new Paragraph({
    text: "Location Report",
    heading: "Heading1",
    alignment: "center",
  });

  // Spacer paragraph for neat separation
  const spacer = new Paragraph({ text: "", spacing: { after: 200 } });

  // General information paragraphs
  const infoParagraphs = [
    title,
    spacer,
    new Paragraph({
      children: [new TextRun(`Company: ${location.company}`)],
    }),
    new Paragraph({
      children: [new TextRun(`Address: ${location.address}`)],
    }),
    new Paragraph({
      children: [new TextRun(`Division: ${location.Division}`)],
    }),
    new Paragraph({
      children: [new TextRun(`Division Location: ${location.Division_Location}`)],
    }),
    new Paragraph({
      children: [new TextRun(`Contact Person: ${location.contactPerson}`)],
    }),
    new Paragraph({
      children: [new TextRun(`Telephone: ${location.telephoneNumber}`)],
    }),
    new Paragraph({
      children: [new TextRun(`Email: ${location.email}`)],
    }),
    new Paragraph({
      children: [
        new TextRun(
          `Date of Advice: ${new Date(location.dateOfAdvice).toLocaleDateString()}`
        ),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun(
          `Created By: ${location.CreatedBy.firstName} ${location.CreatedBy.lastName}`
        ),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun(
          `Reviewed By: ${location.ReviewedBy.firstName} ${location.ReviewedBy.lastName}`
        ),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun(
          `Approved By: ${location.ApprovedBy.firstName} ${location.ApprovedBy.lastName}`
        ),
      ],
    }),
    new Paragraph({
      children: [new TextRun(`Review Status: ${location.reviewStatus}`)],
    }),
  ];

  // Create sections array starting with the general info section
  let sections = [
    {
      // First section: general location details on the first page
      children: infoParagraphs,
    },
  ];

  // **********************************************
  // Controls Questions Section (each on new page)
  // **********************************************

  if (
    location.controlsQuestions &&
    Array.isArray(location.controlsQuestions) &&
    location.controlsQuestions.length > 0
  ) {
    location.controlsQuestions.forEach((question, index) => {
      let controlParagraphs = [];

      // Add a header for each control question
      controlParagraphs.push(
        new Paragraph({
          text: `Control Information - Question ${index + 1}`,
          heading: "Heading2",
          alignment: "center",
          spacing: { before: 200, after: 100 },
        })
      );

      controlParagraphs.push(
        new Paragraph({
          text: `Root ISA New: ${question["Root ISA New"] || ""}`,
        }),
        new Paragraph({
          text: `Maturity Level: ${question["Maturity Level"] || ""}`,
        }),
        new Paragraph({
          text: `Root Control Question: ${question["Root Control question"] || ""}`,
        }),
        new Paragraph({
          text: `Parent ISA New: ${question["Parent ISA New"] || ""}`,
        }),
        new Paragraph({
          text: `Parent Control Question: ${question["Parent Control question"] || ""}`,
        }),
        new Paragraph({
          text: `ISA New: ${question["ISA New"] || ""}`,
        }),
        new Paragraph({
          text: `Control Question: ${question["Control question"] || ""}`,
        }),
        new Paragraph({
          text: `Objective: ${question["Objective"] || ""}`,
        })
      );

      // Format Must Requirements (if any)
      let mustReqText = "";
      if (
        Array.isArray(question["Must Requirements"]) &&
        question["Must Requirements"].length > 0
      ) {
        mustReqText = question["Must Requirements"]
          .map((req) => `${req.question} (Answer: ${req.answer})`)
          .join("; ");
      }
      controlParagraphs.push(
        new Paragraph({ text: `Must Requirements: ${mustReqText}` })
      );

      // Format Should Requirements (if any)
      let shouldReqText = "";
      if (
        Array.isArray(question["Should Requirements"]) &&
        question["Should Requirements"].length > 0
      ) {
        shouldReqText = question["Should Requirements"]
          .map((req) => `${req.question} (Answer: ${req.answer})`)
          .join("; ");
      }
      controlParagraphs.push(
        new Paragraph({ text: `Should Requirements: ${shouldReqText}` })
      );

      // Additional requirements for high protection needs
      let addHighReqText = "";
      if (
        Array.isArray(question["Additional requirements for high protection needs"]) &&
        question["Additional requirements for high protection needs"].length > 0
      ) {
        addHighReqText = question["Additional requirements for high protection needs"].join(
          "; "
        );
      }
      controlParagraphs.push(
        new Paragraph({
          text: `Additional requirements for high protection needs: ${addHighReqText}`,
        })
      );

      // Additional requirements for very high protection needs
      let addVeryHighReqText = "";
      if (
        Array.isArray(question["Additional requirements for very high protection needs"]) &&
        question["Additional requirements for very high protection needs"].length > 0
      ) {
        addVeryHighReqText = question["Additional requirements for very high protection needs"].join(
          "; "
        );
      }
      controlParagraphs.push(
        new Paragraph({
          text: `Additional requirements for very high protection needs: ${addVeryHighReqText}`,
          spacing: { after: 200 },
        })
      );

      // Reference Documentation
      let refDocText = "";
      if (
        Array.isArray(question["Reference Documentation"]) &&
        question["Reference Documentation"].length > 0
      ) {
        refDocText = question["Reference Documentation"].join(", ");
      }
      controlParagraphs.push(
        new Paragraph({
          text: `Reference Documentation: ${refDocText}`,
          spacing: { after: 200 },
        })
      );

      // Each control question gets its own section (which starts on a new page)
      sections.push({
        children: controlParagraphs,
      });
    });
  }

  // *****************************
  // Create and Download Document
  // *****************************

  const doc = new Document({
    creator: "NIS2 Dashboard",
    title: "Location Report",
    description: "Report generated from NIS2 Dashboard",
    sections: sections,
  });

  // Generate the Word document as a Blob and trigger the download
  Packer.toBlob(doc).then((blob) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Location_Report_${location._id}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
};

export default GenerateWordReport;
