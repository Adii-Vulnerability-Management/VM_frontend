import React from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import Editor from "ckeditor5-custom-build";
// import Editor from "ckeditor5-custom-build";

const editorConfiguration = {
  toolbar: {
    items: [
      "heading",
      "|",
      "bold",
      "underline",
      "italic",
      "link",
      "bulletedList",
      "numberedList",
      "fontBackgroundColor",
      "fontColor",
      "fontFamily",
      "fontSize",
      "highlight",
      "horizontalLine",
      "strikethrough",
      "subscript",
      "superscript",
      "|",
      "todoList",
      "specialCharacters",
      "outdent",
      "indent",
      "|",
      "blockQuote",
      "insertTable",
      "restrictedEditingException",
      "removeFormat",
      "selectAll",
      "showBlocks",
      "findAndReplace",
      "sourceEditing",
      "undo",
      "redo",
    ],
  },
};

function CustomCkEditor({ initialData, onChange }) {
  // console.log("custom editor file");

  return (
    <CKEditor
      editor={Editor}
      config={editorConfiguration}
      data={initialData}
      onChange={(event, editor) => {
        const data = editor.getData();
        onChange(data);
      }}
    />
  );
}

export default CustomCkEditor;
