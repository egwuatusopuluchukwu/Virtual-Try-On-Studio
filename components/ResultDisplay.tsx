
import React from 'react';

interface ResultDisplayProps {
  resultImage: string | null;
  isLoading: boolean;
}

const LoadingSkeleton: React.FC = () => (
    <div className="w-full h-full bg-gray-700 animate-pulse rounded-lg flex flex-col items-center justify-center p-8">
        <svg className="w-16 h-16 text-gray-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="text-xl font-bold text-gray-400">Generating Your Look...</h3>
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
            Upload your photo and a garment, then click "Virtual Try-On" to see the result.
        </p>
    </div>
);


export const ResultDisplay: React.FC<ResultDisplayProps> = ({ resultImage, isLoading }) => {
  return (
    <div className="bg-gray-800 p-2 rounded-lg shadow-2xl aspect-w-3 aspect-h-4 min-h-[400px] lg:min-h-[600px] flex items-center justify-center">
      {isLoading ? (
        <LoadingSkeleton />
      ) : resultImage ? (
        <img src={resultImage} alt="Virtual try-on result" className="w-full h-full object-contain rounded-md" />
      ) : (
        <Placeholder />
      )}
    </div>
  );
};
