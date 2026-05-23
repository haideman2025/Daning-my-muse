import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CharacterProfile, Storyboard, StoryboardScene } from '../types';
import { generateStoryboardConcept, generateStoryboardSceneImage } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

interface StoryboardCreatorProps {
  character: CharacterProfile;
  onUpdate: (updatedCharacter: CharacterProfile) => void;
  onBack: () => void;
}

const STORY_CATEGORIES = ["Quảng cáo", "Cosplay", "Vlog", "Sáng tạo", "Dancing", "Đời sống"];
const IconWand = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;
const IconCamera = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>;

const StoryboardCreator: React.FC<StoryboardCreatorProps> = ({ character, onUpdate, onBack }) => {
    const [idea, setIdea] = useState('');
    const [category, setCategory] = useState(STORY_CATEGORIES[0]);
    const [storyboard, setStoryboard] = useState<Storyboard | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const handleGenerateConcept = async () => {
        if (!idea.trim()) {
            setError("Vui lòng nhập ý tưởng của bạn.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const scenesData = await generateStoryboardConcept(character, idea, category);
            const newStoryboard: Storyboard = {
                id: uuidv4(),
                title: idea,
                category: category,
                createdAt: Date.now(),
                characterId: character.id,
                scenes: scenesData.map(data => ({
                    id: uuidv4(),
                    ...data,
                })),
            };
            setStoryboard(newStoryboard);
        } catch (e) {
            console.error(e);
            setError("AI không thể phát triển ý tưởng này. Vui lòng thử lại với một ý tưởng khác.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateSceneImage = async (sceneId: string) => {
        if (!storyboard) return;

        setStoryboard(prev => prev ? {
            ...prev,
            scenes: prev.scenes.map(s => s.id === sceneId ? { ...s, isGenerating: true } : s)
        } : null);

        try {
            const sceneToGenerate = storyboard.scenes.find(s => s.id === sceneId);
            if (!sceneToGenerate) throw new Error("Scene not found");

            const imageB64 = await generateStoryboardSceneImage(character, sceneToGenerate);
            const imageUrl = `data:image/jpeg;base64,${imageB64}`;

            setStoryboard(prev => prev ? {
                ...prev,
                scenes: prev.scenes.map(s => s.id === sceneId ? { ...s, imageUrl: imageUrl, isGenerating: false } : s)
            } : null);
        } catch (e) {
            console.error(`Failed to generate image for scene ${sceneId}`, e);
            // Optionally set an error state on the scene itself
            setStoryboard(prev => prev ? {
                ...prev,
                scenes: prev.scenes.map(s => s.id === sceneId ? { ...s, isGenerating: false } : s)
            } : null);
        }
    };

    const handleGenerateAllImages = async () => {
        if (!storyboard) return;
        for (const scene of storyboard.scenes) {
            if (!scene.imageUrl) {
                await handleGenerateSceneImage(scene.id);
            }
        }
    };

    const handleSaveStoryboard = () => {
        if (!storyboard) return;
        const updatedCharacter = {
            ...character,
            storyboards: [storyboard, ...(character.storyboards || [])]
        };
        onUpdate(updatedCharacter);
        alert("Đã lưu Storyboard vào Album của nhân vật!");
    };

    if (isLoading) {
        return (
            <div className="text-center">
                <LoadingSpinner />
                <p className="mt-4 font-semibold text-pink-400">Nhà biên kịch AI đang sáng tác...</p>
                <p className="text-sm text-gray-400">Vui lòng đợi trong giây lát.</p>
            </div>
        );
    }
    
    if (storyboard) {
        return (
            <div className="w-full">
                <h2 className="text-2xl font-bold mb-1">Kịch bản cho: <span className="text-pink-400">{storyboard.title}</span></h2>
                <p className="text-gray-400 mb-4">Đây là kịch bản AI đã tạo. Hãy tạo hình ảnh cho từng cảnh.</p>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {storyboard.scenes.map(scene => (
                        <div key={scene.id} className="bg-gray-800/50 p-4 rounded-lg flex flex-col sm:flex-row gap-4 items-start">
                            <div className="flex-shrink-0 w-full sm:w-48 aspect-video bg-gray-900 rounded-md flex items-center justify-center">
                                {scene.isGenerating ? <LoadingSpinner /> : scene.imageUrl ? <img src={scene.imageUrl} alt={`Scene ${scene.sceneNumber}`} className="w-full h-full object-cover rounded-md"/> : <div className="text-gray-500 text-sm p-2">Chưa có ảnh</div>}
                            </div>
                            <div className="flex-grow">
                                <h3 className="font-bold text-pink-400">Cảnh {scene.sceneNumber}</h3>
                                <p className="text-sm text-gray-300 mt-1 mb-2">{scene.description}</p>
                                <div className="text-xs text-gray-400 space-y-1">
                                    <p><span className="font-semibold">Bối cảnh:</span> {scene.setting}</p>
                                    <p><span className="font-semibold">Hành động:</span> {scene.action}</p>
                                    <p><span className="font-semibold">Góc máy:</span> {scene.cameraAngle}</p>
                                </div>
                            </div>
                            <div className="flex-shrink-0 w-full sm:w-auto">
                                <button onClick={() => handleGenerateSceneImage(scene.id)} disabled={scene.isGenerating || !!scene.imageUrl} className="w-full bg-teal-600 text-white font-semibold py-2 px-4 rounded-md text-sm hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                                    {scene.isGenerating ? "Đang tạo..." : scene.imageUrl ? "Hoàn thành" : "Tạo ảnh"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                 <div className="mt-4 pt-4 border-t border-gray-600 flex flex-col sm:flex-row gap-3">
                    <button onClick={handleGenerateAllImages} className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-2 px-6 rounded-lg hover:scale-105 transition-transform"><IconCamera />Tạo Tất Cả Ảnh</button>
                    <button onClick={handleSaveStoryboard} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-2 px-6 rounded-lg hover:scale-105 transition-transform">Lưu Storyboard</button>
                    <button onClick={() => setStoryboard(null)} className="flex-1 bg-gray-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-700 transition">Tạo kịch bản khác</button>
                 </div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-lg text-center">
            <h2 className="text-3xl font-bold mb-2">Nhà Biên Kịch AI</h2>
            <p className="text-gray-400 mb-6">Hãy đưa ra một ý tưởng, AI sẽ phát triển nó thành một kịch bản phân cảnh hoàn chỉnh.</p>
            <div className="space-y-4">
                <div>
                    <label htmlFor="story-category" className="block text-sm font-semibold text-gray-300 mb-2">Chọn thể loại</label>
                    <select id="story-category" value={category} onChange={e => setCategory(e.target.value)} className="bg-gray-800 p-3 rounded-lg w-full border border-gray-700">
                        {STORY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="story-idea" className="block text-sm font-semibold text-gray-300 mb-2">Ý tưởng của bạn</label>
                    <textarea
                        id="story-idea"
                        value={idea}
                        onChange={e => setIdea(e.target.value)}
                        placeholder="VD: Một buổi sáng mùa thu tại Paris, một video quảng cáo xe hơi thể thao, một điệu nhảy dưới mưa..."
                        className="bg-gray-800 p-3 rounded-lg w-full border border-gray-700"
                        rows={3}
                    />
                </div>
            </div>
            {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
            <button
                onClick={handleGenerateConcept}
                className="mt-6 w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3 px-8 rounded-lg transition-transform duration-200 hover:scale-105 shadow-lg flex items-center justify-center"
            >
                <IconWand />
                Phát triển ý tưởng
            </button>
        </div>
    );
};

export default StoryboardCreator;