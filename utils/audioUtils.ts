
// lamejs is loaded via script tag, so we declare it here for TypeScript
declare const lamejs: any;

/**
 * Plays a short, pleasant sound using the Web Audio API.
 */
export function playCompletionSound() {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (!audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(660, audioContext.currentTime); // A pleasant A5 note
  gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);

  oscillator.start(audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.5);
  oscillator.stop(audioContext.currentTime + 0.5);
}

/**
 * Decodes a Base64 string into a Uint8Array.
 */
export function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Creates an MP3 file Blob from an array of raw 16-bit PCM audio data chunks using lamejs.
 * This version processes chunks individually to be memory-efficient and prevent allocation errors on large files.
 * @param audioPcmChunks - Array of PCM data chunks from Gemini TTS.
 * @param sampleRate - The sample rate of the audio (e.g., 24000).
 * @returns A Blob containing the MP3 file data.
 */
export function createMp3File(audioPcmChunks: Uint8Array[], sampleRate: number): Blob {
    const mp3Encoder = new lamejs.Mp3Encoder(1, sampleRate, 128); // 1 channel, 24000 sample rate, 128kbps bitrate
    const mp3Data: Int8Array[] = [];
    
    // Process each PCM chunk individually to conserve memory, avoiding a large single buffer allocation.
    for (const pcmChunk of audioPcmChunks) {
        // The raw PCM data from the API is 16-bit little-endian.
        // We create an Int16Array view on the buffer of the Uint8Array chunk.
        // This is a memory-efficient operation as it doesn't copy the data.
        const pcmInt16 = new Int16Array(pcmChunk.buffer);
        const mp3buf = mp3Encoder.encodeBuffer(pcmInt16);
        if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
        }
    }

    // Finalize the MP3 file by flushing any remaining data from the encoder.
    const mp3buf = mp3Encoder.flush();
    if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
    }

    // Create the final Blob from the collected MP3 data chunks.
    return new Blob(mp3Data, { type: 'audio/mpeg' });
}
