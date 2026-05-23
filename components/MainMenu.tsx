import React from 'react';

interface MainMenuProps {
  onNavigate: () => void;
  hasCharacters: boolean;
  onLogout: () => void;
  onViewLibrary: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onNavigate, hasCharacters, onLogout, onViewLibrary }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 relative">
       <div className="absolute top-0 right-0 p-4">
        <button onClick={onLogout} className="text-sm bg-gray-800/80 backdrop-blur-md border border-gray-700 text-gray-300 font-semibold py-2 px-4 rounded-full hover:bg-gray-700 transition-colors">
            Đăng xuất
        </button>
      </div>
      
      <div className="mb-8 relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full blur opacity-30 animate-pulse"></div>
        <h1 className="relative text-5xl md:text-8xl font-black tracking-tighter text-white mb-2">
          V-Life <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Studio</span>
        </h1>
      </div>

      <p className="max-w-2xl text-lg md:text-xl text-gray-400 mb-12 leading-relaxed">
        Sáng tạo <span className="text-white font-semibold">Digital Twin</span> của chính bạn. 
        <br className="hidden md:block" />
        Thử nghiệm phong cách, tạo nội dung số và sống cuộc đời ảo mà bạn mơ ước.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md sm:max-w-none justify-center">
        <button
          onClick={onNavigate}
          className="group relative bg-white text-black font-bold py-4 px-8 rounded-full transition-all duration-300 hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2"
        >
          <span className="text-xl">✨</span>
          <span className="text-lg">Tạo Nhân Vật Mới</span>
          <div className="absolute inset-0 rounded-full border-2 border-white opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"></div>
        </button>
        
        {hasCharacters && (
          <button
            onClick={onViewLibrary}
            className="group bg-gray-800/80 backdrop-blur-sm text-white font-bold py-4 px-8 rounded-full transition-all duration-300 hover:bg-gray-700 hover:scale-105 border border-gray-700 flex items-center justify-center gap-2"
          >
            <span className="text-xl">📂</span>
            <span className="text-lg">Quản Lý Hồ Sơ</span>
          </button>
        )}
      </div>

      {/* Feature Highlights */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-500 max-w-4xl">
          <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-pink-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
              </div>
              <p>Clone hình ảnh bản thân</p>
          </div>
          <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-purple-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v3.25a1 1 0 11-2 0V13.003a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
              </div>
              <p>Thử trang phục & kiểu tóc</p>
          </div>
          <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-blue-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" /></svg>
              </div>
              <p>Sáng tạo nội dung video</p>
          </div>
      </div>
    </div>
  );
};

export default MainMenu;
