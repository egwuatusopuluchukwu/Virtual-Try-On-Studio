
import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { virtualTryOn, editImage } from './services/geminiService';

const Header: React.FC = () => (
  <header className="text-center p-4 md:p-6">
    <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
      Virtual Try-On & Image Editor
    </h1>
    <p className="mt-2 text-lg text-gray-400">Virtually try on clothes and edit your look with AI.</p>
  </header>
);

type Tab = 'try-on' | 'edit';

const Tabs: React.FC<{ activeTab: Tab; setActiveTab: (tab: Tab) => void; isEditDisabled: boolean; }> = ({ activeTab, setActiveTab, isEditDisabled }) => {
  const tabs: { id: Tab; label: string; disabled?: boolean }[] = [
    { id: 'try-on', label: 'Virtual Try-On' },
    { id: 'edit', label: 'Image Editor', disabled: isEditDisabled },
  ];

  return (
    <div className="flex justify-center border-b border-gray-700 mb-8">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => !tab.disabled && setActiveTab(tab.id)}
          disabled={tab.disabled}
          className={`px-4 sm:px-6 py-3 text-base sm:text-lg font-medium transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-t-md
            ${
              activeTab === tab.id
                ? 'border-b-2 border-purple-500 text-white'
                : 'text-gray-400 hover:text-white'
            }
            ${
              tab.disabled ? 'cursor-not-allowed opacity-50' : ''
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};


const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('try-on');
  
  // Try-on state
  const [userImage, setUserImage] = useState<{ file: File; base64: string } | null>(null);
  const [garmentImage, setGarmentImage] = useState<{ file: File; base64: string } | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [resultMimeType, setResultMimeType] = useState<string>('image/png');
  const [isTryOnLoading, setIsTryOnLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Edit state
  const [editPrompt, setEditPrompt] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (file: File, setter: React.Dispatch<React.SetStateAction<{ file: File; base64: string; } | null>>) => {
    try {
      const base64 = await fileToBase64(file);
      setter({ file, base64 });
    } catch (err) {
      setError('Failed to load image.');
    }
  };
  
  const handleVirtualTryOn = useCallback(async () => {
    if (!userImage || !garmentImage) {
      setError("Please upload both your photo and a garment photo.");
      return;
    }
    setIsTryOnLoading(true);
    setError(null);
    setResultImage(null);
    try {
      const generatedImage = await virtualTryOn(userImage.base64, userImage.file.type, garmentImage.base64, garmentImage.file.type);
      setResultImage(`data:image/png;base64,${generatedImage}`);
      setResultMimeType('image/png'); // Gemini image generation typically returns PNG
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to generate the try-on image. An unknown error occurred.");
    } finally {
      setIsTryOnLoading(false);
    }
  }, [userImage, garmentImage]);

  const handleEditImage = useCallback(async () => {
    if (!resultImage || !editPrompt) {
      setError("An image and a prompt are required for editing.");
      return;
    }
    setIsEditing(true);
    setError(null);
    try {
      const base64Image = resultImage.split(',')[1];
      const newImage = await editImage(base64Image, resultMimeType, editPrompt);
      setResultImage(`data:image/png;base64,${newImage}`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to edit the image. An unknown error occurred.");
    } finally {
      setIsEditing(false);
    }
  }, [resultImage, editPrompt, resultMimeType]);
  
  const handleReset = () => {
    setUserImage(null);
    setGarmentImage(null);
    setResultImage(null);
    setEditPrompt('');
    setError(null);
    setIsTryOnLoading(false);
    setIsEditing(false);
    setActiveTab('try-on');
  };

  const isLoading = isTryOnLoading || isEditing;
  
  const getLoadingText = () => {
    if (isTryOnLoading) return "Generating Your Look...";
    if (isEditing) return "Applying AI Edits...";
    return "";
  };


  const renderControls = () => {
    switch(activeTab) {
      case 'try-on':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ImageUploader 
                  onImageUpload={(file) => handleImageUpload(file, setUserImage)}
                  previewUrl={userImage ? URL.createObjectURL(userImage.file) : null}
                  title="Upload Your Photo"
                  description="Upload a full-body photo for best results."
              />
              <ImageUploader 
                  onImageUpload={(file) => handleImageUpload(file, setGarmentImage)}
                  previewUrl={garmentImage ? URL.createObjectURL(garmentImage.file) : null}
                  title="Upload Garment"
                  description="Upload a photo of the clothing item."
              />
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <button
                  onClick={handleVirtualTryOn}
                  disabled={!userImage || !garmentImage || isLoading}
                  className="w-full text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                  {isTryOnLoading ? 'Generating...' : 'Virtual Try-On'}
              </button>
            </div>
          </>
        );
      case 'edit':
        return (
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-4">
              <h3 className="text-xl font-bold text-gray-200">Edit Your Image</h3>
              <p className="text-gray-400">Describe the changes you want to make. For example, "Add a retro filter" or "Change the background to Paris".</p>
              <textarea
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                placeholder="e.g., Make the shirt blue..."
                className="w-full h-24 p-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                aria-label="Edit prompt"
              />
              <button
                onClick={handleEditImage}
                disabled={isLoading || !editPrompt}
                className="w-full text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isEditing ? 'Applying...' : 'Apply Edit'}
              </button>
            </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
      <Header />
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} isEditDisabled={!resultImage} />
      <main className="flex-grow container mx-auto p-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          <div className="space-y-8">
            {renderControls()}
            
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-4 text-gray-200">Controls</h3>
                <p className="text-gray-400 mb-4">
                    Generated a result you don't like? Clear everything and start over.
                </p>
                <button
                    onClick={handleReset}
                    className="w-full sm:w-auto text-gray-300 font-bold py-3 px-6 rounded-md transition duration-300 ease-in-out bg-gray-700 hover:bg-gray-600"
                >
                    Reset All
                </button>
                {error && <p className="text-red-400 mt-4 text-center sm:text-left">{error}</p>}
            </div>
          </div>
          
          <div className="sticky top-8">
            <ResultDisplay 
                resultImage={resultImage}
                isLoading={isLoading}
                loadingText={getLoadingText()}
            />
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
