import React from 'react';

interface AgeGateProps {
  onConfirm: () => void;
}

const AgeGate: React.FC<AgeGateProps> = ({ onConfirm }) => {
  const maleImageUrl = "https://storage.googleapis.com/maker-suite-project-files-prod/ai-apps/my-muse-ai/placeholders/gender_male.webp";
  const femaleImageUrl = "https://storage.googleapis.com/maker-suite-project-files-prod/ai-apps/my-muse-ai/placeholders/gender_female.webp";

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden p-4 text-center">
      {/* Background Images */}
      <div className="absolute inset-0 w-full h-full z-0">
         <img
          src={femaleImageUrl}
          alt="Female character"
          className="absolute left-0 top-0 h-full w-3/4 object-cover object-left opacity-30 blur-sm"
        />
        <img
          src={maleImageUrl}
          alt="Male character"
          className="absolute right-0 top-0 h-full w-3/4 object-cover object-right opacity-30 blur-sm"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/80 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white">
          My <span className="text-pink-400">Muse</span> AI
        </h1>
        <p className="mt-6 text-xl md:text-2xl font-semibold text-gray-200">
          Bạn đã đủ 18 tuổi chưa?
        </p>
        <p className="mt-2 max-w-lg text-gray-400">
          Ứng dụng này chứa nội dung dành cho người trưởng thành và yêu cầu người dùng phải từ 18 tuổi trở lên.
        </p>
        <div className="mt-8 flex gap-4">
          <button
            onClick={onConfirm}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3 px-12 rounded-lg transition-transform duration-200 hover:scale-105 shadow-lg text-lg"
          >
            Có, tôi đã đủ tuổi
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgeGate;
