
import React from 'react';

interface ResultDisplayProps {
  resultImage: string | null;
  isLoading: boolean;
  loadingText: string;
}

const LoadingSkeleton: React.FC<{loadingText: string}> = ({loadingText}) => (
    <div className="w-full h-full bg-gray-700 animate-pulse rounded-lg flex flex-col items-center justify-center p-8 text-center">
        <svg className="w-16 h-16 text-gray-500 mb-4 animate-spin" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <h3 className="text-xl font-bold text-gray-400">{loadingText}</h3>
        <p className="text-gray-500 mt-2">The AI is working its magic. This may take a moment.</p>
    </div>
);


const Placeholder: React.FC = () => (
    <div className="w-full h-full bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center p-8 text-center">
        <svg className="w-20 h-20 text-gray-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="text-2xl font-bold text-gray-300">Your Result Will Appear Here</h3>
        <p className="text-gray-400 mt-2 max-w-sm">
            Use the controls on the left to generate an image.
        </p>
    </div>
);


export const ResultDisplay: React.FC<ResultDisplayProps> = ({ resultImage, isLoading, loadingText }) => {
  const handleDownload = () => {
    if (!resultImage) return;

    const link = document.createElement('a');
    link.href = resultImage;
    link.download = 'generated-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const hasResult = !!resultImage;

  return (
    <div className="relative bg-gray-800 p-2 rounded-lg shadow-2xl aspect-w-3 aspect-h-4 min-h-[400px] lg:min-h-[600px] flex items-center justify-center">
      {isLoading ? (
        <LoadingSkeleton loadingText={loadingText} />
      ) : resultImage ? (
        <img src={resultImage} alt="Generated result" className="w-full h-full object-contain rounded-md" />
      ) : (
        <Placeholder />
      )}
      {!isLoading && hasResult && (
         <button
            onClick={handleDownload}
            className="absolute bottom-4 right-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-transform duration-200 ease-in-out hover:scale-105 shadow-lg"
            aria-label="Download media"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Download
          </button>
      )}
    </div>
  );
};
