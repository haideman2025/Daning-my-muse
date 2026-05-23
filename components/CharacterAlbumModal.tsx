import React, { useState } from 'react';
import { CharacterProfile, GalleryImage } from '../types';
import { usePreview } from './PreviewContext';

interface CharacterAlbumModalProps {
    character: CharacterProfile;
    onClose: () => void;
    onDeleteImage: (characterId: string, imageId: string) => void;
}

const CharacterAlbumModal: React.FC<CharacterAlbumModalProps> = ({ character, onClose, onDeleteImage }) => {
    const { showPreview } = usePreview();
    const [filter, setFilter] = useState<'all' | 'costume' | 'story'>('all');

    const images = character.singleImages || [];
    
    const filteredImages = images.filter(img => {
        if (filter === 'all') return true;
        if (filter === 'costume') return img.prompt?.toLowerCase().includes('costume') || img.prompt?.toLowerCase().includes('outfit');
        if (filter === 'story') return !img.prompt?.toLowerCase().includes('costume') && !img.prompt?.toLowerCase().includes('outfit');
        return true;
    });

    const sortedImages = [...filteredImages].sort((a, b) => b.createdAt - a.createdAt);

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-900 border border-gray-800 w-full max-w-6xl h-[90vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-gray-900/50 backdrop-blur-sm z-10">
                    <div className="flex items-center gap-4">
                        <img 
                            src={character.singleImages?.[0]?.url || character.referenceImage} 
                            alt={character.name} 
                            className="w-12 h-12 rounded-full object-cover border-2 border-pink-500"
                        />
                        <div>
                            <h2 className="text-2xl font-bold text-white">Album: {character.name}</h2>
                            <p className="text-sm text-gray-400">{images.length} ảnh</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Filter Tabs */}
                <div className="px-6 py-4 border-b border-gray-800 flex gap-4 overflow-x-auto">
                    <button 
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${filter === 'all' ? 'bg-white text-black' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                    >
                        Tất cả
                    </button>
                    <button 
                        onClick={() => setFilter('costume')}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${filter === 'costume' ? 'bg-pink-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                    >
                        Trang phục
                    </button>
                     <button 
                        onClick={() => setFilter('story')}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${filter === 'story' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                    >
                        Khoảnh khắc
                    </button>
                </div>

                {/* Grid */}
                <div className="flex-grow overflow-y-auto p-6">
                    {sortedImages.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {sortedImages.map((img) => (
                                <div key={img.id} className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-800">
                                    <img 
                                        src={img.url} 
                                        alt="Gallery Item" 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-zoom-in"
                                        onClick={() => showPreview(img.url)}
                                    />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                                        <button 
                                            onClick={() => showPreview(img.url)}
                                            className="p-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 text-white transition-colors"
                                            title="Xem"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if(confirm("Bạn có chắc muốn xóa ảnh này?")) onDeleteImage(character.id, img.id);
                                            }}
                                            className="p-2 bg-red-500/80 backdrop-blur-md rounded-full hover:bg-red-600 text-white transition-colors"
                                            title="Xóa"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <p className="text-xs text-gray-300 truncate">{new Date(img.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p>Chưa có hình ảnh nào trong album này.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CharacterAlbumModal;
