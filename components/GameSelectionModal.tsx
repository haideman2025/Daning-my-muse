import React from 'react';

interface GameSelectionModalProps {
  onClose: () => void;
  onSelectGame: (gameId: string) => void;
}

// Icons for games
const IconCards = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-400" viewBox="0 0 20 20" fill="currentColor"><path d="M11.91 2.634a1 1 0 01.373.815V4H15a1 1 0 011 1v4a1 1 0 01-1 1h-1v1a1 1 0 01-1 1H9a1 1 0 01-1-1v-1H7a1 1 0 01-1-1V5a1 1 0 011-1h2.09a1 1 0 01.894-.553l1-2A1 1 0 0111.91 2.634zM10 14a1 1 0 011 1v1a1 1 0 01-1 1H5a1 1 0 01-1-1v-4a1 1 0 011-1h1V9a1 1 0 011-1h4a1 1 0 011 1v1h-1a1 1 0 01-1 1h-2z" /></svg>;
const IconBubbles = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-300" viewBox="0 0 20 20" fill="currentColor"><path d="M10 6a4 4 0 100 8 4 4 0 000-8zM4.5 9.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM15.5 5.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" /><path d="M14 13.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" /></svg>;
const IconSpinner = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>;
const IconQuestion = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-1 1v1a1 1 0 102 0V8a1 1 0 00-1-1zm1 4a1 1 0 10-2 0v1a1 1 0 102 0v-1z" clipRule="evenodd" /></svg>;
const IconChat = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" /></svg>;


const games = [
    {
        id: 'strip_poker',
        title: 'Đánh Bài Lột Đồ',
        description: 'Một ván bài cổ điển, nơi mà "tiền cược" chính là quần áo của chúng ta. Ai sẽ là người "phá sản" trước?',
        icon: <IconCards />
    },
    {
        id: 'beer_catch',
        title: 'Thử Thách Bọt Oniiz',
        description: 'Trò chơi phản xạ vui nhộn. Em sẽ ném những chai bọt, anh hứng. Nếu trượt, anh sẽ phải... cởi một món đồ. Dám không?',
        icon: <IconBubbles />
    },
    {
        id: 'spicy_wheel',
        title: 'Vòng Quay Táo Bạo',
        description: 'Cùng quay bánh xe định mệnh. Mỗi ô là một hành động lãng mạn, một câu hỏi riêng tư, hoặc một thử thách... nóng bỏng.',
        icon: <IconSpinner />
    },
    {
        id: 'truth_or_dare',
        title: 'Sự Thật hay Thử Thách?',
        description: 'Khám phá những bí mật sâu kín nhất của nhau hoặc thực hiện những yêu cầu táo bạo. Phiên bản này chỉ dành cho hai ta.',
        icon: <IconQuestion />
    },
    {
        id: '20_questions',
        title: '20 Câu Hỏi: Đoán Ý',
        description: 'Em đang nghĩ về một "thứ" gì đó... Anh có 20 câu hỏi để đoán ra. Đoán đúng có thưởng, đoán sai... sẽ bị phạt.',
        icon: <IconChat />
    }
];

const GameSelectionModal: React.FC<GameSelectionModalProps> = ({ onClose, onSelectGame }) => {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in" onClick={onClose}>
            <style>{`.animate-fade-in { animation: fade-in 0.2s ease-out; } @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }`}</style>
            <div className="w-full max-w-2xl h-auto max-h-[80vh] bg-gray-900/80 border border-gray-700 rounded-lg flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex-shrink-0 p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Chọn một trò chơi</h2>
                    <button onClick={onClose} className="bg-gray-800/80 p-1.5 rounded-full hover:bg-black/80">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="flex-grow p-6 overflow-y-auto space-y-4">
                    {games.map(game => (
                        <button
                            key={game.id}
                            onClick={() => onSelectGame(game.id)}
                            className="w-full flex items-center text-left bg-gray-800/50 p-4 rounded-lg border border-gray-700 hover:bg-gray-700/70 hover:border-pink-500 transition-all duration-200"
                        >
                            <div className="flex-shrink-0 mr-4">
                                {game.icon}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-white">{game.title}</h3>
                                <p className="text-sm text-gray-400 mt-1">{game.description}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GameSelectionModal;