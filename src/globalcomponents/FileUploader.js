import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
function FileUploader({ onFileUpload }) {
  const [first, setfirst] = useState("");
  const onDrop = useCallback(
    (acceptedFiles) => {
      setfirst(acceptedFiles[0].name);
      onFileUpload(acceptedFiles[0].name);
      // Pass the uploaded file object to the parent component
      
    },
    [first,onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div>
      <div className="file-upload">
        <div
          {...getRootProps()}
          className={`dropzone ${isDragActive ? "active" : ""}`}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <div className="text-center border">
              
              <i className="fe fe-file-plus  fs-1 bolder"></i> <p>Drag Here</p>
              <p>{first}</p>
            </div>
          ) : (
            <div className="text-center border">
              
              <i className="fe fe-upload  fs-1 bolder"></i> <p>Upload a File</p>
              <p>{first}</p>
            </div>
          )}
          <p className="fs-6">
            Accepted file extensions: .pdf,docx, .odt , .xlsx , .docs , .pptx ,
            .odp
          </p>
        </div>
      </div>
    </div>
  );
}

export default FileUploader;
