
import React, { useState, useCallback, useEffect } from 'react';
import { VoiceSelector } from './components/VoiceSelector';
import { FileUpload } from './components/FileUpload';
import { ProgressBar } from './components/ProgressBar';
import { LogoIcon } from './components/icons';
import { type VoiceOption } from './types';
import { playCompletionSound, createMp3File } from './utils/audioUtils';
import { extractTextFromPDF } from './utils/pdfUtils';
import { convertTextToAudio } from './services/geminiService';


// pdf.js is loaded via script tag in index.html, so we declare it here for TypeScript
declare const pdfjsLib: any;

const voices: VoiceOption[] = [
  { id: 'Kore', name: 'Clara', description: 'Voz Feminina Jovem', gender: 'female' },
  { id: 'Zephyr', name: 'Mateus', description: 'Voz Masculina Calma', gender: 'male' },
  { id: 'Charon', name: 'Sofia', description: 'Voz Feminina Profissional', gender: 'female' },
  { id: 'Puck', name: 'Lucas', description: 'Voz Masculina Dinâmica', gender: 'male' },
];

export default function App() {
  const [selectedVoice, setSelectedVoice] = useState<string>(voices[0].id);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [finalFileName, setFinalFileName] = useState<string | null>(null);

  useEffect(() => {
    // Limpa a URL do objeto quando o componente é desmontado ou a URL muda
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  const resetDownloadState = useCallback(() => {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }
    setDownloadUrl(null);
    setFinalFileName(null);
  }, [downloadUrl]);

  const handleFileChange = (file: File | null) => {
    if (file && file.type !== 'application/pdf') {
      setError('Por favor, selecione um arquivo PDF.');
      setSelectedFile(null);
      return;
    }
    setError(null);
    setSelectedFile(file);
    setWarning(null);
    resetDownloadState();
  };

  const handleVoiceChange = (voiceId: string) => {
    setSelectedVoice(voiceId);
    resetDownloadState();
  };


  const handleConvertClick = useCallback(async () => {
    if (!selectedFile || !selectedVoice) {
      setError('Por favor, selecione um arquivo e uma voz.');
      return;
    }
    
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      setError('A chave da API não foi encontrada. Verifique a configuração do ambiente.');
      return;
    }

    setIsConverting(true);
    setProgress(0);
    setError(null);
    setWarning(null);
    resetDownloadState();
    
    try {
      setStatusMessage('Extraindo texto do PDF...');
      const extractedText = await extractTextFromPDF(selectedFile, pdfjsLib);

      if (!extractedText.trim()) {
        setError('O PDF parece estar vazio ou não contém texto legível.');
        setIsConverting(false);
        return;
      }
      
      setStatusMessage('Iniciando conversão...');

      const handleProgress = (progress: number, message: string) => {
        setProgress(progress);
        setStatusMessage(message);
      };

      const { audioPcmChunks, skippedChunks } = await convertTextToAudio({
        text: extractedText,
        apiKey,
        voiceId: selectedVoice,
        onProgress: handleProgress,
      });
      
      if (audioPcmChunks.length === 0) {
        setError("Não foi possível gerar nenhum áudio. O conteúdo do PDF pode ter sido totalmente bloqueado ou a API pode estar indisponível.");
        setIsConverting(false);
        return;
      }

      if (skippedChunks > 0) {
        setWarning(`Atenção: ${skippedChunks} parte(s) do documento não foram convertidas, possivelmente por violação das políticas de conteúdo. O áudio restante foi gerado.`);
      }

      handleProgress(100, 'Finalizando e criando arquivo .mp3...');

      const mp3Blob = createMp3File(audioPcmChunks, 24000);
      const newFileName = selectedFile.name.replace(/\.pdf$/i, '.mp3');
      const audioUrl = URL.createObjectURL(mp3Blob);

      setDownloadUrl(audioUrl);
      setFinalFileName(newFileName);

      setStatusMessage('Download iniciado!');
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = newFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // Não revogamos a URL aqui para permitir o download manual

      playCompletionSound();

    } catch(err: any) {
        console.error('Falha na conversão:', err);
        setError(err.message || 'Falha ao processar o arquivo.');
        setProgress(0);
    } finally {
        setIsConverting(false);
    }
  }, [selectedFile, selectedVoice, resetDownloadState]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-900 font-sans">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <LogoIcon className="w-12 h-12 text-cyan-400" />
            <h1 className="text-4xl font-bold text-white tracking-tight">
              PDF para Áudio
            </h1>
          </div>
          <p className="text-lg text-slate-400">
            Converta seus documentos PDF em arquivos de áudio com vozes realistas.
          </p>
        </header>

        <main className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 space-y-8 border border-slate-700">
          <div>
            <h2 className="text-xl font-semibold mb-4 text-cyan-300">1. Escolha uma Voz</h2>
            <VoiceSelector
              voices={voices}
              selectedVoice={selectedVoice}
              onSelectVoice={handleVoiceChange}
              disabled={isConverting}
            />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 text-cyan-300">2. Envie seu PDF</h2>
            <FileUpload
              onFileSelect={handleFileChange}
              disabled={isConverting}
              fileName={selectedFile?.name || null}
            />
          </div>
          
          {error && <p className="text-red-400 text-center bg-red-900/50 p-3 rounded-lg">{error}</p>}
          {warning && !isConverting && (
            <div className="text-yellow-300 text-center bg-yellow-900/50 p-3 rounded-lg">
              <p>{warning}</p>
            </div>
          )}
          
          <div className="pt-4">
            {isConverting ? (
              <ProgressBar progress={progress} message={statusMessage} />
            ) : downloadUrl ? (
                <div className="text-center p-4 bg-green-900/50 rounded-lg">
                    <p className="text-lg font-semibold text-green-300 mb-4">Conversão concluída!</p>
                    <a
                      href={downloadUrl}
                      download={finalFileName || 'audio.mp3'}
                      className="w-full inline-block bg-green-500 hover:bg-green-400 text-slate-900 font-bold py-4 px-4 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300 shadow-lg"
                    >
                      Baixar MP3 Novamente
                    </a>
                </div>
            ) : (
              <button
                onClick={handleConvertClick}
                disabled={!selectedFile || isConverting}
                className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed text-slate-900 font-bold py-4 px-4 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-300 shadow-lg"
              >
                Converter para Áudio
              </button>
            )}
          </div>
        </main>
      </div>
       <footer className="text-center mt-12 text-slate-500">
          <p>Powered by Google Gemini API</p>
        </footer>
    </div>
  );
}
