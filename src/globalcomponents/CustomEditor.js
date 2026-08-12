import React, { useState , useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import the default Quill theme

const CustomEditor = ({ initialData, onChange }) => {
  const [editorContent, setEditorContent] = useState(initialData || "");

  const handleEditorChange = (content) => {
    setEditorContent(content);
    if (onChange) onChange(content); // Trigger the onChange callback if provided
  };
  useEffect(() => {
    setEditorContent(initialData || "");
  }, [initialData]);

  // Define a custom toolbar for Quill
  const toolbarOptions = [
    [{ header: [1, 2, 3, false] }], // Heading options
    [{ font: [] }], // Font family
    [{ size: ["small", false, "large", "huge"] }], // Font size
    [{ align: [] }], // Text alignment
    ["bold", "italic", "underline", "strike"], // Text formatting
    [{ color: [] }, { background: [] }], // Font and background color
    [{ script: "sub" }, { script: "super" }], // Subscript and superscript
    [{ list: "ordered" }, { list: "bullet" }], // Ordered and unordered lists
    ["blockquote", "code-block"], // Blockquote and code block
    ["link", "image", "video"], // Media insertion
    ["clean"], // Remove formatting
  ];

  return (
    <div className="custom-editor-container">
      <ReactQuill
        value={editorContent}
        onChange={handleEditorChange}
        modules={{ toolbar: toolbarOptions }}
        placeholder="Start typing here..."
        className="editor"
      />
      <style jsx>{`
        .custom-editor-container {
          width: 100%;
          max-width: 100%;
          overflow: hidden;
          border: 1px solid #d1d5db; /* Neutral border color */
          border-radius: 8px;
          background-color: white; /* Set background color to white */
        }

        .custom-editor-container :global(.ql-toolbar) {
          width: 100%;
          border-bottom: 1px solid #d1d5db; /* Match border color */
          background-color: #f8f9fa; /* Light background for toolbar */
          padding: 8px 10px;
          overflow: visible; /* Ensure dropdowns are not clipped */
        }

        .custom-editor-container :global(.ql-toolbar .ql-formats) {
          display: inline-block;
          vertical-align: middle; /* Align toolbar items properly */
          margin-right: 8px; /* Space between format groups */
        }

        .custom-editor-container :global(.ql-toolbar .ql-picker) {
          display: inline-block;
          position: relative;
          vertical-align: middle;
        }

        .custom-editor-container :global(.ql-toolbar .ql-picker-options) {
          position: absolute;
          top: 100%;
          left: 0;
          z-index: 9999; /* High z-index to appear above the editor content */
          background-color: white; /* Dropdown background color */
          border: 1px solid #d1d5db; /* Border for dropdown */
          border-radius: 4px; /* Rounded corners */
          box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1); /* Subtle shadow */
          padding: 4px 0; /* Padding inside the dropdown */
          min-width: 100px; /* Minimum width for dropdowns */
        }

        .custom-editor-container
          :global(.ql-toolbar .ql-picker-options .ql-picker-item) {
          padding: 8px 16px;
          cursor: pointer;
        }

        .custom-editor-container
          :global(.ql-toolbar .ql-picker-options .ql-picker-item:hover) {
          background-color: #e5e7eb; /* Slight hover effect */
        }

        .custom-editor-container :global(.ql-editor) {
          min-height: 150px;
          max-height: 300px;
          overflow-y: auto;
          padding: 12px;
          font-size: 16px;
          line-height: 1.5;
          color: #374151; /* Neutral text color */
          background-color: white; /* Editor content background */
          scrollbar-width: thin;
        }

        .custom-editor-container :global(.ql-editor::-webkit-scrollbar) {
          width: 6px;
        }

        .custom-editor-container :global(.ql-editor::-webkit-scrollbar-thumb) {
          background-color: #cbd5e1; /* Scrollbar color */
          border-radius: 3px;
        }

        .custom-editor-container :global(.ql-editor::-webkit-scrollbar-track) {
          background: #f1f5f9; /* Track color */
        }

        .custom-editor-container :global(.ql-container) {
          border: none;
          border-radius: 0 0 8px 8px;
          background-color: white;
        }

        .custom-editor-container :global(.ql-toolbar button) {
          color: #6b7280; /* Neutral button color */
          border: none;
          background: transparent;
          margin: 0 4px;
          padding: 6px 8px;
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }

        .custom-editor-container :global(.ql-toolbar button:hover) {
          background-color: #e5e7eb; /* Hover effect for buttons */
        }

        .custom-editor-container :global(.ql-toolbar button.ql-active) {
          background-color: #d1d5db; /* Active button effect */
        }
      `}</style>
    </div>
  );
};

export default CustomEditor;
