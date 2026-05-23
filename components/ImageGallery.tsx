import React, { useEffect, useRef, useState } from 'react';
import { CharacterProfile } from '../types';
import LoadingSpinner from './LoadingSpinner';
// FIX: Imported `extractOutfitFromImage` to handle outfit image uploads correctly.
import { generateCharacterImage, generateSceneSuggestions, extractOutfitFromImage } from '../services/geminiService';

interface ImageGalleryProps {
  profile: CharacterProfile;
  onNewImage: (imageUrl: string) => void;
  onSave: () => void;
  onBackToMenu: () => void;
}

const SummaryItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-gray-800/50 p-2 rounded-lg text-center">
    <div className="text-xs text-gray-400 uppercase tracking-wider">{label}</div>
    <div className="font-semibold text-white text-sm truncate">{value}</div>
  </div>
);

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};


const ImageGallery: React.FC<ImageGalleryProps> = ({ profile, onNewImage, onSave, onBackToMenu }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  const [outfitImageFile, setOutfitImageFile] = useState<File | null>(null);
  const [outfitImageUrl, setOutfitImageUrl] = useState<string | null>(null);
  const [sceneDescription, setSceneDescription] = useState('');
  const [sceneSuggestions, setSceneSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const latestImage = profile.singleImages?.[0]?.url ?? null;
  const initialGenerationTriggered = useRef(false);

  useEffect(() => {
    // Fetch scene suggestions when component mounts
    const fetchSuggestions = async () => {
        setIsSuggesting(true);
        const suggestions = await generateSceneSuggestions(profile);
        setSceneSuggestions(suggestions);
        setIsSuggesting(false);
    };
    fetchSuggestions();
  }, [profile.personality, profile.occupation]);

  const handleGenerate = async (isInitial = false) => {
      setIsLoading(true);
      setError(null);
      setLoadingMessage(isInitial ? "Đang tạo nhân vật của bạn..." : "Đang tạo ảnh mới...");

      try {
          // FIX: The `generateCharacterImage` service expects text prompts, not image data.
          // This logic now correctly converts an uploaded outfit image into a text prompt
          // before calling the image generation service and uses the correct parameter names.
          let outfitPrompt: string | undefined;

          if (outfitImageFile) {
              setLoadingMessage("Phân tích trang phục từ ảnh...");
              const base64 = await fileToBase64(outfitImageFile);
              const outfitDetails = await extractOutfitFromImage(base64, outfitImageFile.type);
              outfitPrompt = outfitDetails.masterPrompt;
              setLoadingMessage("Đang tạo ảnh với trang phục mới...");
          }
          
          const imageBase64Array = await generateCharacterImage(profile, { outfitPrompt, backgroundPrompt: sceneDescription });
          if (imageBase64Array.length > 0) {
              const imageUrl = `data:image/jpeg;base64,${imageBase64Array[0]}`;
              onNewImage(imageUrl);
          } else {
              throw new Error("Image generation failed to return an image.");
          }
      } catch (err) {
          setError("Không thể tạo ảnh. Vui lòng thử lại.");
          console.error(err);
      } finally {
          setIsLoading(false);
      }
  };
  
  // Trigger initial image generation if none exist
  useEffect(() => {
    if ((profile.singleImages?.length || 0) === 0 && !initialGenerationTriggered.current) {
        initialGenerationTriggered.current = true;
        handleGenerate(true);
    }
  }, [profile.singleImages?.length]);

  const handleOutfitUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          setOutfitImageFile(file);
          setOutfitImageUrl(URL.createObjectURL(file));
      }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <div className="w-full aspect-[9/16] bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden lg:sticky top-4">
        {isLoading && (
          <div className="text-center p-4">
            <LoadingSpinner />
            <p className="mt-4 font-semibold text-pink-400">{loadingMessage}</p>
            <p className="text-sm text-gray-400">Việc này có thể mất một lúc.</p>
          </div>
        )}
        {error && !isLoading && <p className="text-red-400 p-4 text-center">{error}</p>}
        {latestImage && !isLoading && <img src={latestImage} alt={profile.name} className="w-full h-full object-cover" />}
        {!latestImage && !isLoading && !error && (
            <div className="text-center p-4">
                 <p className="text-gray-400">Ảnh nhân vật sẽ xuất hiện ở đây.</p>
            </div>
        )}
      </div>
      
      <div>
        <h2 className="text-3xl font-bold mb-2">{profile.name}</h2>
        <div className="grid grid-cols-3 gap-2 mb-6">
          <SummaryItem label="Sắc tộc" value={profile.ethnicity} />
          <SummaryItem label="Tuổi" value={profile.age.toString()} />
          <SummaryItem label="Kiểu tóc" value={profile.hairStyle} />
          <SummaryItem label="Tính cách" value={profile.personality} />
          <SummaryItem label="Nghề nghiệp" value={profile.occupation} />
          <SummaryItem label="Dáng người" value={profile.bodyType} />
        </div>

        {/* AI Wardrobe Section */}
        <div className="bg-gray-800/50 p-4 rounded-lg space-y-4">
          <h3 className="font-bold text-lg text-pink-400">🎨 Studio Sáng Tạo AI</h3>
          <div>
              <label className="block text-sm font-semibold mb-2">1. Tải Lên Trang Phục (Tùy chọn)</label>
              <input type="file" onChange={handleOutfitUpload} accept="image/jpeg,image/png" className="text-sm w-full file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600"/>
              {outfitImageUrl && <img src={outfitImageUrl} alt="Outfit Preview" className="mt-2 rounded w-16 h-16 object-cover" />}
          </div>
           <div>
              <label htmlFor="scene" className="block text-sm font-semibold mb-2">2. Mô Tả Bối Cảnh</label>
              <textarea id="scene" value={sceneDescription} onChange={(e) => setSceneDescription(e.target.value)} placeholder="VD: Đứng trên ban công nhìn ra thành phố cyberpunk..." className="bg-gray-900 p-2 rounded-lg w-full text-sm" rows={2}></textarea>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-2">Gợi ý bối cảnh:</h4>
            {isSuggesting ? <p className="text-xs text-gray-400">Đang tải gợi ý...</p> : (
              <div className="flex flex-wrap gap-2">
                {sceneSuggestions.map(s => <button key={s} onClick={() => setSceneDescription(s)} className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded-full transition-colors">{s}</button>)}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
            <button 
              onClick={() => handleGenerate()}
              disabled={isLoading}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-2.5 px-6 rounded-lg transition-transform duration-200 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-full"
            >
              {isLoading ? 'Đang tạo...' : '✨ Tạo Ảnh Mới'}
            </button>
            <button 
              onClick={onSave} 
              disabled={isLoading || (profile.singleImages?.length || 0) === 0}
              className="bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold py-2.5 px-6 rounded-lg transition-transform duration-200 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed w-full"
            >
              Lưu vào Thư viện
            </button>
             <button disabled className="w-full bg-blue-800/50 text-white/70 font-bold py-2.5 px-6 rounded-lg cursor-not-allowed">
              🎬 Xây Dựng Kịch Bản Video (Sắp có)
             </button>
            <button 
              onClick={onBackToMenu} 
              disabled={isLoading}
              className="border-2 border-gray-600 text-gray-300 font-bold py-2 px-6 rounded-lg transition-colors duration-200 hover:bg-gray-700 hover:border-gray-500 disabled:opacity-50 w-full"
            >
              Về Màn Hình Chính
            </button>
        </div>
      </div>
    </div>
  );
};

export default ImageGallery;
