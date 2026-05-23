import React, { useState } from 'react';
import { CharacterProfile } from '../types';

interface CreationChoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectMode: (mode: 'new' | 'template' | 'clone', templateId?: string) => void;
    templates: CharacterProfile[];
}

const CreationChoiceModal: React.FC<CreationChoiceModalProps> = ({ isOpen, onClose, onSelectMode, templates }) => {
    const [step, setStep] = useState<'choice' | 'template-selection'>('choice');

    if (!isOpen) return null;

    const handleBack = () => {
        if (step === 'template-selection') {
            setStep('choice');
        } else {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-4xl w-full p-6 relative shadow-2xl">
                <button 
                    onClick={handleBack}
                    className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="mt-8">
                    {step === 'choice' ? (
                        <>
                            <h2 className="text-3xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500">
                                Bắt Đầu Sáng Tạo
                            </h2>
                            <p className="text-center text-gray-400 mb-8">Chọn cách bạn muốn tạo nhân vật mới</p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Option 1: New Character */}
                                <button 
                                    onClick={() => onSelectMode('new')}
                                    className="group relative bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-pink-500 rounded-xl p-6 transition-all duration-300 flex flex-col items-center text-center h-full"
                                >
                                    <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Tạo Mới Hoàn Toàn</h3>
                                    <p className="text-sm text-gray-400">Thiết kế nhân vật từ con số không với đầy đủ tùy chỉnh chi tiết.</p>
                                </button>

                                {/* Option 2: Appearance Reference */}
                                <button 
                                    onClick={() => onSelectMode('template')}
                                    className="group relative bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-purple-500 rounded-xl p-6 transition-all duration-300 flex flex-col items-center text-center h-full"
                                >
                                    <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Tạo Mẫu Gốc (Template)</h3>
                                    <p className="text-sm text-gray-400">Tạo một nhân vật để làm khuôn mẫu cho các thiết kế sau này.</p>
                                </button>

                                {/* Option 3: Clone */}
                                <button 
                                    onClick={() => setStep('template-selection')}
                                    className="group relative bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-blue-500 rounded-xl p-6 transition-all duration-300 flex flex-col items-center text-center h-full"
                                >
                                    <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Clone Từ Mẫu</h3>
                                    <p className="text-sm text-gray-400">Sử dụng công nghệ AI Banana để tạo biến thể từ nhân vật mẫu có sẵn.</p>
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold text-center mb-6 text-white">Chọn Mẫu Để Clone</h2>
                            {templates.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 text-lg">Chưa có mẫu nào. Hãy tạo "Mẫu Gốc" trước!</p>
                                    <button 
                                        onClick={() => onSelectMode('template')}
                                        className="mt-4 text-pink-400 hover:text-pink-300 underline"
                                    >
                                        Tạo Mẫu Gốc Ngay
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto p-2">
                                    {templates.map(t => (
                                        <button 
                                            key={t.id}
                                            onClick={() => onSelectMode('clone', t.id)}
                                            className="relative aspect-[3/4] rounded-xl overflow-hidden group border-2 border-transparent hover:border-blue-500 transition-all"
                                        >
                                            <img 
                                                src={t.referenceImage || t.singleImages?.[0]?.url} 
                                                alt={t.name}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
                                                <span className="font-bold text-white truncate">{t.name}</span>
                                                <span className="text-xs text-gray-300">{t.gender}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreationChoiceModal;
