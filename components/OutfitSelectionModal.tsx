import React, { useState } from 'react';
import { CharacterProfile, Gender } from '../types';
import { FEMALE_OUTFITS, MALE_OUTFITS, COSPLAY_OUTFITS } from '../constants';

interface OutfitSelectionModalProps {
  character: CharacterProfile;
  onClose: () => void;
  onSelect: (outfit: { name: string; prompt: string }) => void;
  onUploadClick: () => void;
}

const OutfitSelectionModal: React.FC<OutfitSelectionModalProps> = ({ character, onClose, onSelect, onUploadClick }) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [activeTab, setActiveTab] = useState<'regular' | 'cosplay' | 'wardrobe'>('regular');
  const regularOutfits = character.gender === Gender.Male ? MALE_OUTFITS : FEMALE_OUTFITS;
  const wardrobeItems = character.wardrobe || [];
  
  const handleCustomSelect = () => {
    if (customPrompt.trim()) {
      onSelect({ name: 'Tùy chỉnh', prompt: customPrompt });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in" onClick={onClose}>
      <style>{`.animate-fade-in { animation: fade-in 0.2s ease-out; } @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }`}</style>
      <div className="w-full max-w-4xl h-[80vh] bg-gray-900/80 border border-gray-700 rounded-lg flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex-shrink-0 p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Chọn Trang Phục</h2>
          <button onClick={onClose} className="bg-gray-800/80 p-1.5 rounded-full hover:bg-black/80">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-shrink-0 px-4 pt-4">
            <div className="flex border-b border-gray-700 items-center">
                <button onClick={() => setActiveTab('regular')} className={`py-2 px-4 font-semibold ${activeTab === 'regular' ? 'text-pink-400 border-b-2 border-pink-400' : 'text-gray-400'}`}>Trang phục Thường</button>
                <button onClick={() => setActiveTab('cosplay')} className={`py-2 px-4 font-semibold ${activeTab === 'cosplay' ? 'text-pink-400 border-b-2 border-pink-400' : 'text-gray-400'}`}>Trang phục Cosplay</button>
                <button onClick={() => setActiveTab('wardrobe')} className={`py-2 px-4 font-semibold ${activeTab === 'wardrobe' ? 'text-pink-400 border-b-2 border-pink-400' : 'text-gray-400'}`}>Tủ Đồ ({wardrobeItems.length})</button>
                <button 
                  onClick={onUploadClick} 
                  className="ml-auto p-2 text-gray-400 hover:text-pink-500 transition-colors"
                  title="Tải lên trang phục tùy chỉnh"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
            </div>
        </div>
        <div className="flex-grow p-4 overflow-y-auto">
            {activeTab === 'regular' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {regularOutfits.map((outfit, index) => (
                    <button key={index} className="cursor-pointer group" onClick={() => onSelect(outfit)}>
                    <div className="aspect-square bg-gray-800 rounded-lg p-2 flex items-center justify-center text-center border-2 border-transparent group-hover:border-pink-500 group-hover:scale-105 transition-all">
                        <p className="text-sm text-gray-300">{outfit.name}</p>
                    </div>
                    </button>
                ))}
                </div>
            )}
            {activeTab === 'cosplay' && (
                <div className="space-y-4">
                    {COSPLAY_OUTFITS.map(category => (
                        <div key={category.category}>
                            <h3 className="text-pink-400 font-semibold mb-2">{category.category}</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {category.items.map(outfit => (
                                    <button key={outfit.name} className="cursor-pointer group" onClick={() => onSelect(outfit)}>
                                        <div className="aspect-square bg-gray-800 rounded-lg p-2 flex items-center justify-center text-center border-2 border-transparent group-hover:border-pink-500 group-hover:scale-105 transition-all">
                                            <p className="text-sm text-gray-300">{outfit.name}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
             {activeTab === 'wardrobe' && (
                wardrobeItems.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>Tủ đồ của bạn trống. Tải lên ảnh và phân tích để thêm trang phục.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {wardrobeItems.map(item => (
                            <button key={item.id} className="cursor-pointer group" onClick={() => onSelect({ name: item.name, prompt: item.masterPrompt })}>
                                <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden border-2 border-transparent group-hover:border-pink-500 group-hover:scale-105 transition-all">
                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain p-1" />
                                </div>
                                <p className="text-center text-xs mt-2 text-gray-300 truncate">{item.name}</p>
                            </button>
                        ))}
                    </div>
                )
            )}
             <div className="mt-6 pt-4 border-t border-gray-700">
                <h3 className="text-lg font-semibold text-pink-400 mb-2">Trang phục Tùy chỉnh</h3>
                <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Nhập prompt trang phục chi tiết của bạn bằng tiếng Anh..."
                    className="bg-gray-800 p-2 rounded-lg w-full text-sm border border-gray-600 focus:ring-pink-500 focus:border-pink-500"
                    rows={3}
                />
                <button
                    onClick={handleCustomSelect}
                    disabled={!customPrompt.trim()}
                    className="mt-2 w-full bg-purple-600 text-white font-bold py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                    Sử dụng Prompt Tùy chỉnh
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default OutfitSelectionModal;
