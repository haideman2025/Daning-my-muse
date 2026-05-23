import React from 'react';
import { WardrobeItem } from '../types';

interface WardrobeModalProps {
  wardrobe: WardrobeItem[];
  onClose: () => void;
  onSelect: (item: WardrobeItem) => void;
}

const WardrobeModal: React.FC<WardrobeModalProps> = ({ wardrobe, onClose, onSelect }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in" onClick={onClose}>
        <style>{`.animate-fade-in { animation: fade-in 0.2s ease-out; } @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }`}</style>
      <div className="w-full max-w-4xl h-[80vh] bg-gray-900/80 border border-gray-700 rounded-lg flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex-shrink-0 p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Tủ Đồ</h2>
          <button onClick={onClose} className="bg-gray-800/80 p-1.5 rounded-full hover:bg-black/80">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-grow p-4 overflow-y-auto">
          {wardrobe.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>Tủ đồ của bạn trống. Hãy tách trang phục từ ảnh để thêm vào đây.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {wardrobe.map(item => (
                <div key={item.id} className="cursor-pointer group" onClick={() => onSelect(item)}>
                  <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden border-2 border-transparent group-hover:border-pink-500 group-hover:scale-105 transition-all">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" />
                  </div>
                  <p className="text-center text-xs mt-2 text-gray-300 truncate">{item.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WardrobeModal;