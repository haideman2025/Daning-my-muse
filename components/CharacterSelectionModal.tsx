import React from 'react';
import { CharacterProfile } from '../types';

interface CharacterSelectionModalProps {
  characters: CharacterProfile[];
  onClose: () => void;
  onSelect: (character: CharacterProfile) => void;
  currentCharacterId: string;
}

const getLatestImageUrl = (character: CharacterProfile): string | undefined => {
    const singleImages = character.singleImages || [];
    if (singleImages.length > 0) {
        return singleImages.sort((a, b) => b.createdAt - a.createdAt)[0].url;
    }
    return undefined;
};

const CharacterSelectionModal: React.FC<CharacterSelectionModalProps> = ({ characters, onClose, onSelect, currentCharacterId }) => {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in" onClick={onClose}>
            <style>{`.animate-fade-in { animation: fade-in 0.2s ease-out; } @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }`}</style>
            <div className="w-full max-w-4xl h-auto max-h-[80vh] bg-gray-900/80 border border-gray-700 rounded-lg flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex-shrink-0 p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Chọn Muse Để Chơi Cùng</h2>
                    <button onClick={onClose} className="bg-gray-800/80 p-1.5 rounded-full hover:bg-black/80">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="flex-grow p-6 overflow-y-auto">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {characters.map(char => {
                            const latestImage = getLatestImageUrl(char);
                            const isSelected = char.id === currentCharacterId;
                            return (
                                <button
                                    key={char.id}
                                    onClick={() => onSelect(char)}
                                    className={`relative aspect-[3/4] rounded-lg overflow-hidden group transition-all duration-300 border-4 ${isSelected ? 'border-pink-500' : 'border-transparent hover:border-pink-500/50'}`}
                                >
                                    <img src={latestImage || `https://placehold.co/300x400/2D2D3A/FFFFFF?text=${encodeURIComponent(char.name)}&font=poppins`} alt={char.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-2 flex items-end">
                                        <h3 className="text-sm font-bold text-white leading-tight">{char.name}</h3>
                                    </div>
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center border-2 border-gray-900">
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CharacterSelectionModal;
