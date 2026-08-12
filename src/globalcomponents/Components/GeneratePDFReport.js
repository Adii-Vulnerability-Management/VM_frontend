import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";

// Define improved styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
  },
  header: {
    fontSize: 28,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
    color: "#ffffff",
    backgroundColor: "#003366",
    padding: 10,
    borderRadius: 4,
  },
  subHeader: {
    fontSize: 16,
    marginBottom: 10,
    padding: 5,
    textAlign: "left",
    backgroundColor: "#e6f2ff",
    color: "#003366",
    borderRadius: 4,
  },
  section: {
    marginBottom: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 4,
  },
  text: {
    fontSize: 12,
    marginBottom: 6,
    color: "#333333",
    lineHeight: 1.4,
  },
  footer: {
    fontSize: 10,
    textAlign: "center",
    color: "#666666",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 10,
    marginTop: 20,
  },
});

// PDF document component
const GeneratePDFReportDocument = ({ location }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <Text style={styles.header}>Location Report</Text>

      {/* General Information Section */}
      <View style={styles.section}>
        <Text style={styles.subHeader}>General Information</Text>
        <Text style={styles.text}>Company: {location.company}</Text>
        <Text style={styles.text}>Address: {location.address}</Text>
        <Text style={styles.text}>Division: {location.Division}</Text>
        <Text style={styles.text}>
          Division Location: {location.Division_Location}
        </Text>
        <Text style={styles.text}>
          Contact Person: {location.contactPerson}
        </Text>
        <Text style={styles.text}>Telephone: {location.telephoneNumber}</Text>
        <Text style={styles.text}>Email: {location.email}</Text>
        <Text style={styles.text}>
          Date of Advice: {new Date(location.dateOfAdvice).toLocaleDateString()}
        </Text>
        <Text style={styles.text}>
          Created By: {location.CreatedBy.firstName}{" "}
          {location.CreatedBy.lastName}
        </Text>
        <Text style={styles.text}>
          Reviewed By: {location.ReviewedBy.firstName}{" "}
          {location.ReviewedBy.lastName}
        </Text>
        <Text style={styles.text}>
          Approved By: {location.ApprovedBy.firstName}{" "}
          {location.ApprovedBy.lastName}
        </Text>
        <Text style={styles.text}>Review Status: {location.reviewStatus}</Text>
      </View>

      {/* Controls Questions Section */}
      {location.controlsQuestions &&
        Array.isArray(location.controlsQuestions) &&
        location.controlsQuestions.map((question, index) => (
          <View key={index} style={styles.section} wrap>
            <Text style={styles.subHeader}>Control Information</Text>
            <Text style={styles.text}>
              Root ISA New: {question["Root ISA New"] || ""}
            </Text>
            <Text style={styles.text}>
              Maturity Level: {question["Maturity Level"] || ""}
            </Text>
            <Text style={styles.text}>
              Root Control Question: {question["Root Control question"] || ""}
            </Text>
            <Text style={styles.text}>
              Parent ISA New: {question["Parent ISA New"] || ""}
            </Text>
            <Text style={styles.text}>
              Parent Control Question:{" "}
              {question["Parent Control question"] || ""}
            </Text>
            <Text style={styles.text}>
              ISA New: {question["ISA New"] || ""}
            </Text>
            <Text style={styles.text}>
              Control Question: {question["Control question"] || ""}
            </Text>
            <Text style={styles.text}>
              Objective: {question["Objective"] || ""}
            </Text>
            <View>
              <Text style={styles.text}>Must Requirements:</Text>
              {Array.isArray(question["Must Requirements"]) &&
                question["Must Requirements"].length > 0 &&
                question["Must Requirements"].map((req, idx) => (
                  <View key={req._id || idx} style={{ marginLeft: 10 }}>
                    <Text style={styles.text}>Question: {req.question}</Text>
                    <Text style={styles.text}>Answer: {req.answer}</Text>
                  </View>
                ))}
            </View>

            <View>
              <Text style={styles.text}>Should Requirements:</Text>
              {Array.isArray(question["Should Requirements"]) &&
                question["Should Requirements"].length > 0 &&
                question["Should Requirements"].map((req, idx) => (
                  <View key={req._id || idx} style={{ marginLeft: 10 }}>
                    <Text style={styles.text}>Question: {req.question}</Text>
                    <Text style={styles.text}>Answer: {req.answer}</Text>
                  </View>
                ))}
            </View>

            <View>
              <Text style={styles.text}>
                Additional requirements for high protection needs:
              </Text>
              {Array.isArray(
                question["Additional requirements for high protection needs"]
              ) &&
                question["Additional requirements for high protection needs"]
                  .length > 0 &&
                question[
                  "Additional requirements for high protection needs"
                ].map((req, idx) => (
                  <View key={req._id || idx} style={{ marginLeft: 10 }}>
                    <Text style={styles.text}>Question: {req.question}</Text>
                    <Text style={styles.text}>Answer: {req.answer}</Text>
                  </View>
                ))}
            </View>

            <View>
              <Text style={styles.text}>
                Additional requirements for very high protection needs:
              </Text>
              {Array.isArray(
                question[
                  "Additional requirements for very high protection needs"
                ]
              ) &&
                question[
                  "Additional requirements for very high protection needs"
                ].length > 0 &&
                question[
                  "Additional requirements for very high protection needs"
                ].map((req, idx) => (
                  <View key={req._id || idx} style={{ marginLeft: 10 }}>
                    <Text style={styles.text}>Question: {req.question}</Text>
                    <Text style={styles.text}>Answer: {req.answer}</Text>
                  </View>
                ))}
            </View>

            <Text style={styles.text}>
              Reference Documentation:{" "}
              {Array.isArray(question["Reference Documentation"]) &&
              question["Reference Documentation"].length > 0
                ? question["Reference Documentation"].join(", ")
                : ""}
            </Text>
          </View>
        ))}

      {/* Footer */}
      <Text style={styles.footer}>
        Generated on {new Date().toLocaleDateString()}
      </Text>
    </Page>
  </Document>
);

// Component to generate and download the PDF
const GeneratePDFReport = ({ location }) => {
  return (
    <div className="flex justify-center my-4">
      <PDFDownloadLink
        document={<GeneratePDFReportDocument location={location} />}
        fileName="NIS2_Self_Assessment_Report.pdf"
        className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow"
      >
        {({ loading }) => (loading ? "Generating PDF..." : "Download Report")}
      </PDFDownloadLink>
    </div>
  );
};

export default GeneratePDFReport;
