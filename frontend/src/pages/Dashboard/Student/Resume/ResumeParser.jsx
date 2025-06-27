import { useState, useEffect } from 'react';
import * as pdfjs from 'pdfjs-dist';
import workerPath from 'pdfjs-dist/build/pdf.worker.min.js?url';
import { parseResumeWithOpenAI } from './resumeParserUtils';
import { FileText, Upload, AlertCircle, Loader2, CheckCircle } from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = workerPath;

function ResumeParser({ onParsedData }) {
  const [pdfFile, setPdfFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Automatically parse when pdfFile is set
  useEffect(() => {
    if (pdfFile) {
      const doParse = async () => {
        setIsLoading(true);
        setError(null);
        // Simulate upload progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setUploadProgress(Math.min(progress, 90));
          if (progress >= 90) clearInterval(interval);
        }, 200);
        try {
          const arrayBuffer = await pdfFile.arrayBuffer();
          const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
          let fullText = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            fullText += textContent.items.map(item => item.str).join(' ') + '\n';
          }
          const parsedData = await parseResumeWithOpenAI(fullText);
          setUploadProgress(100);
          onParsedData(parsedData);
        } catch (error) {
          console.error('PDF Processing Error:', error);
          setError('Failed to process PDF. Please try another file or create your resume manually.');
        } finally {
          setIsLoading(false);
        }
      };
      doParse();
    } else {
      setUploadProgress(0);
    }
  }, [pdfFile, onParsedData]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setError(null);
    } else {
      setError('Please upload a valid PDF file');
    }
  };

  return (
    <div className="space-y-4">
      {!pdfFile ? (
        <label className="block w-full cursor-pointer">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#18005F] transition-colors w-full max-w-xs sm:max-w-md mx-auto">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-700 font-medium mb-2">Drag & drop your resume PDF here</p>
            <p className="text-gray-500 text-sm mb-4">or click to browse files</p>
            <div className="inline-flex items-center justify-center px-4 py-2 bg-[#18005F] text-white rounded-lg hover:bg-[#18005F]/90 transition-colors shadow-sm w-full max-w-xs mx-auto mt-2">
              <Upload className="w-4 h-4 mr-2" />
              Select PDF
            </div>
          </div>
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
            disabled={isLoading}
          />
        </label>
      ) : (
        <div className="border-2 border-gray-300 rounded-xl p-6 w-full max-w-xs sm:max-w-md mx-auto">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-[#18005F]/10 rounded-lg flex items-center justify-center mr-3">
              <FileText className="w-5 h-5 text-[#18005F]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 font-medium truncate">{pdfFile.name}</p>
              <p className="text-gray-500 text-sm">{(pdfFile.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              onClick={() => setPdfFile(null)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-[#18005F] h-2 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
          {isLoading && (
            <div className="w-full flex items-center justify-center py-2">
              <Loader2 className="w-5 h-5 mr-2 animate-spin text-[#18005F]" />
              <span className="text-[#18005F] font-medium">Processing Resume...</span>
            </div>
          )}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">{error}</p>
            {error.includes('process PDF') && (
              <p className="mt-1 text-sm">Make sure the PDF is not password protected and contains selectable text.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ResumeParser;