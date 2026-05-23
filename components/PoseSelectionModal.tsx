import React, { useState } from 'react';
import { CharacterProfile, Gender } from '../types';
import { FEMALE_POSES, MALE_POSES } from '../constants';

interface PoseSelectionModalProps {
  character: CharacterProfile;
  onClose: () => void;
  onSelect: (pose: { name: string; prompt: string }) => void;
}

const PoseSelectionModal: React.FC<PoseSelectionModalProps> = ({ character, onClose, onSelect }) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const poses = character.gender === Gender.Male ? MALE_POSES : FEMALE_POSES;

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
          <h2 className="text-xl font-bold text-white">Chọn Tư Thế</h2>
          <button onClick={onClose} className="bg-gray-800/80 p-1.5 rounded-full hover:bg-black/80">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-grow p-4 overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {poses.map((pose, index) => (
                <button key={index} className="cursor-pointer group" onClick={() => onSelect(pose)}>
                  <div className="aspect-square bg-gray-800 rounded-lg p-2 flex items-center justify-center text-center border-2 border-transparent group-hover:border-pink-500 group-hover:scale-105 transition-all">
                     <p className="text-sm text-gray-300">{pose.name}</p>
                  </div>
                </button>
              ))}
            </div>
             <div className="mt-6 pt-4 border-t border-gray-700">
                <h3 className="text-lg font-semibold text-pink-400 mb-2">Tư thế Tùy chỉnh</h3>
                <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Nhập prompt tư thế chi tiết của bạn bằng tiếng Anh..."
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

export default PoseSelectionModal;
