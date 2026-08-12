import React, { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { AiOutlineClear, AiOutlineSave } from 'react-icons/ai';

const SignatureInput = ({ isCreateSignatureVisible, onSignatureSave, disableField }) => {
  const [url, setUrl] = useState(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [fileError, setFileError] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const signCanvasRef = useRef();

  const handleGenerateSignature = () => {
    const signatureDataURL = signCanvasRef.current.getTrimmedCanvas().toDataURL('image/png');
    setUrl(signatureDataURL);
    onSignatureSave(signatureDataURL);
    setIsButtonDisabled(true);
  };

  const handleClearSignature = () => {
    signCanvasRef.current.clear();
    setUrl('');
    setIsButtonDisabled(false);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file && ['image/png', 'image/jpeg'].includes(file.type)) {
      setUploadedFile(file);
      setUrl(URL.createObjectURL(file));
      onSignatureSave(file);
      setFileError(null);
    } else {
      setFileError('Please upload a valid image file (PNG, JPEG)');
    }
  };

  const handleClearFile = () => {
    setUploadedFile(null);
    setFileError(null);
    setUrl('');
    document.querySelector('input[name="signature"]').value = null;
  };

  return (
    <div>
      {isCreateSignatureVisible ? (
        <>
          <SignatureCanvas
            canvasProps={{ width: 300, height: 100, className: 'border border-gray-500' }}
            ref={signCanvasRef}
            disabled={disableField}
          />
          <div className="mt-2 flex items-center space-x-4">
            <button
              type="button"
              onClick={handleClearSignature}
              className="text-red-500"
              disabled={disableField}
            >
              <AiOutlineClear size={24} />
            </button>
            <button
              type="button"
              onClick={handleGenerateSignature}
              className={`text-blue-500 ${isButtonDisabled ? 'cursor-not-allowed' : ''}`}
              disabled={disableField || isButtonDisabled}
            >
              <AiOutlineSave size={24} />
            </button>
          </div>
        </>
      ) : (
        <div>
          <input type="file" name="signature" onChange={handleFileInput} disabled={disableField} />
          {fileError && <p className="text-red-500">{fileError}</p>}
          {uploadedFile && (
            <div>
              <img src={url} alt="Preview" className="max-w-xs mt-2" />
              <button type="button" onClick={handleClearFile} className="text-red-500">
                <AiOutlineClear size={24} />
              </button>
            </div>
          )}
        </div>
      )}
      {url && <img src={url} alt="Signature" className="mt-4 max-w-xs" />}
    </div>
  );
};

export default SignatureInput;
