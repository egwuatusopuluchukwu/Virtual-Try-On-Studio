
import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { virtualTryOn } from './services/geminiService';

const Header: React.FC = () => (
  <header className="text-center p-4 md:p-6">
    <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
      Virtual Try-On Studio
    </h1>
    <p className="mt-2 text-lg text-gray-400">See it on before you buy it.</p>
  </header>
);

const App: React.FC = () => {
  const [userImage, setUserImage] = useState<{ file: File; base64: string } | null>(null);
  const [garmentImage, setGarmentImage] = useState<{ file: File; base64: string } | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleUserImageUpload = async (file: File) => {
    try {
      const base64 = await fileToBase64(file);
      setUserImage({ file, base64 });
    } catch (err) {
      setError('Failed to load user image.');
    }
  };

  const handleGarmentImageUpload = async (file: File) => {
    try {
      const base64 = await fileToBase64(file);
      setGarmentImage({ file, base64 });
    } catch (err) {
      setError('Failed to load garment image.');
    }
  };
  
  const handleVirtualTryOn = useCallback(async () => {
    if (!userImage || !garmentImage) {
      setError("Please upload both your photo and a garment photo.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResultImage(null);

    try {
      // Fix: Pass the user image mime type to the virtualTryOn service for accuracy.
      const generatedImage = await virtualTryOn(userImage.base64, userImage.file.type, garmentImage.base64, garmentImage.file.type);
      setResultImage(`data:image/png;base64,${generatedImage}`);
    } catch (err) {
      console.error(err);
      setError("Failed to generate the try-on image. The AI model might be busy. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [userImage, garmentImage]);
  
  const handleReset = () => {
    setUserImage(null);
    setGarmentImage(null);
    setResultImage(null);
    setError(null);
    setIsLoading(false);
  };


  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ImageUploader 
                    onImageUpload={handleUserImageUpload}
                    previewUrl={userImage ? URL.createObjectURL(userImage.file) : null}
                    title="Upload Your Photo"
                    description="Upload a full-body photo for best results."
                />
                <ImageUploader 
                    onImageUpload={handleGarmentImageUpload}
                    previewUrl={garmentImage ? URL.createObjectURL(garmentImage.file) : null}
                    title="Upload Garment"
                    description="Upload a photo of the clothing item."
                />
            </div>
             <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-4 text-gray-200">Generate Your Look</h3>
                <p className="text-gray-400 mb-4">
                    Once both images are uploaded, click the button below to see yourself in the new outfit.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={handleVirtualTryOn}
                        disabled={!userImage || !garmentImage || isLoading}
                        className="w-full flex-1 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating...
                          </>
                        ) : 'Virtual Try-On'}
                    </button>
                     <button
                        onClick={handleReset}
                        className="w-full sm:w-auto text-gray-300 font-bold py-3 px-6 rounded-md transition duration-300 ease-in-out bg-gray-700 hover:bg-gray-600"
                    >
                        Reset
                    </button>
                </div>
                {error && <p className="text-red-400 mt-4 text-center sm:text-left">{error}</p>}
            </div>
          </div>
          
          <div className="sticky top-8">
            <ResultDisplay resultImage={resultImage} isLoading={isLoading} />
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
