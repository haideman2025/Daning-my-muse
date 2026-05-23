import React from 'react';

interface ClothingChoiceModalProps {
  items: string[];
  onSelect: (item: string) => void;
  onClose: () => void; // Added for cases where user might want to close without choosing, though not used in current flow
}

const ClothingChoiceModal: React.FC<ClothingChoiceModalProps> = ({ items, onSelect, onClose }) => {
    return (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <style>{`.animate-fade-in { animation: fade-in 0.2s ease-out; } @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }`}</style>
            <div className="w-full max-w-md bg-gray-900/90 border border-pink-500/50 rounded-lg flex flex-col shadow-2xl shadow-pink-500/20" onClick={e => e.stopPropagation()}>
                <div className="flex-shrink-0 p-4 border-b border-pink-500/30">
                    <h2 className="text-xl font-bold text-white text-center">Chọn một món đồ...</h2>
                </div>
                <div className="flex-grow p-6 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                        {items.map(item => (
                            <button
                                key={item}
                                onClick={() => onSelect(item)}
                                className="w-full capitalize text-white bg-gray-800/80 p-4 rounded-lg border border-gray-700 hover:bg-pink-600/80 hover:border-pink-500 transition-all duration-200 transform hover:scale-105"
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClothingChoiceModal;