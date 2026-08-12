import React, { useState } from "react";
import axios from "axios";
import { FaRobot, FaUpload } from "react-icons/fa";

export default function IHireSkillChecker() {
  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState("");
  const [loading, setLoading] = useState(false);
  const [missingSkills, setMissingSkills] = useState("");

  const extractTextFromFile = (file, setter) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setter(reader.result);
    reader.readAsText(file);
  };

  const analyzeMissingSkills = async () => {
    if (!resumeText || !jdText) return alert("Please upload both files.");

    setLoading(true);
    setMissingSkills("");

    const prompt = `
    You are an expert resume‐screening assistant. Your task is to compare the Job Description (JD) against the candidate’s Resume and identify every skill that appears in the JD but is missing or underrepresented in the Resume. Consider both technical skills (tools, languages, frameworks) and soft skills (communication, leadership, etc.).

    1. Read the entire Job Description carefully, and extract all explicitly required or highly desired skills.
    2. Read the entire Resume carefully, and note which of those JD skills are not mentioned or only briefly mentioned.
    3. Return ONLY a concise bullet‐point list of those missing or underrepresented skills. Do not include any other commentary, and do not list skills that appear sufficiently in the resume.

    Format your response exactly as:
    • Skill One
    • Skill Two
    • Skill Three

    Job Description:
    ${jdText}

    Resume:
    ${resumeText}
    `.trim();

    //     const prompt =
    //       `You are an expert resume‐screening assistant. Compare the following Job Description (JD) and Resume, and compute how well the candidate’s skills and experience align with the JD on a 0–100% scale.

    // 1. First, extract all required or highly desired skills and qualifications from the JD.
    // 2. Then, check how many of those appear in the Resume, considering both technical and soft skills.
    // 3. Calculate a match score: (number of JD skills present ÷ total JD skills) × 100, rounded to the nearest whole percent.
    // 4. Return exactly two lines:
    //    • “Match Score: XX%”
    //    • “Explanation: <one‐sentence rationale>”

    // Do not list any other information.

    // Job Description:
    // ${jdText}

    // Resume:
    // ${resumeText}
    // `.trim();
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
        { contents: [{ parts: [{ text: prompt }] }] },
        { headers: { "Content-Type": "application/json" } }
      );

      const aiText =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        "⚠️ Could not generate missing skills.";

      setMissingSkills(aiText);
    } catch (err) {
      console.error(err);
      setMissingSkills("⚠️ Error generating response from AI.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <header className="flex items-center gap-3 mb-6">
        <FaRobot className="text-indigo-600 text-2xl animate-pulse" />
        <h1 className="text-2xl font-bold text-gray-800">
          🧠 Ihire Skill Checker
        </h1>
      </header>

      <div className="grid sm:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <h2 className="font-semibold mb-2">
            Upload Job Description (.txt only)
          </h2>
          <input
            type="file"
            accept=".txt"
            onChange={(e) => extractTextFromFile(e.target.files[0], setJdText)}
            className="block w-full text-sm file:bg-indigo-50 file:text-indigo-700 file:px-4 file:py-2 file:rounded file:border-0 cursor-pointer"
          />
          {jdText && (
            <p className="mt-2 text-green-600 text-sm">✅ JD loaded</p>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <h2 className="font-semibold mb-2">Upload Resume (.txt only)</h2>
          <input
            type="file"
            accept=".txt"
            onChange={(e) =>
              extractTextFromFile(e.target.files[0], setResumeText)
            }
            className="block w-full text-sm file:bg-indigo-50 file:text-indigo-700 file:px-4 file:py-2 file:rounded file:border-0 cursor-pointer"
          />
          {resumeText && (
            <p className="mt-2 text-green-600 text-sm">✅ Resume loaded</p>
          )}
        </div>
      </div>

      <button
        onClick={analyzeMissingSkills}
        disabled={loading}
        className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded shadow hover:bg-indigo-700 disabled:opacity-50"
      >
        <FaUpload />
        {loading ? "Analyzing..." : "Find Missing Skills"}
      </button>

      {missingSkills && (
        <div className="mt-6 bg-white p-6 rounded-lg border shadow-sm whitespace-pre-wrap text-gray-800">
          <h3 className="text-lg font-semibold mb-2">🛠 Missing Skills:</h3>
          <p>{missingSkills}</p>
        </div>
      )}
    </div>
  );
}
