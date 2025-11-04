
import React, { useRef } from 'react';
import { UploadIcon } from './icons';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  disabled: boolean;
  fileName: string | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled, fileName }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    onFileSelect(file);
  };

  const handleAreaClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf"
        className="hidden"
        disabled={disabled}
      />
      <div
        onClick={handleAreaClick}
        className={`
          flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg
          transition-colors duration-200
          ${disabled 
            ? 'border-slate-700 bg-slate-800 cursor-not-allowed'
            : 'border-slate-600 bg-slate-700/50 hover:border-cyan-400 hover:bg-slate-700 cursor-pointer'
          }
        `}
      >
        <UploadIcon className="w-12 h-12 text-slate-500 mb-4" />
        {fileName ? (
          <p className="text-center text-white">
            <span className="font-semibold">Arquivo Selecionado:</span><br />
            {fileName}
          </p>
        ) : (
          <p className="text-center text-slate-400">
            <span className="font-semibold text-cyan-400">Clique para enviar</span> ou arraste e solte um arquivo PDF.
          </p>
        )}
      </div>
    </div>
  );
};
