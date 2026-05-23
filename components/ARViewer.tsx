
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CharacterProfile, GalleryImage } from '../types';
import { generateCharacterImage } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

interface ARViewerProps {
  character: CharacterProfile;
  onBack: () => void;
  onUpdate: (updatedCharacter: CharacterProfile) => void;
}

// Audio Helpers
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

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

function createAudioBlob(data: Float32Array): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
}

const ARViewer: React.FC<ARViewerProps> = ({ character, onBack, onUpdate }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // 360 Degree Logic: Store images for different angles
  const [angles, setAngles] = useState<Record<number, string>>({
    0: character.singleImages?.[0]?.url || ''
  });
  const [currentAngle, setCurrentAngle] = useState(0); // 0, 90, 180, 270
  const [rotationValue, setRotationValue] = useState(0); // For the slider UI

  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [scale, setScale] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Live API States
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [isLiveLoading, setIsLiveLoading] = useState(false);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const nextStartTimeRef = useRef(0);
  const audioContextOutRef = useRef<AudioContext | null>(null);
  const audioContextInRef = useRef<AudioContext | null>(null);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Init Camera
  useEffect(() => {
    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: true });
        setStream(mediaStream);
        if (videoRef.current) videoRef.current.srcObject = mediaStream;
      } catch (err) {
        console.error(err);
        alert("Cần quyền Camera & Mic để hẹn hò AR.");
      }
    }
    startCamera();
    return () => {
      stream?.getTracks().forEach(track => track.stop());
      stopLiveSession();
    };
  }, []);

  const stopLiveSession = useCallback(() => {
    setIsLiveActive(false);
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => session.close());
      sessionPromiseRef.current = null;
    }
    audioSourcesRef.current.forEach(s => s.stop());
    audioSourcesRef.current.clear();
  }, []);

  const startLiveSession = async () => {
    if (!stream) return;
    setIsLiveLoading(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    audioContextInRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    audioContextOutRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks: {
        onopen: () => {
          setIsLiveActive(true);
          setIsLiveLoading(false);
          const source = audioContextInRef.current!.createMediaStreamSource(stream);
          const scriptProcessor = audioContextInRef.current!.createScriptProcessor(4096, 1, 1);
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const pcmBlob = createAudioBlob(inputData);
            sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
          };
          source.connect(scriptProcessor);
          scriptProcessor.connect(audioContextInRef.current!.destination);
        },
        onmessage: async (message: LiveServerMessage) => {
          const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (base64Audio && audioContextOutRef.current) {
            const ctx = audioContextOutRef.current;
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
            const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            source.addEventListener('ended', () => audioSourcesRef.current.delete(source));
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += audioBuffer.duration;
            audioSourcesRef.current.add(source);
          }
        },
        onerror: (e) => { console.error(e); stopLiveSession(); },
        onclose: () => { setIsLiveActive(false); setIsLiveLoading(false); }
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: character.gender === 'Male' ? 'Zephyr' : 'Kore' } } },
        systemInstruction: `Bạn là ${character.name}, ${character.personality}. Bạn đang trong buổi hẹn hò AR. Hãy trò chuyện ngọt ngào. Nếu họ yêu cầu bạn xoay người, đổi đồ hoặc tạo dáng, hãy đồng ý và yêu cầu họ đợi một chút để bạn "biến hóa".`
      }
    });
    sessionPromiseRef.current = sessionPromise;
  };

  const generateAngle = async (targetAngle: number) => {
    if (angles[targetAngle]) {
        setCurrentAngle(targetAngle);
        return;
    }
    setIsGenerating(true);
    try {
        let anglePrompt = "";
        if (targetAngle === 0) anglePrompt = "front view, facing camera";
        else if (targetAngle === 90) anglePrompt = "side profile view, looking left";
        else if (targetAngle === 180) anglePrompt = "back view, facing away from camera";
        else if (targetAngle === 270) anglePrompt = "side profile view, looking right";

        const images = await generateCharacterImage(character, {
            numberOfImages: 1,
            posePrompt: `full body standing, ${anglePrompt}`,
            backgroundPrompt: "plain white studio background for transparent overlay",
        });

        if (images.length > 0) {
            const url = `data:image/jpeg;base64,${images[0]}`;
            setAngles(prev => ({ ...prev, [targetAngle]: url }));
            setCurrentAngle(targetAngle);
        }
    } catch (e) {
        console.error(e);
    } finally {
        setIsGenerating(false);
    }
  };

  const handleRotationChange = (val: number) => {
    setRotationValue(val);
    // Snap to nearest 90 degrees
    const snapped = Math.round(val / 90) * 90;
    const normalized = ((snapped % 360) + 360) % 360;
    if (normalized !== currentAngle) {
        generateAngle(normalized);
    }
  };

  const handleQuickChange = async () => {
    setIsGenerating(true);
    try {
      const outfits = ["váy lụa mỏng manh", "đồ thể thao năng động", "đồ lót ren quyến rũ", "bikini nóng bỏng", "trang phục dạo phố sang chảnh"];
      const randomOutfit = outfits[Math.floor(Math.random() * outfits.length)];
      
      const images = await generateCharacterImage(character, {
        numberOfImages: 1,
        outfitPrompt: randomOutfit,
        backgroundPrompt: `plain white studio background`,
        posePrompt: "standing gracefully, engaging with camera"
      });

      if (images.length > 0) {
        const url = `data:image/jpeg;base64,${images[0]}`;
        // Reset angles because outfit changed
        setAngles({ [currentAngle]: url });
        const newImg: GalleryImage = { id: uuidv4(), url, createdAt: Date.now(), prompt: `AR Change: ${randomOutfit}` };
        onUpdate({ ...character, singleImages: [newImg, ...(character.singleImages || [])] });
      }
    } catch (e) { console.error(e); }
    finally { setIsGenerating(false); }
  };

  const handleCapture = () => {
    const flash = document.createElement('div');
    flash.className = "fixed inset-0 bg-white z-[100] animate-flash pointer-events-none";
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 500);
    alert("📸 Khoảnh khắc tuyệt đẹp! Ảnh đã được lưu vào bộ sưu tập ảo.");
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col" ref={containerRef}>
      <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />

      {/* Muse Overlay with CSS Rotation Feedback */}
      <div 
        className="absolute transition-all duration-500 ease-in-out cursor-move"
        style={{ 
          left: `${position.x}%`, 
          top: `${position.y}%`, 
          transform: `translate(-50%, -50%) scale(${scale})`,
          filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.6))'
        }}
        onTouchMove={(e) => {
            const touch = e.touches[0];
            const rect = containerRef.current?.getBoundingClientRect();
            if (rect) setPosition({ x: (touch.clientX / rect.width) * 100, y: (touch.clientY / rect.height) * 100 });
        }}
      >
        <div className="relative overflow-hidden rounded-2xl group">
            {angles[currentAngle] && (
                <img 
                  src={angles[currentAngle]} 
                  alt="Muse" 
                  className={`max-h-[70vh] w-auto pointer-events-none transition-opacity duration-300 ${isGenerating ? 'opacity-50' : 'opacity-100'}`}
                  style={{ maskImage: 'linear-gradient(to bottom, black 90%, transparent 100%)' }}
                />
            )}
            {isGenerating && <div className="absolute inset-0 flex items-center justify-center bg-black/20"><LoadingSpinner /></div>}
        </div>
      </div>

      {/* AR HUD */}
      <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col items-center gap-6 z-20">
        
        {/* Rotation & Scale Sliders */}
        <div className="w-full max-w-sm space-y-4 bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest w-16">Xoay 360°</span>
             <input 
                type="range" min="0" max="360" step="1" value={rotationValue} 
                onChange={(e) => handleRotationChange(parseInt(e.target.value))}
                className="flex-1 accent-pink-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
             />
          </div>
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest w-16">Phóng to</span>
             <input 
                type="range" min="0.5" max="2.5" step="0.1" value={scale} 
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="flex-1 accent-blue-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
             />
          </div>
        </div>

        {/* Buttons Group */}
        <div className="flex items-center justify-center gap-6">
          <button onClick={handleQuickChange} disabled={isGenerating} className="w-14 h-14 rounded-full bg-blue-600/80 backdrop-blur-md flex items-center justify-center border border-blue-400/50 shadow-lg active:scale-90 transition-all hover:bg-blue-500">
             <svg xmlns="http://www.w3.org/2000/svg" className={`h-7 w-7 text-white ${isGenerating ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>

          <button onClick={handleCapture} className="w-20 h-20 rounded-full bg-white border-[6px] border-pink-500 flex items-center justify-center shadow-[0_0_25px_rgba(236,72,153,0.6)] active:scale-95 transition-transform">
             <div className="w-14 h-14 rounded-full border-2 border-gray-200"></div>
          </button>

          <button 
            onClick={isLiveActive ? stopLiveSession : startLiveSession}
            disabled={isLiveLoading}
            className={`w-14 h-14 rounded-full flex items-center justify-center border shadow-lg transition-all ${isLiveActive ? 'bg-red-600 border-red-400 animate-pulse' : 'bg-green-600/80 border-green-400'}`}
          >
             {isLiveLoading ? <LoadingSpinner /> : (
               <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
               </svg>
             )}
          </button>
        </div>

        <div className="flex flex-col items-center">
            <button onClick={onBack} className="text-white/60 text-xs font-bold uppercase tracking-[0.2em] mb-2 hover:text-white transition-colors">Kết thúc hẹn hò</button>
            <p className="text-[10px] text-gray-500 bg-black/60 px-3 py-1 rounded-full border border-white/5 italic">
               {isLiveActive ? `Đang tâm sự cùng ${character.name}...` : `Hãy xoay thanh trượt để ngắm em từ mọi phía`}
            </p>
        </div>
      </div>

      <style>{`
        @keyframes flash { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0; } }
        .animate-flash { animation: flash 0.5s ease-out; }
      `}</style>
    </div>
  );
};

export default ARViewer;
