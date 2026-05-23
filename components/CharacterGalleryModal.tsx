
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { v4 as uuidv4 } from 'uuid';
import { CharacterProfile, Lookbook, VideoAsset, Storyboard } from '../types';
import { JAPANESE_DANCE_MOVES } from '../constants';
import { generateDanceVideo, pollVideoOperation, extendDanceVideo } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

interface CharacterGalleryModalProps {
  character: CharacterProfile;
  onClose: () => void;
  onUpdate: (updatedCharacter: CharacterProfile) => void;
}

const DownloadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const VideoIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 001.553.832l3-2a1 1 0 000-1.664l-3-2z" />
    </svg>
);

const ExtendIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
    </svg>
);


// Helper component for Dance Selection
const DanceSelectionModal: React.FC<{ 
    onGenerate: (dance: { name: string, prompt: string }) => void; 
    onClose: () => void; 
    isGenerating: boolean; 
}> = ({ onGenerate, onClose, isGenerating }) => {
    const [selectedDance, setSelectedDance] = useState<{ name: string, prompt: string } | null>(null);

    const handleConfirmAndGenerate = () => {
        if (selectedDance) {
            onGenerate(selectedDance);
        }
    };

    return (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[120] p-4" onClick={onClose}>
            <div className="w-full max-w-2xl h-auto max-h-[80vh] bg-gray-900/90 border border-gray-700 rounded-lg flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex-shrink-0 p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">{selectedDance ? 'Xác nhận tạo Video' : 'Chọn một điệu nhảy'}</h2>
                    <button onClick={onClose}>&times;</button>
                </div>
                {selectedDance ? (
                     <div className="flex-grow p-8 flex flex-col items-center justify-center text-center">
                        <p className="text-gray-400">Tạo video với điệu nhảy:</p>
                        <h3 className="text-2xl font-bold text-white my-2">{selectedDance.name}</h3>
                        <div className="flex gap-4 mt-6">
                            <button onClick={() => setSelectedDance(null)} disabled={isGenerating} className="bg-gray-700 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-600 disabled:opacity-50">Chọn Lại</button>
                            <button 
                                onClick={handleConfirmAndGenerate} 
                                disabled={isGenerating} 
                                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-2 px-8 rounded-lg transition-transform hover:scale-105 disabled:opacity-50 flex items-center justify-center"
                            >
                                <VideoIcon />
                                <span className="ml-2">{isGenerating ? 'Đang tạo...' : 'Tạo Video'}</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex-grow p-4 overflow-y-auto space-y-4">
                        {JAPANESE_DANCE_MOVES.map(category => (
                            <div key={category.category}>
                                <h3 className="text-pink-400 font-semibold mb-2">{category.category}</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {category.items.map(dance => (
                                         <button key={dance.name} onClick={() => setSelectedDance(dance)} disabled={isGenerating} className="aspect-square bg-gray-800 rounded-lg p-2 flex items-center justify-center text-center border-2 border-transparent hover:border-pink-500 hover:scale-105 transition-all disabled:opacity-50">
                                            <p className="text-sm text-gray-300 font-semibold">{dance.name}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};


const CharacterGalleryModal: React.FC<CharacterGalleryModalProps> = ({ character, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'singles' | 'videos' | 'storyboards'>('singles');
  const [isViewingSingles, setIsViewingSingles] = useState(false);
  const [viewingVideo, setViewingVideo] = useState<VideoAsset | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [isDanceModalOpen, setIsDanceModalOpen] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoGenStatus, setVideoGenStatus] = useState('');
  const [videoGenError, setVideoGenError] = useState<string | null>(null);

  const [isExtensionPromptOpen, setIsExtensionPromptOpen] = useState(false);
  const [extensionPrompt, setExtensionPrompt] = useState('continues her dance gracefully');
  
  const singleImages = character.singleImages?.sort((a,b) => b.createdAt - a.createdAt) || [];
  const videos = character.videos?.sort((a,b) => b.createdAt - a.createdAt) || [];
  const storyboards = character.storyboards?.sort((a,b) => b.createdAt - a.createdAt) || [];


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
          if (isExtensionPromptOpen) setIsExtensionPromptOpen(false);
          else if (viewingVideo) setViewingVideo(null);
          else if (isViewingSingles) setIsViewingSingles(false);
          else if (isDanceModalOpen) setIsDanceModalOpen(false);
          else onClose();
      }
      if (isViewingSingles) {
        if (event.key === 'ArrowRight') nextImage();
        if (event.key === 'ArrowLeft') prevImage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isViewingSingles, currentIndex, singleImages.length, viewingVideo, isExtensionPromptOpen, isDanceModalOpen]);

  const nextImage = () => {
    if (singleImages.length > 0) {
        setCurrentIndex((prev) => (prev + 1) % singleImages.length);
    }
  };

  const prevImage = () => {
    if (singleImages.length > 0) {
        setCurrentIndex((prev) => (prev - 1 + singleImages.length) % singleImages.length);
    }
  };

  const checkAndPromptApiKey = async (): Promise<boolean> => {
    try {
        // DEFENSIVE CHECK: Ensure aistudio object exists before accessing
        if (typeof (window as any).aistudio !== 'undefined' && (window as any).aistudio.hasSelectedApiKey) {
            const hasKey = await (window as any).aistudio.hasSelectedApiKey();
            if (!hasKey) {
                await (window as any).aistudio.openSelectKey();
                return true;
            }
            return true;
        } else {
            console.warn("AI Studio context not found. Assuming external API key management.");
            // If running outside AI Studio, assume key is provided via env/proxy or fail gracefully.
            // For this app structure, we'll assume true but warn.
            return true; 
        }
    } catch (e) {
        console.error("API key check failed", e);
        setVideoGenError("Không thể kiểm tra API key. Vui lòng thử lại.");
        return false;
    }
  };
  
 const handleGenerateDanceVideo = async (dance: { name: string, prompt: string }) => {
    const hasApiKey = await checkAndPromptApiKey();
    if (!hasApiKey) {
        setVideoGenError("Cần có API key để tạo video. Vui lòng chọn một key trong cài đặt.");
        setIsDanceModalOpen(false);
        return;
    }

    const sourceImageUrl = singleImages[currentIndex]?.url;
    if (!sourceImageUrl) {
        setVideoGenError("Không tìm thấy ảnh nguồn để tạo video.");
        setIsDanceModalOpen(false);
        return;
    }
    
    setIsDanceModalOpen(false);
    setIsViewingSingles(false);
    setActiveTab('videos');
    setVideoGenError(null);

    const placeholderVideo: VideoAsset = {
        id: uuidv4(),
        url: sourceImageUrl, // Use thumbnail as placeholder
        createdAt: Date.now(),
        prompt: `Đang tạo: ${dance.prompt}`,
        isProcessing: true,
    };

    onUpdate({ ...character, videos: [placeholderVideo, ...(character.videos || [])] });

    const imageB64 = sourceImageUrl.split(',')[1];
    
    generateDanceVideo(
        character,
        imageB64,
        dance.prompt,
        (result) => { // onSuccess callback
            const newVideo: VideoAsset = {
                ...placeholderVideo,
                ...result,
                isProcessing: false,
            };
            onUpdate({
                ...character,
                videos: (character.videos || []).map(v => v.id === placeholderVideo.id ? newVideo : v),
            });
        },
        (error) => { // onError callback
            console.error(error);
            // Remove the placeholder on failure
            onUpdate({
                ...character,
                videos: (character.videos || []).filter(v => v.id !== placeholderVideo.id),
            });
            // Optionally set a global error message
            setVideoGenError(`Tạo video thất bại: ${error.message}`);
        }
    );
};

  const handleExtendVideo = async () => {
    if (!viewingVideo || !extensionPrompt.trim()) return;

    setIsExtensionPromptOpen(false);
    const hasApiKey = await checkAndPromptApiKey();
    if (!hasApiKey) return;
    
    setVideoGenError(null);
    setViewingVideo(null); // Close viewer to see loading state in gallery
    setActiveTab('videos');

    const videoToExtend = { ...viewingVideo, isProcessing: true };
    
    onUpdate({
        ...character,
        videos: (character.videos || []).map(v => v.id === videoToExtend.id ? videoToExtend : v),
    });

    extendDanceVideo(
        character,
        videoToExtend,
        extensionPrompt,
        (result) => { // onSuccess
            const updatedVideo: VideoAsset = {
                ...videoToExtend,
                ...result,
                isProcessing: false,
            };
            onUpdate({
                ...character,
                videos: (character.videos || []).map(v => v.id === updatedVideo.id ? updatedVideo : v)
            });
        },
        (error) => { // onError
            console.error(error);
            // Revert processing state on failure
            onUpdate({
                ...character,
                videos: (character.videos || []).map(v => v.id === videoToExtend.id ? { ...v, isProcessing: false } : v)
            });
            setVideoGenError(`Mở rộng video thất bại: ${error.message}`);
        }
    );
};


  const renderImageViewer = () => (
     <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[110] flex flex-col p-4" onClick={() => setIsViewingSingles(false)}>
         {isDanceModalOpen && <DanceSelectionModal onClose={() => setIsDanceModalOpen(false)} onGenerate={handleGenerateDanceVideo} isGenerating={isGeneratingVideo} />}
         
         <div className="flex-shrink-0 flex justify-between items-center text-white mb-4">
             <h3 className="font-bold text-lg">Ảnh Lẻ ({currentIndex + 1}/{singleImages.length})</h3>
             <button onClick={() => setIsViewingSingles(false)} className="font-bold">&larr; Trở lại Album</button>
         </div>
         <div className="relative flex-grow flex items-center justify-center h-0">
            {isGeneratingVideo && !isDanceModalOpen ? (
                <div className="text-center">
                    <LoadingSpinner />
                    <p className="mt-4 text-pink-400 font-semibold">{videoGenStatus}</p>
                    {videoGenError && <p className="mt-2 text-red-400 text-sm">{videoGenError}</p>}
                </div>
            ) : (
                <>
                    <img src={singleImages[currentIndex].url} alt={`View ${currentIndex + 1}`} className="max-w-full max-h-full object-contain rounded-lg"/>
                    <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 p-3 rounded-full hover:bg-black/80">&lt;</button>
                    <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 p-3 rounded-full hover:bg-black/80">&gt;</button>
                </>
            )}
         </div>
         <div className="flex-shrink-0 pt-4">
             <div className="flex space-x-2 overflow-x-auto pb-4 justify-center">
                 {singleImages.map((img, index) => (
                     <button key={img.id} onClick={(e) => { e.stopPropagation(); setCurrentIndex(index); }} className={`w-20 h-28 rounded-md overflow-hidden flex-shrink-0 border-2 ${index === currentIndex ? 'border-pink-500 scale-105' : 'border-transparent hover:border-gray-500'}`}>
                         <img src={img.url} alt={`Thumb ${index + 1}`} className="w-full h-full object-cover"/>
                     </button>
                 ))}
             </div>
              <div className="px-4 pb-2 text-center">
                <div className="flex items-center justify-center gap-4">
                    <a href={singleImages[currentIndex].url} download={`${character.name}_image_${currentIndex}.jpg`} onClick={e => e.stopPropagation()} className="bg-gray-600/80 p-3 rounded-full hover:bg-gray-500 transition-colors" title="Tải ảnh này">
                        <DownloadIcon />
                    </a>
                    <button onClick={(e) => { e.stopPropagation(); setIsDanceModalOpen(true); }} className="bg-pink-600/80 p-3 rounded-full hover:bg-pink-500 transition-colors" title="Tạo Video Dance">
                        <VideoIcon />
                    </button>
                </div>
                 <p className="mt-4 text-xs text-gray-400">
                    Việc tạo video yêu cầu API key và là tính năng có tính phí. <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-pink-400">Tìm hiểu thêm</a>.
                 </p>
             </div>
         </div>
     </div>
  );

  const renderVideoViewer = () => {
    if (!viewingVideo) return null;
    const extensionCount = viewingVideo.extensionCount || 0;
    const canExtend = extensionCount < 8; // Max ~1 minute video

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[110] flex flex-col p-4" onClick={() => setViewingVideo(null)}>
             {isExtensionPromptOpen && (
                <div className="absolute inset-0 bg-black/80 z-20 flex items-center justify-center" onClick={() => setIsExtensionPromptOpen(false)}>
                    <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold mb-4">Mở rộng Video</h3>
                        <p className="text-sm text-gray-400 mb-4">Mô tả hành động tiếp theo cho nhân vật (bằng tiếng Anh). AI sẽ tự động tạo thêm 7 giây video.</p>
                        <textarea
                            value={extensionPrompt}
                            onChange={e => setExtensionPrompt(e.target.value)}
                            className="w-full bg-gray-800 p-2 rounded text-white"
                            rows={3}
                        />
                        <div className="flex justify-end gap-2 mt-4">
                             <button onClick={() => setIsExtensionPromptOpen(false)} className="bg-gray-600 py-2 px-4 rounded">Hủy</button>
                             <button onClick={handleExtendVideo} disabled={!extensionPrompt.trim()} className="bg-pink-600 py-2 px-4 rounded disabled:opacity-50">Xác nhận</button>
                        </div>
                    </div>
                </div>
            )}
             <div className="flex-shrink-0 flex justify-between items-center text-white mb-4">
                 <h3 className="font-bold text-lg">Video Player</h3>
                 <button onClick={() => setViewingVideo(null)} className="font-bold">&larr; Trở lại Album</button>
             </div>
             <div className="relative flex-grow flex items-center justify-center h-0">
                {isGeneratingVideo ? (
                    <div className="text-center">
                        <LoadingSpinner />
                        <p className="mt-4 text-pink-400 font-semibold">{videoGenStatus}</p>
                        {videoGenError && <p className="mt-2 text-red-400 text-sm">{videoGenError}</p>}
                    </div>
                ) : (
                    <>
                        <video src={viewingVideo.url} controls autoPlay className="max-w-full max-h-full object-contain rounded-lg" />
                         <div className="absolute bottom-4 left-4 flex gap-2">
                            <a href={viewingVideo.url} download={`${character.name}_video.mp4`} onClick={e => e.stopPropagation()} className="bg-gray-600/80 p-3 rounded-full hover:bg-gray-500 transition-colors" title="Tải video này">
                                <DownloadIcon />
                            </a>
                            <button onClick={(e) => { e.stopPropagation(); setIsExtensionPromptOpen(true); }} disabled={!canExtend} className="bg-purple-600/80 p-3 rounded-full hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title={canExtend ? "Mở rộng video thêm 7 giây" : "Đã đạt độ dài tối đa"}>
                                <ExtendIcon />
                            </button>
                         </div>
                         <div className="absolute bottom-4 right-4 text-xs bg-black/50 px-2 py-1 rounded-full">{`Đã mở rộng: ${extensionCount}/8 lần`}</div>
                    </>
                )}
             </div>
        </div>
    )
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex flex-col z-[100] p-4 animate-fade-in" onClick={onClose}>
        <style>{`.animate-fade-in { animation: fade-in 0.2s ease-out; } @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }`}</style>
        {isViewingSingles && renderImageViewer()}
        {viewingVideo && renderVideoViewer()}
        <div className="w-full max-w-7xl mx-auto flex flex-col h-full bg-gray-900/80 rounded-lg overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex-shrink-0 p-4 border-b border-gray-700 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="w-full sm:w-auto">
                    <h2 className="text-xl sm:text-2xl font-bold text-white text-center sm:text-left">Album của {character.name}</h2>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-2 mt-2">
                        <button onClick={() => setActiveTab('singles')} className={`py-1 font-semibold ${activeTab === 'singles' ? 'text-pink-400 border-b-2 border-pink-400' : 'text-gray-400'}`}>Ảnh Lẻ ({singleImages.length})</button>
                        <button onClick={() => setActiveTab('videos')} className={`py-1 font-semibold ${activeTab === 'videos' ? 'text-pink-400 border-b-2 border-pink-400' : 'text-gray-400'}`}>Videos ({videos.length})</button>
                        <button onClick={() => setActiveTab('storyboards')} className={`py-1 font-semibold ${activeTab === 'storyboards' ? 'text-pink-400 border-b-2 border-pink-400' : 'text-gray-400'}`}>Storyboards ({storyboards.length})</button>
                    </div>
                </div>
                <button onClick={onClose} className="bg-gray-800/80 p-1.5 rounded-full hover:bg-black/80 self-center sm:self-auto"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="flex-grow p-4 overflow-y-auto">
                {activeTab === 'singles' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {singleImages.map((image, index) => (
                            <div key={image.id} className="relative aspect-[3/4] rounded-lg overflow-hidden cursor-pointer group" onClick={() => { setCurrentIndex(index); setIsViewingSingles(true); }}>
                                <img src={image.url} alt={`single-${index}`} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {activeTab === 'videos' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {videoGenError && <p className="col-span-full text-center text-red-400">{videoGenError}</p>}
                        {videos.map((video, index) => (
                            <div key={video.id} className="relative aspect-[9/16] rounded-lg overflow-hidden cursor-pointer group bg-black" onClick={() => !video.isProcessing && setViewingVideo(video)}>
                                {video.isProcessing ? (
                                    <>
                                        <img src={video.url} alt="Processing..." className="w-full h-full object-cover opacity-30" />
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                                            <LoadingSpinner />
                                            <p className="text-xs text-white mt-2 font-semibold">Đang xử lý...</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <video src={video.url} className="w-full h-full object-cover pointer-events-none" />
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                {activeTab === 'storyboards' && (
                    <div className="space-y-4">
                        {storyboards.map((storyboard) => (
                            <div key={storyboard.id} className="bg-gray-800/50 p-4 rounded-lg">
                                <h3 className="font-bold text-white text-lg">{storyboard.title}</h3>
                                <p className="text-sm text-gray-400">Thể loại: {storyboard.category} | {storyboard.scenes.length} cảnh</p>
                                <div className="flex gap-2 overflow-x-auto mt-2 pb-2">
                                    {storyboard.scenes.map(scene => (
                                        <div key={scene.id} className="flex-shrink-0 w-32 aspect-video bg-gray-900 rounded-md overflow-hidden">
                                            {scene.imageUrl && <img src={scene.imageUrl} alt={`Scene ${scene.sceneNumber}`} className="w-full h-full object-cover" />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default CharacterGalleryModal;
