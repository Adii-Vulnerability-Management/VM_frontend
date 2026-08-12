import React, { useRef, useState } from "react";
import JoditEditor from "jodit-react";

const CustomEditor = ({ initialData, onChange }) => {
  const editor = useRef(null);
  const [content, setContent] = useState(initialData || "");

  const handleBlur = (newContent) => {
    setContent(newContent);
    if (onChange) onChange(newContent);
  };

  return (
    <JoditEditor
      ref={editor}
      value={content}
      tabIndex={1}
      onBlur={handleBlur}
      onChange={() => {}} // Required to prevent warning
    />
  );
};

export default CustomEditor;
