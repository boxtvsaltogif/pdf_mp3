/**
 * Extracts text from a PDF file using the pdf.js library.
 * @param file The PDF file to process.
 * @param pdfjsLib The imported pdf.js library object.
 * @returns A promise that resolves with the extracted text.
 */
export async function extractTextFromPDF(file: File, pdfjsLib: any): Promise<string> {
  const fileReader = new FileReader();

  return new Promise((resolve, reject) => {
    fileReader.onload = async (event) => {
      if (!event.target?.result) {
        return reject(new Error('Failed to read file.'));
      }
      
      const typedarray = new Uint8Array(event.target.result as ArrayBuffer);
      
      try {
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += pageText + '\n';
        }
        resolve(fullText);
      } catch (error) {
        console.error('Error parsing PDF:', error);
        reject(new Error('Could not parse the PDF file. It might be corrupted or protected.'));
      }
    };
    
    fileReader.onerror = (error) => {
        reject(new Error('Error reading file: ' + error));
    };

    fileReader.readAsArrayBuffer(file);
  });
}
