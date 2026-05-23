
import React, { useState } from 'react';
import { CharacterProfile } from '../types';
import GameSelectionModal from './GameSelectionModal';
import BeerCatchGame from './BeerCatchGame';
import CharacterSelectionModal from './CharacterSelectionModal';
import StoryboardCreator from './StoryboardCreator';
import KocStudio from './KocStudio';
import ARViewer from './ARViewer';

interface InteractiveSpaceProps {
  initialCharacter: CharacterProfile;
  allCharacters: CharacterProfile[];
  onUpdateCharacter: (updatedCharacter: CharacterProfile) => void;
  onBack: () => void;
}

const getLatestImageUrl = (character: CharacterProfile): string | undefined => {
    const singleImages = character.singleImages || [];
    if (singleImages.length > 0) {
        return singleImages.sort((a, b) => b.createdAt - a.createdAt)[0].url;
    }
    return undefined;
};

const IconGameController = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zM6 10a.5.5 0 01.5-.5h2v-2a.5.5 0 011 0v2h2a.5.5 0 010 1h-2v2a.5.5 0 01-1 0v-2h-2A.5.5 0 016 10zM13.5 9a.5.5 0 11-1 0 .5.5 0 011 0zM11.5 11a.5.5 0 11-1 0 .5.5 0 011 0zM9.5 11a.5.5 0 11-1 0 .5.5 0 011 0zM11.5 13a.5.5 0 11-1 0 .5.5 0 011 0z"/></svg>;
const IconFilm = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM4 4a1 1 0 00-1 1v1h14V5a1 1 0 00-1-1H4zM3 14a1 1 0 001 1h12a1 1 0 001-1v-1H3v1z" /><path d="M5 8h2v2H5V8zM8 8h2v2H8V8zM11 8h2v2h-2V8z" /></svg>;
const IconStar = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;
const IconCamera = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;


const InteractiveSpace: React.FC<InteractiveSpaceProps> = ({ initialCharacter, allCharacters, onUpdateCharacter, onBack }) => {
    const [isGameSelectionOpen, setGameSelectionOpen] = useState(false);
    const [isCharacterSelectionOpen, setCharacterSelectionOpen] = useState(false);
    const [activeGame, setActiveGame] = useState<string | null>(null);
    const [gameCharacter, setGameCharacter] = useState<CharacterProfile>(initialCharacter);
    const [activeView, setActiveView] = useState<'selection' | 'game' | 'storyboard' | 'koc' | 'ar'>('selection');

    const handleSelectGame = (gameId: string) => {
        setActiveGame(gameId);
        setActiveView('game');
        setGameSelectionOpen(false);
    };

    const handleExitGame = () => {
        setActiveGame(null);
        setActiveView('selection');
    };
    
    const handleSelectCharacter = (character: CharacterProfile) => {
        setGameCharacter(character);
        setCharacterSelectionOpen(false);
    }
    
    const renderContent = () => {
        if (activeView === 'ar') {
            return <ARViewer character={gameCharacter} onBack={() => setActiveView('selection')} onUpdate={onUpdateCharacter} />;
        }

        if (activeView === 'storyboard') {
            return <StoryboardCreator character={gameCharacter} onUpdate={onUpdateCharacter} onBack={() => setActiveView('selection')} />;
        }

        if (activeView === 'koc') {
            return <KocStudio character={gameCharacter} onUpdate={onUpdateCharacter} onBack={() => setActiveView('selection')} />;
        }

        if (activeView === 'game') {
            switch (activeGame) {
                case 'beer_catch':
                    return <BeerCatchGame character={gameCharacter} onUpdate={onUpdateCharacter} onExit={handleExitGame} />;
                default:
                    setActiveView('selection');
                    return null;
            }
        }

        return (
            <div className="text-center flex flex-col items-center">
                <div className="relative w-48 h-64 rounded-lg overflow-hidden mb-4 border-2 border-gray-600 shadow-lg">
                     <img src={getLatestImageUrl(gameCharacter) || `https://placehold.co/300x400/2D2D3A/FFFFFF?text=${encodeURIComponent(gameCharacter.name)}&font=poppins`} alt={gameCharacter.name} className="w-full h-full object-cover"/>
                </div>
                <h2 className="text-2xl font-bold mb-1">Cùng {gameCharacter.name} Sáng Tạo</h2>
                <button onClick={() => setCharacterSelectionOpen(true)} className="text-sm text-pink-400 hover:underline mb-6">(Đổi Muse)</button>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl px-4">
                    <button
                        onClick={() => setActiveView('ar')}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-4 px-6 rounded-xl transition-transform hover:scale-105 flex items-center justify-center shadow-lg shadow-blue-500/20"
                    >
                        <IconCamera />
                        Hẹn Hò AR (Thế Giới Thực)
                    </button>
                    <button
                        onClick={() => setGameSelectionOpen(true)}
                        className="bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold py-4 px-6 rounded-xl transition-transform hover:scale-105 flex items-center justify-center shadow-lg shadow-green-500/20"
                    >
                        <IconGameController />
                        Mini Game Giải Trí
                    </button>
                    <button
                        onClick={() => setActiveView('storyboard')}
                        className="bg-gray-800 text-white font-bold py-4 px-6 rounded-xl transition-transform hover:scale-105 flex items-center justify-center border border-gray-700"
                    >
                        <IconFilm />
                        Xây Dựng Storyboard
                    </button>
                    <button
                        onClick={() => setActiveView('koc')}
                        className="bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-4 px-6 rounded-xl transition-transform hover:scale-105 flex items-center justify-center shadow-lg shadow-pink-500/30 border border-pink-400/50"
                    >
                        <IconStar />
                        KOC AI (Quảng Cáo)
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full">
            {isGameSelectionOpen && <GameSelectionModal onClose={() => setGameSelectionOpen(false)} onSelectGame={handleSelectGame} />}
            {isCharacterSelectionOpen && <CharacterSelectionModal characters={allCharacters} onClose={() => setCharacterSelectionOpen(false)} onSelect={handleSelectCharacter} currentCharacterId={gameCharacter.id} />}

            <div className="flex justify-between items-center mb-6 px-4">
                <button onClick={onBack} className="text-pink-400 hover:text-pink-300 font-semibold">&larr; Quay lại Studio</button>
                <h1 className="text-2xl font-extrabold text-white hidden md:block">Làm Gì Đó Cùng Nhau</h1>
                <div className="w-10"></div>
            </div>
            
            <div className="bg-black/20 p-4 sm:p-8 rounded-2xl min-h-[70vh] flex items-center justify-center">
               {renderContent()}
            </div>
        </div>
    );
};

export default InteractiveSpace;
