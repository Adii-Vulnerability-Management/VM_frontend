
// pages/cover.js
export default function Cover() {
  return (
    <div className="w-full">
      <h1 className=" text-black font-bold text-center p-3">
        PROJECT WORKBOOK INSTRUCTIONS
      </h1>

      {/* Project Workbook General Guidelines table */}
      <table className="text-md text-center mt-2 rounded-md">
        <tbody>
          <tr>
            <td className="bg-blue-600 text-black font-bold p-2 rounded-tl-md rounded-tr-md">
              Project Workbook General Guidelines:
            </td>
          </tr>
          <tr>
            <td className="bg-blue-300 text-black p-2">
              <b>1. Purpose:</b> The Gate Workbook is a tool used by the SDT for
              planning the PDP deliverables for a program, and tracking progress
              to the plan. The Gate Workbook should be used at monthly Program
              Reviews and Gate Reviews.
            </td>
          </tr>
          <tr>
            <td className="bg-blue-200 text-black p-2">
              <b>2. Responsibility:</b> The Program Manager is responsible for
              keeping the Gate Workbook up to date through collaboration with
              the entire SDT. The Program Manager is responsible for ensuring
              that the SDT has accurately provided deliverable status, issues
              and actions (with closure dates) in preparation for all Gate
              Reviews and on-time Gate Closure. At a minimum, each Gate Workbook
              is required to be updated each month for: 1) Program Reviews 2)
              Gate Reviews 3) Month end Project Status reports. Status recorded
              the last business day of each month.{" "}
            </td>
          </tr>
          <tr>
            <td className="bg-blue-300 text-black p-2">
              <b>3. Program Planning Workshop:</b> The Gate Workbook should be
              developed simultaneously with the PDP Action Plan (PAP) during a
              Program Planning Workshop. The Gates, deliverables and sign-offs
              in the Gate Workbook should be scaled to the scope of the program.
              Best practice is to establish planned close dates for all program
              deliverables prior to Phase 1 exit.
            </td>
          </tr>
          <tr>
            <td className="bg-blue-200 text-black p-2">
              <b>4. Project Summary and Status:</b>After Program Award, conduct
              a Program Planning Workshop to baseline the program. This should
              be completed within 2 weeks after Phase 1 exit. Enter all planned
              Gate and VSO dates into the Project Summary and Status.
            </td>
          </tr>
          <tr>
            <td className="bg-blue-300 text-black p-2 rounded-bl-md rounded-br-md">
              <b>5. Document Storage:</b> Gate Workbook file is required to be
              saved in the program file.
            </td>
          </tr>
        </tbody>
      </table>

      {/* Program Assumptions table */}
      <table className="w-full text-md text-center mt-2 rounded-md">
        <tbody>
          <tr>
            <td className="bg-blue-600 text-black font-bold p-2 rounded-tl-md rounded-tr-md">
              Program Assumptions:
            </td>
          </tr>

          <tr>
            <td className="bg-blue-300 text-black p-2 rounded-bl-md rounded-br-md">
              <b>Program Kickoff information:</b> Imbed the original copy of the
              Program Kickoff presentation into the Program Assumptions tab of
              the Gate Workbook.
            </td>
          </tr>
        </tbody>
      </table>

      {/* Project Summary & Status table */}
      <table className="text-md text-center mt-2 rounded-md">
        <tbody>
          <tr>
            <td className="bg-blue-600 text-black font-bold p-2 rounded-tl-md rounded-tr-md">
              Project Summary & Status:
            </td>
          </tr>

          <tr>
            <td className="bg-blue-300 text-black p-2">
              <b>
                Entering of data required by Program Manager with concurrence
                from SDT
              </b>
            </td>
          </tr>
          <tr>
            <td className="bg-blue-200 text-black p-2">
              <b>Gate Exit &quot;Planned&quot; Dates:</b> Gate Exit
              &quot;Planned&quot; Dates are baselined in the Program Planning
              Workshop and approved within 2 weeks of the Phase 1 exit. Can only
              be changed with an approved PD3.
            </td>
          </tr>
          <tr>
            <td className="bg-blue-300 text-black p-2">
              <b>VSO Approval &quot;Planned&quot; Dates:</b> VSO
              &quot;Planned&quot; Dates are baselined in the Program Planning
              Workshop and approved at the Development Start Gate. VSO dates are
              typically 2-4 weeks prior to planned Gate dates. Dates can only be
              changed with an approved PD3.
            </td>
          </tr>
          <tr>
            <td className="bg-blue-200 text-black p-2 rounded-bl-md rounded-br-md">
              <b>N/A Guideline:</b> Enter N/A in any Gate Exit or VSO field
              where proper approval has been obtained to omit this requirement.
              Program Planning Workshops used to identify opportunities for
              reducing requirements. Authorization required from responsible
              approving person to make Gates or VSO N/A (Not Applicable).{" "}
            </td>
          </tr>
          {/* <tr>
        <td className="bg-blue-300 text-black p-2">Authorization required from responsible approving person to make Gates or VSO N/A (Not Applicable). </td>
      </tr> */}
        </tbody>
      </table>

      {/* Issues/Deliverables table */}
      <table className="text-md text-center mt-2 rounded-md">
        <tbody>
          <tr>
            <td className="bg-blue-600 text-black font-bold p-2 rounded-tl-md rounded-tr-md">
              Issues/Deliverables:
            </td>
          </tr>

          <tr>
            <td className="bg-blue-300 text-black p-2">
              <b>Deliverables Not Applicable:</b> Deliverables that are not
              applicable to the program must be marked “N/A” with reason for
              exclusion documented in workbook in the “Status/Problem Statement”
              column. Deliverables are not to be deleted or removed from the
              Gate Workbook.
            </td>
          </tr>
          <tr>
            <td className="bg-blue-200 text-black p-2">
              <b>Move Deliverables:</b> Deliverables can be moved to a different
              Gate as required. Mark N/A in Risk column for the applicable
              Deliverable, state why it is not applicable at this time and which
              Gate it has been moved to (in Status/Corrective Action column).
              Copy Deliverable and insert/paste the Deliverable into the
              appropriate Gate worksheet. Note in the Deliverable Requirements
              that it was moved.
            </td>
          </tr>
          <tr>
            <td className="bg-blue-300 text-black p-2">
              <b>Modify Deliverable Requirements:</b> Modify the Deliverable
              Requirements in the Gate Workbook as required. It is recommended
              to use a different font to differentiate the changes from standard
              PDP requirements. Customer equivalent forms are permitted when
              XXXXX internal requirements are met.
            </td>
          </tr>
          <tr>
            <td className="bg-blue-200 text-black p-2 rounded-bl-md rounded-br-md">
              <b>Verification Sign-Offs (VSOs):</b> Verification sign-offs
              include safety, engineering, finance, manufacturing and process.
              Based on the scaled deliverables and gates, determine which VSOs
              are applicable to the program. If the program scaling results in a
              scenario other than those listed above the SDT must petition the
              applicable verification sign-off evaluator for agreement on
              changes (combine, move or delete) to the VSOs.
            </td>
          </tr>
        </tbody>
      </table>

      {/* Gate Reports table */}
      <table className="text-md text-center mt-2 rounded-md">
        <tbody>
          <tr>
            <td className="bg-blue-600 text-black font-bold p-2 rounded-tl-md rounded-tr-md">
              Gate Reports:
            </td>
          </tr>

          <tr>
            <td className="bg-blue-300 text-black p-2">
              <b>Planned Review Date, upper left:</b>{" "}
              <i>
                <b>DO NOT ENTER DATA INTO THIS FIELD.</b>
              </i>{" "}
              Automatically populated from Project Summary and Status.
            </td>
          </tr>
          <tr>
            <td className="bg-blue-200 text-black p-2">
              <b>Deliverable Requirements:</b> Brief description of Deliverable
              maturity expectations at the time of the Gate Review.
            </td>
          </tr>
          <tr>
            <td className="bg-blue-300 text-black p-2">
              <b>PDP Responsibility:</b> Reference to the owner of the
              deliverable per XXXXX standard processes.
            </td>
          </tr>
          <tr>
            <td className="bg-blue-200 text-black p-2">
              <b>Responsible Name:</b> XXXXX Employee responsible for closing
              corresponding issue and returning Risk Level to &quot;G&quot; for
              Green.
            </td>
          </tr>
          <tr>
            <td className="bg-blue-300 text-black p-2">
              <b>Risk (RYG):</b> Enter RYG corresponding to risk of each
              Deliverable. Refer to &quot;RYG Definition&quot; to properly
              assess risk.{" "}
            </td>
          </tr>
          <tr>
            <td className="bg-blue-200 text-black p-2">
              <b>Status/Corrective Actions(s):</b> Briefly describe status of
              open deliverable and action plan that the SDT has developed to
              mitigate risk and complete the deliverable.{" "}
            </td>
          </tr>
          <tr>
            <td className="bg-blue-300 text-black p-2 rounded-bl-md rounded-br-md">
              <b>Gates:</b> For any Gate that will be eliminated, all
              Deliverables should be marked as Not Applicable or moved to
              another Gate. Not Applicable should be entered in the Plan Gate
              Dates on the Key Program Dates worksheet.
            </td>
          </tr>
        </tbody>
      </table>

      {/* Gate Workbook Approval table */}
      <table className="w-full text-md text-center mt-2 rounded-md">
        <tbody>
          <tr>
            <td className="bg-blue-600 text-black font-bold p-2 rounded-tl-md rounded-tr-md">
              Gate Workbook Approval:
            </td>
          </tr>

          <tr>
            <td className="bg-blue-300 text-black p-2 rounded-bl-md rounded-br-md">
              The agreed upon Gate Workbook and PDP Action Plan is presented
              within two weeks after the Project Kickoff. The Approved
              “baseline” Gate Workbook and PDP Action Plan is retained by the
              SDT and copies are submitted to the Manager of Program Management.
            </td>
          </tr>
        </tbody>
      </table>

      {/* RISK (RYG) table */}

      {/* Lessons Learned */}
      <table className="text-md text-center mt-2 rounded-md">
        <tbody>
          <tr>
            <td className="bg-blue-600 text-black font-bold p-2 rounded-tl-md rounded-tr-md">
              Lessons Learned:
            </td>
          </tr>

          <tr>
            <td className="bg-blue-300 text-black p-2">
              The Program Manager is responsible for documenting TGW and TGR
              with the SDT prior to each planned Gate Review.
            </td>
          </tr>
          <tr>
            <td className="bg-blue-200 text-black p-2">
              <b>Item:</b> Enter sequential number if needed.
            </td>
          </tr>
          <tr>
            <td className="bg-blue-300 text-black p-2">
              <b>Category (TGR/TGW):</b> Select TGR or TGW.
            </td>
          </tr>
          <tr>
            <td className="bg-blue-200 text-black p-2">
              <b>Gate:</b> Select applicable Gate Review.
            </td>
          </tr>
          <tr>
            <td className="bg-blue-300 text-black p-2">
              <b>SDT Function:</b> Selection applicable functional group.
            </td>
          </tr>
          <tr>
            <td className="bg-blue-200 text-black p-2">
              <b>Lesson Learned:</b> Briefly describe status of open deliverable
              and action plan that the SDT has developed to mitigate risk and
              complete the deliverable.{" "}
            </td>
          </tr>
          <tr>
            <td className="bg-blue-300 text-black p-2">
              <b>Proposal / Recommendations:</b> Enter proposal for how future
              programs and SDTs could avoid this issue.
            </td>
          </tr>
          <tr>
            <td className="bg-blue-200 text-black p-2 rounded-bl-md rounded-br-md">
              <b>Responsibility:</b> Enter proposal for who would implement the
              proposal/recommendations.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}


