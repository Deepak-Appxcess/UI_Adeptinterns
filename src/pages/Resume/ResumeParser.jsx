import { useState } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { parseResumeWithOpenAI } from './resumeParserUtils';

function ResumeParser({ onParsedData }) {
  const [pdfFile, setPdfFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setError(null);
    } else {
      setError('Please upload a valid PDF file');
    }
  };

  const extractText = async () => {
    if (!pdfFile) {
      setError('Please select a PDF file first');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Initialize PDF.js worker
      pdfjs.GlobalWorkerOptions.workerSrc = 
        `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
      
      // Load the PDF document
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjs.getDocument(arrayBuffer).promise;
      
      // Extract text from all pages
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map(item => item.str).join(' ') + '\n';
      }
      
      // Parse with OpenAI
      const parsedData = await parseResumeWithOpenAI(fullText);
      onParsedData(parsedData);
      
    } catch (error) {
      console.error('PDF Processing Error:', error);
      setError('Failed to process PDF. Please try another file.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="block bg-blue-500 text-white py-2 px-4 rounded cursor-pointer text-center">
        {pdfFile ? pdfFile.name : 'Upload resume'}
        <input 
          type="file" 
          accept="application/pdf" 
          className="hidden" 
          onChange={handleFileChange}
          disabled={isLoading}
        />
      </label>
      {pdfFile && (
        <button
          onClick={extractText}
          disabled={isLoading}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : 'Parse Resume'}
        </button>
      )}
      {error && (
        <p className="text-red-500 text-sm mt-2">
          {error}
          {error.includes('process PDF') && (
            <span className="block mt-1">Make sure the PDF is not password protected and contains selectable text.</span>
          )}
        </p>
      )}
    </div>
  );
}

export default ResumeParser;