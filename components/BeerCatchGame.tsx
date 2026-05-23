
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CharacterProfile, GalleryImage, CategorizedClothing } from '../types';
import {
  generateInGameChatMessage,
  generateLevelCompleteVoice,
  generateOutfitIdeas,
  generateOutfitImage,
  identifyClothingItems,
  generateImageWithItemRemoved,
  generateGameBackground
} from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

// --- ASSETS ---
const ASSETS = {
    BOTTLE: "https://i.imgur.com/7g5nQ1w.png", // White/Blue foam bottle
    GOLD_BOTTLE: "https://i.imgur.com/tYV3z0N.png", // Gold variant (using placeholder for now, distinct via CSS)
    BOMB: "https://cdn-icons-png.flaticon.com/512/112/112683.png", // Bomb icon
    CATCHER: "https://i.imgur.com/K72E7tK.png", // Oniiz bottle/basket
    BG_DEFAULT: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop" // Cyberpunk/Neon default
};

// --- TYPES ---
type ItemType = 'foam' | 'gold' | 'bomb';

interface FallingItem {
  id: number;
  x: number;
  y: number;
  speed: number;
  type: ItemType;
  rotation: number;
}

interface FloatingText {
    id: number;
    x: number;
    y: number;
    text: string;
    color: string;
    scale: number;
}

interface ChatMessage {
    id: number;
    text: string;
}

interface OutfitChoice {
    name: string;
    prompt: string;
    imageUrl: string;
    isLoading: boolean;
}

interface BeerCatchGameProps {
  character: CharacterProfile;
  onUpdate: (updatedCharacter: CharacterProfile) => void;
  onExit: () => void;
}

type GameState = 'difficultySelection' | 'outfitGeneration' | 'outfitSelection' | 'generating' | 'startScreen' | 'playing' | 'levelComplete' | 'gameOver' | 'rewardSelection';
type Difficulty = 'easy' | 'medium' | 'hard';

// --- CONSTANTS ---
const BOTTLES_PER_LEVEL = 15; // Increased for faster pace
const STARTING_LIVES = 3;
const MAX_FEVER = 100;

const DIFFICULTY_SETTINGS = {
    easy: { speedMultiplier: 0.8, spawnRate: 1200, bombChance: 0.1 },
    medium: { speedMultiplier: 1.2, spawnRate: 900, bombChance: 0.2 },
    hard: { speedMultiplier: 1.6, spawnRate: 700, bombChance: 0.3 },
};

// --- ICONS & SVG ---
const IconHeart: React.FC<{ filled: boolean }> = ({ filled }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${filled ? 'text-red-500 fill-current' : 'text-gray-600'}`} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
    </svg>
);
const IconLightning = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>;

// --- AUDIO HELPERS ---
const decode = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

interface AvailableRewards {
    items: string[];
    category: keyof CategorizedClothing | null;
}

const BeerCatchGame: React.FC<BeerCatchGameProps> = ({ character, onUpdate, onExit }) => {
  // Game State
  const [gameState, setGameState] = useState<GameState>('difficultySelection');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [level, setLevel] = useState(1);
  const [maxLevel, setMaxLevel] = useState(10);
  
  // Stats
  const [score, setScore] = useState(0); 
  const [totalScore, setTotalScore] = useState(0);
  const [lives, setLives] = useState(STARTING_LIVES);
  const [combo, setCombo] = useState(0);
  const [feverValue, setFeverValue] = useState(0);
  const [isFeverMode, setIsFeverMode] = useState(false);
  
  // Entities
  const [items, setItems] = useState<FallingItem[]>([]);
  const [catcherX, setCatcherX] = useState(0);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  
  // Visuals & Content
  const [characterImage, setCharacterImage] = useState('');
  const [dialogue, setDialogue] = useState('Chào mừng đến với thử thách bọt Oniiz!');
  const [categorizedClothing, setCategorizedClothing] = useState<CategorizedClothing | null>(null);
  const [gameBackground, setGameBackground] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [outfitChoices, setOutfitChoices] = useState<OutfitChoice[]>([]);
  const [shakeScreen, setShakeScreen] = useState(false);
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const gameLoopRef = useRef<number | null>(null);
  const lastSpawnTimeRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // Constants derived from state
  const isGameActive = gameState === 'playing';
  const catcherWidth = 100;

  // --- AUDIO CONTROL ---
  const playMusic = useCallback(() => {
    if (isMuted) return;
    if (!musicAudioRef.current) {
        musicAudioRef.current = new Audio();
        musicAudioRef.current.loop = true;
        musicAudioRef.current.volume = 0.4;
    }
    const audio = musicAudioRef.current;
    // Different tracks for Normal vs Fever
    const normalTrack = 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_7242f6835e.mp3'; // Energetic Pop
    const feverTrack = 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3'; // Fast EDM

    const targetTrack = isFeverMode ? feverTrack : normalTrack;

    if (audio.src !== targetTrack) {
        const currentTime = audio.currentTime;
        audio.src = targetTrack;
        audio.currentTime = currentTime % 10; // Try to sync loop vaguely
        audio.play().catch(e => console.warn("Music play failed.", e));
    } else if (audio.paused) {
        audio.play().catch(e => console.warn("Music play failed.", e));
    }
  }, [isMuted, isFeverMode]);

  const playSoundEffect = useCallback((type: 'catch' | 'bomb' | 'fever' | 'miss') => {
      if (!audioContextRef.current || isMuted) return;
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      
      if (type === 'catch') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
      } else if (type === 'bomb') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(100, now);
          osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.3);
          osc.start(now);
          osc.stop(now + 0.3);
      } else if (type === 'miss') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(300, now);
          osc.frequency.linearRampToValueAtTime(100, now + 0.2);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.2);
          osc.start(now);
          osc.stop(now + 0.2);
      }
  }, [isMuted]);

  const addFloatingText = (x: number, y: number, text: string, color: string, scale: number = 1) => {
      setFloatingTexts(prev => [...prev, { id: Date.now() + Math.random(), x, y, text, color, scale }]);
      setTimeout(() => {
          setFloatingTexts(prev => prev.slice(1));
      }, 800);
  };

  const addMuseMessage = useCallback(async (event: 'welcome' | 'good_catch' | 'life_lost' | 'level_up' | 'game_over_win' | 'game_over_lose') => {
      try {
          const messageText = await generateInGameChatMessage(character, event);
          setChatMessages(prev => [{ id: Date.now(), text: messageText }, ...prev].slice(0, 3));
      } catch (e) {
          console.error("Failed chat", e);
      }
  }, [character]);

    // --- GAME LOGIC ---
    const spawnItem = () => {
        if (!gameAreaRef.current) return;
        const settings = DIFFICULTY_SETTINGS[difficulty];
        const width = gameAreaRef.current.clientWidth;
        
        // Determine type
        const rand = Math.random();
        let type: ItemType = 'foam';
        if (rand < settings.bombChance) type = 'bomb';
        else if (rand < settings.bombChance + 0.05) type = 'gold'; // 5% chance for gold

        // Spawn logic
        const x = Math.random() * (width - 40);
        setItems(prev => [...prev, {
            id: Date.now() + Math.random(),
            x,
            y: -50,
            speed: (Math.random() * 2 + 3) * settings.speedMultiplier * (isFeverMode ? 1.5 : 1),
            type,
            rotation: Math.random() * 360
        }]);
    };

    const handleCatch = (item: FallingItem) => {
        if (item.type === 'bomb') {
            playSoundEffect('bomb');
            setLives(l => l - 1);
            setCombo(0);
            setShakeScreen(true);
            setTimeout(() => setShakeScreen(false), 500);
            addFloatingText(item.x, gameAreaRef.current!.clientHeight - 100, "BÙM!", "#EF4444", 1.5);
            setFeverValue(v => Math.max(0, v - 30));
            addMuseMessage('life_lost');
        } else {
            playSoundEffect('catch');
            const basePoints = item.type === 'gold' ? 5 : 1;
            const multiplier = isFeverMode ? 2 : 1 + Math.floor(combo / 5) * 0.5;
            const points = Math.floor(basePoints * multiplier);
            
            setScore(s => s + 1); // Progress logic uses count
            setTotalScore(s => s + points * 100);
            setCombo(c => c + 1);
            
            // Fever Logic
            if (!isFeverMode) {
                setFeverValue(v => {
                    const newVal = v + (item.type === 'gold' ? 20 : 5);
                    if (newVal >= MAX_FEVER) {
                        setIsFeverMode(true);
                        addFloatingText(gameAreaRef.current!.clientWidth / 2 - 50, gameAreaRef.current!.clientHeight / 2, "FEVER MODE!", "#F0ABFC", 2);
                        return MAX_FEVER;
                    }
                    return newVal;
                });
            }

            // Visuals
            const color = item.type === 'gold' ? '#FACC15' : '#67E8F9';
            addFloatingText(item.x, gameAreaRef.current!.clientHeight - 100, `+${points * 100}`, color);
            if (combo > 0 && combo % 5 === 0) {
                addFloatingText(catcherX, gameAreaRef.current!.clientHeight - 150, `${combo} COMBO!`, "#D8B4FE", 1.2);
                addMuseMessage('good_catch');
            }
        }
    };

    const gameLoop = useCallback(() => {
        if (!gameAreaRef.current) return;
        
        // Fever Drain
        if (isFeverMode) {
            setFeverValue(v => {
                const newVal = v - 0.3; // Drain speed
                if (newVal <= 0) {
                    setIsFeverMode(false);
                    return 0;
                }
                return newVal;
            });
        }

        setItems(prevItems => {
            const nextItems: FallingItem[] = [];
            const gameHeight = gameAreaRef.current!.clientHeight;
            
            prevItems.forEach(item => {
                item.y += item.speed;
                item.rotation += 2;

                // Check collision
                const hitCatcher = item.y > gameHeight - 80 && item.y < gameHeight - 10 &&
                                   item.x > catcherX - 20 && item.x < catcherX + catcherWidth;

                if (hitCatcher) {
                    handleCatch(item);
                } else if (item.y > gameHeight) {
                    // Missed
                    if (item.type !== 'bomb') {
                        setCombo(0); // Reset combo on miss normal item
                        playSoundEffect('miss');
                    }
                } else {
                    nextItems.push(item);
                }
            });
            return nextItems;
        });

        // Spawn Control
        const now = Date.now();
        const settings = DIFFICULTY_SETTINGS[difficulty];
        const rate = isFeverMode ? settings.spawnRate / 2 : settings.spawnRate;
        
        if (now - lastSpawnTimeRef.current > rate) {
            spawnItem();
            lastSpawnTimeRef.current = now;
        }

        gameLoopRef.current = requestAnimationFrame(gameLoop);
    }, [catcherX, difficulty, isFeverMode, playSoundEffect]);


    // --- REACT EFFECTS ---
    useEffect(() => {
        if (isGameActive) {
            playMusic();
            gameLoopRef.current = requestAnimationFrame(gameLoop);
        } else {
            if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
            musicAudioRef.current?.pause();
        }
        return () => {
            if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        };
    }, [isGameActive, gameLoop, playMusic]);


    // Input handling
    useEffect(() => {
        const handleMove = (clientX: number) => {
            if (!gameAreaRef.current) return;
            const rect = gameAreaRef.current.getBoundingClientRect();
            let x = clientX - rect.left - catcherWidth / 2;
            x = Math.max(0, Math.min(x, rect.width - catcherWidth));
            setCatcherX(x);
        };

        const mouseMove = (e: MouseEvent) => handleMove(e.clientX);
        const touchMove = (e: TouchEvent) => {
            e.preventDefault(); // Prevent scroll
            if (e.touches[0]) handleMove(e.touches[0].clientX);
        };

        if (isGameActive) {
            window.addEventListener('mousemove', mouseMove);
            window.addEventListener('touchmove', touchMove, { passive: false });
        }
        return () => {
            window.removeEventListener('mousemove', mouseMove);
            window.removeEventListener('touchmove', touchMove);
        };
    }, [isGameActive]);

    // Win/Loss Check
    useEffect(() => {
        if (lives <= 0 && gameState === 'playing') {
            setGameState('gameOver');
            setDialogue("Tiếc quá! Anh có muốn thử lại không?");
            addMuseMessage('game_over_lose');
        }
        if (score >= BOTTLES_PER_LEVEL && gameState === 'playing') {
            setGameState('generating'); // Pause
            setDialogue("Tuyệt vời! Anh đã qua màn!");
            setTimeout(() => setGameState('rewardSelection'), 1500);
        }
    }, [lives, score, gameState]);


    // --- HELPERS ---
    const resetGame = () => {
        setLives(STARTING_LIVES);
        setLevel(1);
        setScore(0);
        setTotalScore(0);
        setItems([]);
        setCombo(0);
        setFeverValue(0);
        setIsFeverMode(false);
        setChatMessages([]);
    };

    const handleDifficultySelect = (d: Difficulty) => {
        // Init audio context
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        setDifficulty(d);
        resetGame();
        setGameState('outfitGeneration');
        setDialogue('Đợi em chọn đồ xinh nhé...');
        // Fake generating process calling real API
        prepareOutfitChoices();
    };
    
    const prepareOutfitChoices = async () => {
        try {
            const ideas = await generateOutfitIdeas(character);
            setOutfitChoices(ideas.map(idea => ({ ...idea, imageUrl: '', isLoading: true })));
            
            // Generate sequentially to avoid rate limits
            for (const idea of ideas) {
                 try {
                    const b64 = await generateOutfitImage(character, idea.prompt);
                    setOutfitChoices(prev => prev.map(p => p.prompt === idea.prompt ? { ...p, imageUrl: `data:image/jpeg;base64,${b64}`, isLoading: false } : p));
                 } catch (e) {
                     console.warn("Skipping failed outfit");
                 }
            }
            setGameState('outfitSelection');
            setDialogue('Anh thích em mặc bộ nào?');
        } catch (e) {
            console.error(e);
            setGameState('difficultySelection'); // Fallback
        }
    };

    const handleOutfitSelect = async (choice: OutfitChoice) => {
        setGameState('generating');
        setDialogue('Chờ em thay đồ chút nhé...');
        try {
            const b64 = choice.imageUrl.split(',')[1];
            const clothing = await identifyClothingItems(b64);
            
            // Flatten clothing to count
            const total = Object.values(clothing).flat().length;
            if (total === 0) throw new Error("No clothing found");

            setCharacterImage(choice.imageUrl);
            setCategorizedClothing(clothing);
            setMaxLevel(total);
            
            const newImage: GalleryImage = { id: uuidv4(), url: choice.imageUrl, createdAt: Date.now(), prompt: choice.name };
            onUpdate({ ...character, singleImages: [newImage, ...(character.singleImages || [])] });

            setGameState('startScreen');
            setDialogue('Sẵn sàng chưa nào?');
            addMuseMessage('welcome');
        } catch (e) {
            setGameState('outfitSelection');
            setDialogue('Bộ này khó mặc quá, chọn bộ khác đi anh.');
        }
    };
    
    const handleClothingChoice = async (item: string, category: keyof CategorizedClothing) => {
        setGameState('generating');
        setDialogue(`Được thôi, em cởi ${item} đây...`);
        try {
             const currentB64 = characterImage.split(',')[1];
             const [newImgB64, newBgB64] = await Promise.all([
                 generateImageWithItemRemoved(character, currentB64, item),
                 generateGameBackground(character, level + 1)
             ]);
             
             setCharacterImage(`data:image/jpeg;base64,${newImgB64}`);
             setGameBackground(`data:image/jpeg;base64,${newBgB64}`);
             
             // Update clothing list
             setCategorizedClothing(prev => {
                 if(!prev) return null;
                 const next = {...prev};
                 next[category] = next[category].filter(i => i !== item);
                 return next;
             });

             // Update Game Stats
             const newLevel = level + 1;
             setLevel(newLevel);
             setScore(0);
             setFeverValue(0);
             setIsFeverMode(false);
             
             const remaining = Object.values(categorizedClothing || {}).flat().length - 1;
             if (remaining <= 0) {
                 setGameState('gameOver');
                 setDialogue("ANH THẮNG RỒI! Em đầu hàng!");
                 addMuseMessage('game_over_win');
             } else {
                 setGameState('levelComplete');
                 setDialogue(`Vòng ${newLevel} bắt đầu!`);
                 addMuseMessage('level_up');
             }

        } catch (e) {
            setGameState('rewardSelection');
            setDialogue("Lỗi kỹ thuật rồi, chọn món khác đi anh.");
        }
    };

    const availableRewards = useMemo((): AvailableRewards => {
        if (!categorizedClothing) return { items: [], category: null };
        if (categorizedClothing.accessories.length > 0) return { items: categorizedClothing.accessories, category: 'accessories' };
        if (categorizedClothing.outerwear.length > 0) return { items: categorizedClothing.outerwear, category: 'outerwear' };
        if (categorizedClothing.main_clothing.length > 0) return { items: categorizedClothing.main_clothing, category: 'main_clothing' };
        return { items: [], category: null };
    }, [categorizedClothing]);


    // --- RENDERERS ---
    const renderOverlay = (title: string, content: React.ReactNode) => (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-6 text-center animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500 mb-4 drop-shadow-lg">{title}</h2>
            {content}
        </div>
    );

    return (
        <div className={`relative w-full h-[90vh] bg-gray-900 border-4 border-pink-500/30 rounded-xl overflow-hidden flex flex-col lg:flex-row shadow-2xl ${shakeScreen ? 'animate-shake' : ''}`}>
            <style>{`
                @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 10px #F0ABFC; } 50% { box-shadow: 0 0 25px #D8B4FE; } }
                @keyframes shake { 0% { transform: translate(1px, 1px) rotate(0deg); } 10% { transform: translate(-1px, -2px) rotate(-1deg); } 20% { transform: translate(-3px, 0px) rotate(1deg); } 30% { transform: translate(3px, 2px) rotate(0deg); } 40% { transform: translate(1px, -1px) rotate(1deg); } 50% { transform: translate(-1px, 2px) rotate(-1deg); } 60% { transform: translate(-3px, 1px) rotate(0deg); } 70% { transform: translate(3px, 1px) rotate(-1deg); } 80% { transform: translate(-1px, -1px) rotate(1deg); } 90% { transform: translate(1px, 2px) rotate(0deg); } 100% { transform: translate(1px, -2px) rotate(-1deg); } }
                .animate-shake { animation: shake 0.5s; }
                .floating-text { position: absolute; font-weight: bold; text-shadow: 2px 2px 0 #000; animation: float-up 0.8s forwards; pointer-events: none; z-index: 20; }
                @keyframes float-up { from { transform: translateY(0) scale(1); opacity: 1; } to { transform: translateY(-50px) scale(1.5); opacity: 0; } }
            `}</style>
            
            {/* --- LEFT: GAME AREA --- */}
            <div 
                ref={gameAreaRef}
                className={`relative w-full lg:w-2/3 h-[65%] lg:h-full bg-cover bg-center overflow-hidden transition-all duration-500 ${isFeverMode ? 'brightness-125 saturate-150' : ''}`}
                style={{ backgroundImage: gameBackground ? `url(${gameBackground})` : `url(${ASSETS.BG_DEFAULT})` }}
            >
                {/* Fever Overlay */}
                {isFeverMode && <div className="absolute inset-0 bg-gradient-to-b from-pink-500/20 to-purple-500/20 pointer-events-none animate-pulse"></div>}
                
                {/* Header HUD */}
                <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-20 bg-gradient-to-b from-black/80 to-transparent">
                     <div className="flex flex-col">
                         <div className="text-3xl font-black text-yellow-400 italic tracking-tighter drop-shadow-md">{totalScore.toLocaleString()}</div>
                         {combo > 1 && <div className="text-xl font-bold text-purple-400 animate-bounce">{combo} COMBO!</div>}
                     </div>
                     
                     <div className="flex flex-col items-end gap-2">
                         <div className="flex gap-1">
                             {Array.from({length: STARTING_LIVES}).map((_, i) => (
                                 <IconHeart key={i} filled={i < lives} />
                             ))}
                         </div>
                         <div className="w-32 h-4 bg-gray-800 rounded-full border border-gray-600 overflow-hidden relative">
                             <div 
                                className={`h-full transition-all duration-200 ${isFeverMode ? 'bg-gradient-to-r from-yellow-300 to-red-500 animate-pulse' : 'bg-gradient-to-r from-blue-400 to-cyan-300'}`}
                                style={{ width: `${(feverValue / MAX_FEVER) * 100}%` }}
                             ></div>
                             <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-md">
                                 {isFeverMode ? 'FEVER!!' : 'FEVER METER'}
                             </div>
                         </div>
                     </div>
                </div>

                {/* Game Elements */}
                {items.map(item => (
                    <div 
                        key={item.id}
                        className="absolute w-10 h-10 flex items-center justify-center drop-shadow-lg"
                        style={{ top: item.y, left: item.x, transform: `rotate(${item.rotation}deg)` }}
                    >
                        <img 
                            src={item.type === 'bomb' ? ASSETS.BOMB : item.type === 'gold' ? ASSETS.GOLD_BOTTLE : ASSETS.BOTTLE} 
                            alt={item.type} 
                            className={`w-full h-full object-contain ${item.type === 'gold' ? 'drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]' : ''}`}
                        />
                    </div>
                ))}

                {isGameActive && (
                     <div 
                        className="absolute bottom-4 w-[100px] h-20 transition-transform duration-75 z-10"
                        style={{ left: catcherX }}
                     >
                         <img src={ASSETS.CATCHER} className="w-full h-full object-contain drop-shadow-2xl" alt="Catcher"/>
                         {/* Catcher Glow */}
                         <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-white/30 blur-lg rounded-full"></div>
                     </div>
                )}

                {floatingTexts.map(ft => (
                    <div key={ft.id} className="floating-text" style={{ top: ft.y, left: ft.x, color: ft.color, fontSize: `${1.5 * ft.scale}rem` }}>
                        {ft.text}
                    </div>
                ))}

                {/* Audio Toggle */}
                <button onClick={() => setIsMuted(!isMuted)} className="absolute bottom-4 right-4 p-2 bg-black/40 backdrop-blur rounded-full text-white hover:bg-white/20 transition z-30">
                    {isMuted ? "🔇" : "🔊"}
                </button>

                {/* STATES OVERLAYS */}
                {gameState === 'difficultySelection' && renderOverlay("Độ Khó", (
                    <div className="flex flex-col gap-4 w-full max-w-md">
                        <p className="text-gray-300 mb-4">Chọn mức độ thử thách để bắt đầu.</p>
                        {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                            <button key={d} onClick={() => handleDifficultySelect(d)} className="bg-gray-800/80 hover:bg-pink-600 text-white py-3 rounded-lg font-bold capitalize border border-gray-600 hover:border-pink-400 transition-all transform hover:scale-105">
                                {d}
                            </button>
                        ))}
                        <button onClick={onExit} className="mt-4 text-gray-400 hover:text-white underline">Thoát</button>
                    </div>
                ))}

                {gameState === 'outfitGeneration' && renderOverlay("Đang Thiết Kế...", (
                    <div className="text-center">
                        <LoadingSpinner />
                        <p className="mt-4 text-pink-300 animate-pulse">{dialogue}</p>
                    </div>
                ))}

                {gameState === 'outfitSelection' && renderOverlay("Chọn Trang Phục", (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-w-2xl max-h-[60vh] overflow-y-auto p-2">
                        {outfitChoices.map((choice, i) => (
                            <button key={i} onClick={() => handleOutfitSelect(choice)} disabled={choice.isLoading} className="relative aspect-[3/4] rounded-lg overflow-hidden border-2 border-transparent hover:border-pink-500 transition-all group">
                                {choice.isLoading ? <LoadingSpinner /> : <img src={choice.imageUrl} className="w-full h-full object-cover" />}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <span className="text-xs font-bold text-white p-1">{choice.name}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                ))}

                {gameState === 'startScreen' && renderOverlay(`Vòng ${level}`, (
                    <button onClick={() => { setGameState('playing'); playMusic(); }} className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xl font-bold py-4 px-12 rounded-full shadow-lg hover:scale-110 transition-transform animate-pulse-glow">
                        BẮT ĐẦU
                    </button>
                ))}

                {gameState === 'generating' && renderOverlay("Vui lòng đợi...", <LoadingSpinner />)}

                {gameState === 'levelComplete' && renderOverlay("Hoàn Thành!", (
                     <button onClick={() => { setGameState('playing'); playMusic(); }} className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-transform hover:scale-105">
                        Vòng Tiếp Theo
                    </button>
                ))}

                {gameState === 'gameOver' && renderOverlay(lives <= 0 ? "Game Over" : "Chiến Thắng!", (
                    <div className="flex flex-col gap-3">
                        <p className="text-xl text-yellow-400 font-bold mb-4">Tổng điểm: {totalScore}</p>
                        <button onClick={() => handleDifficultySelect(difficulty)} className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-8 rounded-lg">Chơi Lại</button>
                        <button onClick={onExit} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg">Thoát</button>
                    </div>
                ))}
            </div>

            {/* --- RIGHT: SIDEBAR (MUSE & REWARDS) --- */}
            <div className="w-full lg:w-1/3 h-[35%] lg:h-full bg-gray-900/95 border-l border-gray-700 flex flex-col relative z-10">
                {/* Muse Avatar Area */}
                <div className="relative w-full aspect-square lg:h-1/2 bg-black overflow-hidden">
                    <img src={characterImage || character.singleImages?.[0]?.url} className="w-full h-full object-cover opacity-80" alt="Muse" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                    
                    {/* Dialogue Bubble */}
                    <div className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-xl rounded-tl-none animate-fade-in">
                        <p className="text-sm lg:text-base text-white font-medium leading-snug">"{dialogue}"</p>
                    </div>
                </div>

                {/* Interactions Area */}
                <div className="flex-grow flex flex-col p-4 gap-4 min-h-0">
                    {/* Rewards Panel */}
                    <div className="flex-grow bg-black/40 rounded-lg border border-gray-700 p-3 flex flex-col">
                        <h3 className="text-xs font-bold text-pink-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                            <span>Phần Thưởng Vòng {level}</span>
                            <IconLightning />
                        </h3>
                        <div className="grid grid-cols-2 gap-2 overflow-y-auto pr-1">
                            {availableRewards.items.map(item => (
                                <button 
                                    key={item}
                                    onClick={() => handleClothingChoice(item, availableRewards.category!)}
                                    disabled={gameState !== 'rewardSelection'}
                                    className="bg-gray-800 hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-200 text-xs py-2 px-3 rounded border border-gray-600 transition-all text-left truncate"
                                >
                                    {item}
                                </button>
                            ))}
                            {availableRewards.items.length === 0 && <p className="text-gray-500 text-xs italic col-span-2 text-center py-4">Hoàn thành vòng chơi để mở khóa...</p>}
                        </div>
                    </div>

                    {/* Chat Log */}
                    <div className="h-1/3 bg-black/40 rounded-lg border border-gray-700 p-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600">
                        {chatMessages.map(msg => (
                             <div key={msg.id} className="mb-2 text-xs animate-slide-in-left">
                                 <span className="font-bold text-pink-500">{character.name}: </span>
                                 <span className="text-gray-300">{msg.text}</span>
                             </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BeerCatchGame;
