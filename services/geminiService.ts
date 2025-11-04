import { GoogleGenAI, Modality } from '@google/genai';
import { decodeBase64 } from '../utils/audioUtils';

const TEXT_CHUNK_SIZE = 4500; // Um tamanho de bloco seguro para a API

/**
 * Envolve a chamada da API Gemini com um mecanismo de repetição para lidar com erros de rede transitórios.
 * @param ai A instância do GoogleGenAI.
 * @param modelRequest A carga útil da solicitação para generateContent.
 * @param retries Número de tentativas a serem feitas.
 * @param delay Atraso entre as tentativas em ms.
 * @returns A resposta da API.
 */
async function generateContentWithRetry(ai: GoogleGenAI, modelRequest: any, retries = 5, delay = 2000): Promise<any> {
    try {
        return await ai.models.generateContent(modelRequest);
    } catch (error) {
        if (retries > 0) {
            console.warn(
                `A chamada da API falhou, tentando novamente em ${delay}ms... (${retries} tentativas restantes).`,
                error
            );
            await new Promise(resolve => setTimeout(resolve, delay));
            // Usa backoff exponencial para tentativas subsequentes
            return generateContentWithRetry(ai, modelRequest, retries - 1, delay * 2);
        }
        console.error("A chamada da API falhou após várias tentativas.", error);
        throw error; // Lança o erro novamente após esgotar as tentativas
    }
}


/**
 * Converte um texto longo em áudio, dividindo-o em pedaços e chamando a API Gemini TTS para cada pedaço.
 * @param options - As opções para a conversão.
 * @returns Um objeto contendo os pedaços de áudio PCM e o número de pedaços ignorados.
 */
export async function convertTextToAudio(options: {
  text: string;
  apiKey: string;
  voiceId: string;
  onProgress: (progress: number, message: string) => void;
}): Promise<{ audioPcmChunks: Uint8Array[]; skippedChunks: number }> {
  const { text, apiKey, voiceId, onProgress } = options;
  const ai = new GoogleGenAI({ apiKey });

  const textChunks = [];
  for (let i = 0; i < text.length; i += TEXT_CHUNK_SIZE) {
      textChunks.push(text.substring(i, i + TEXT_CHUNK_SIZE));
  }

  const audioPcmChunks: Uint8Array[] = [];
  let skippedChunks = 0;

  for (let i = 0; i < textChunks.length; i++) {
      const chunk = textChunks[i];
      // Vai até 95% para a parte de conversão, deixando os últimos 5% para a criação do arquivo
      const progress = Math.round(((i + 1) / textChunks.length) * 95);
      onProgress(progress, `Convertendo parte ${i + 1} de ${textChunks.length}...`);

      const modelRequest = {
          model: "gemini-2.5-flash-preview-tts",
          contents: [{ parts: [{ text: chunk }] }],
          config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                  voiceConfig: {
                      prebuiltVoiceConfig: { voiceName: voiceId },
                  },
              },
          },
      };

      const response = await generateContentWithRetry(ai, modelRequest);

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        audioPcmChunks.push(decodeBase64(base64Audio));
      } else {
        skippedChunks++;
        console.warn(`A API não retornou áudio para a parte ${i + 1}. Pulando.`, {
            chunkText: chunk.substring(0, 100) + '...', // Log um trecho para depuração
            response: response
        });
      }
  }
  
  return { audioPcmChunks, skippedChunks };
}