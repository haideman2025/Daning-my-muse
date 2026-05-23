import React, { useState } from 'react';
import { CharacterProfile } from '../types';
import { View } from '../App';
import { usePreview } from './PreviewContext';
import CharacterAlbumModal from './CharacterAlbumModal';

const getLatestImageUrl = (character: CharacterProfile): string | undefined => {
    const singleImages = character.singleImages || [];
    if (singleImages.length === 0) return undefined;
    // Sort by createdAt descending to get the latest
    const latestSingle = singleImages.sort((a, b) => b.createdAt - a.createdAt)[0];
    return latestSingle.url;
};


// Modal Component
const CharacterDetailModal: React.FC<{
  character: CharacterProfile;
  onClose: () => void;
  onEdit: (character: CharacterProfile) => void;
  onEnterStudio: (character: CharacterProfile) => void;
  onEnterCostumeStudio: (character: CharacterProfile) => void;
  onOpenAlbum: (character: CharacterProfile) => void;
}> = ({ character, onClose, onEdit, onEnterStudio, onEnterCostumeStudio, onOpenAlbum }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { showPreview } = usePreview();
  const singleImages = character.singleImages || [];

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (singleImages.length === 0) return;
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % singleImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (singleImages.length === 0) return;
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + singleImages.length) % singleImages.length);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-0 sm:p-4" onClick={onClose}>
      <div className="relative bg-gray-900/80 border-gray-700 sm:border w-full h-full sm:w-auto sm:h-auto sm:rounded-2xl max-w-6xl max-h-full sm:max-h-[90vh] flex flex-col sm:flex-row overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/80 transition-colors"
          aria-label="Đóng"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Image Gallery */}
        <div className="w-full sm:w-2/3 flex-shrink-0 flex flex-col bg-black">
           <div className="relative flex-grow h-0 flex items-center justify-center p-2">
            {singleImages.length > 0 ? (
                <img 
                  src={singleImages[currentImageIndex].url} 
                  alt={character.name} 
                  className="max-w-full max-h-full object-contain cursor-zoom-in"
                  onClick={() => showPreview(singleImages[currentImageIndex].url)}
                />
            ) : (
                <div className="flex items-center justify-center h-full text-gray-500">Không có ảnh lẻ.</div>
            )}
           
           {singleImages.length > 1 && (
            <>
              <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/80 transition-opacity opacity-50 hover:opacity-100">&lt;</button>
              <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/80 transition-opacity opacity-50 hover:opacity-100">&gt;</button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">{`${currentImageIndex + 1} / ${singleImages.length}`}</div>
            </>
           )}
           </div>
           
           {/* Thumbnails */}
           {singleImages.length > 1 && (
             <div className="flex-shrink-0 p-2 bg-black/40">
               <div className="flex space-x-2 overflow-x-auto pb-1 justify-center">
                 {singleImages.map((img, index) => (
                   <button
                     key={img.id}
                     onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                     className={`w-16 h-20 rounded-md overflow-hidden flex-shrink-0 border-2 transition-all ${
                       index === currentImageIndex ? 'border-pink-500 scale-105' : 'border-transparent hover:border-gray-500 opacity-70 hover:opacity-100'
                     }`}
                   >
                     <img src={img.url} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                   </button>
                 ))}
               </div>
             </div>
           )}
        </div>

        {/* Character Info */}
        <div className="w-full sm:w-1/3 p-4 sm:p-6 overflow-y-auto bg-gray-900">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">{character.name}</h2>
          <p className="text-pink-400 font-semibold mb-4">{character.personality}, {character.occupation}</p>
          <div className="text-xs text-center p-2 rounded-md bg-gray-800/50 mb-4 cursor-pointer hover:bg-gray-700 transition-colors" onClick={() => onOpenAlbum(character)}>
              👉 Xem toàn bộ album ảnh ({singleImages.length} ảnh)
          </div>

          <div className="mb-6">
            <h3 className="font-bold text-gray-300 uppercase text-sm tracking-wider mb-2">Cốt Truyện Gốc</h3>
            <p className="text-gray-400 text-sm whitespace-pre-wrap leading-relaxed">{character.storyline || "Chưa có cốt truyện."}</p>
          </div>
          
          <h3 className="font-bold text-gray-300 uppercase text-sm tracking-wider mb-2">Hồ Sơ</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-6">
            <p><span className="text-gray-500">Tuổi:</span> {character.age}</p>
            <p><span className="text-gray-500">Sắc tộc:</span> {character.ethnicity}</p>
            <p><span className="text-gray-500">Dáng người:</span> {character.bodyType}</p>
            <p><span className="text-gray-500">Vòng một:</span> {character.breastSize}</p>
            <p><span className="text-gray-500">Kiểu tóc:</span> {character.hairStyle}</p>
            <p><span className="text-gray-500">Mối quan hệ:</span> {character.relationship}</p>
          </div>

          <div className="flex flex-col gap-3 mt-auto">
            <button onClick={() => onEnterStudio(character)} className="w-full bg-pink-500 text-white font-semibold py-3 rounded-lg hover:bg-pink-600 transition-colors">🎬 Vào Studio Sáng Tạo</button>
            <button onClick={() => onEnterCostumeStudio(character)} className="w-full bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700 transition-colors">👗 Thiết Kế Trang Phục</button>
            <button onClick={() => onOpenAlbum(character)} className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors">🖼️ Album Ảnh</button>
            <button onClick={() => onEdit(character)} className="w-full bg-gray-700 text-white font-semibold py-3 rounded-lg hover:bg-gray-600 transition-colors">Chỉnh Sửa Hồ Sơ</button>
          </div>
        </div>
      </div>
    </div>
  );
};


interface LibraryProps {
  characters: CharacterProfile[];
  onNavigate: (view: View) => void;
  onEdit: (character: CharacterProfile) => void;
  onDelete: (characterId: string) => void;
  onEnterStudio: (character: CharacterProfile) => void;
  onEnterCostumeStudio: (character: CharacterProfile) => void;
  onLogout: () => void;
  currentUser: string;
  onDeleteImage?: (characterId: string, imageId: string) => void; // Optional for now to avoid breaking App.tsx immediately
}

const Library: React.FC<LibraryProps> = ({ characters, onNavigate, onEdit, onDelete, onEnterStudio, onEnterCostumeStudio, onLogout, currentUser, onDeleteImage }) => {
  const [viewingChar, setViewingChar] = useState<CharacterProfile | null>(null);
  const [albumChar, setAlbumChar] = useState<CharacterProfile | null>(null);
  
  const startNewCharacter = () => {
    if (characters.length >= 10) {
        alert("Mỗi tài khoản có thể tạo tối đa 10 người mẫu. Vui lòng xóa bớt trước khi tạo mới.");
        return;
    }
    onNavigate('create');
  };

  if (characters.length === 0) {
    return (
      <div className="text-center min-h-[60vh] flex flex-col justify-center items-center">
        <h2 className="text-3xl font-bold mb-4 text-white">Thư viện của bạn trống</h2>
        <p className="text-gray-400 mb-8">Hãy bắt đầu hành trình sáng tạo bằng cách tạo ra nhân vật đầu tiên.</p>
        <button
          onClick={() => onNavigate('create')}
          className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3 px-10 rounded-lg transition-transform duration-200 hover:scale-105 shadow-lg"
        >
          Tạo Ngay
        </button>
         <button onClick={onLogout} className="absolute top-6 right-6 text-sm bg-gray-800/50 border border-gray-700 text-gray-300 font-semibold py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
            Đăng xuất
        </button>
      </div>
    );
  }

  return (
    <div>
      {viewingChar && <CharacterDetailModal character={viewingChar} onClose={() => setViewingChar(null)} onEdit={onEdit} onEnterStudio={onEnterStudio} onEnterCostumeStudio={onEnterCostumeStudio} onOpenAlbum={(char) => { setViewingChar(null); setAlbumChar(char); }} />}
      {albumChar && onDeleteImage && <CharacterAlbumModal character={albumChar} onClose={() => setAlbumChar(null)} onDeleteImage={onDeleteImage} />}
      
       <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Thư Viện <span className="text-pink-400">Muse</span>
            </h1>
            <p className="text-gray-400 mt-1">Xin chào, <span className="font-semibold text-gray-200">{currentUser}</span>! ({characters.length}/10 slots)</p>
        </div>
        <div className="flex items-center gap-4">
            <button
              onClick={startNewCharacter}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-2 px-6 rounded-lg transition-transform duration-200 hover:scale-105 shadow-lg"
            >
              + Tạo Mới
            </button>
            <button onClick={onLogout} className="text-sm bg-gray-800/50 border border-gray-700 text-gray-300 font-semibold py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                Đăng xuất
            </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {characters.map(char => {
          const latestImage = getLatestImageUrl(char);
          return (
            <div 
              key={char.id} 
              className="bg-gray-800/50 rounded-lg overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/10 hover:scale-[1.02] flex flex-col relative"
            >
              {char.isTemplate && (
                  <div className="absolute top-2 left-2 z-10 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
                      TEMPLATE
                  </div>
              )}
              <div className="aspect-[3/4] relative cursor-pointer" onClick={() => setViewingChar(char)}>
                <img src={latestImage || `https://placehold.co/300x400/2D2D3A/FFFFFF?text=${encodeURIComponent(char.name)}&font=poppins`} alt={char.name} className="w-full h-full object-cover group-hover:brightness-110 transition-all" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end">
                  <h3 className="text-xl font-bold text-white">{char.name}</h3>
                  <p className="text-sm text-gray-300">{char.personality}, {char.occupation}</p>
                </div>
                 <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true">
                    <div className="p-4 bg-black/40 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </div>
                 </div>
              </div>
              <div className="p-3 mt-auto bg-gray-900/40 flex items-center gap-2">
                   <button onClick={() => onEnterStudio(char)} className="flex-1 bg-pink-500 text-white font-semibold py-2 rounded-md hover:bg-pink-600 transition-colors text-xs flex items-center justify-center gap-1" title="Studio">
                        <span>🎬</span>
                   </button>
                   <button onClick={() => onEnterCostumeStudio(char)} className="flex-1 bg-purple-600 text-white font-semibold py-2 rounded-md hover:bg-purple-700 transition-colors text-xs flex items-center justify-center gap-1" title="Tủ Đồ">
                        <span>👗</span>
                   </button>
                   <button onClick={() => setAlbumChar(char)} className="flex-1 bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition-colors text-xs flex items-center justify-center gap-1" title="Album">
                        <span>🖼️</span>
                   </button>
                   <button onClick={() => {if(confirm(`Bạn có chắc muốn xóa ${char.name}?`)) onDelete(char.id)}} className="flex-shrink-0 bg-red-800/50 text-white p-2 rounded-md hover:bg-red-700 transition-colors" title="Xóa">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                   </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default Library;