import React, { useState, useRef } from 'react';
import { CharacterProfile, CostumeSet } from '../types';
import { generateCostumeSet, generateRandomOutfitPrompts, generateOutfitImage, extractOutfitFromImage } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { v4 as uuidv4 } from 'uuid';

interface CostumeStudioProps {
    character: CharacterProfile;
    onSave: (updatedCharacter: CharacterProfile) => void;
    onBack: () => void;
}

const CostumeStudio: React.FC<CostumeStudioProps> = ({ character, onSave, onBack }) => {
    const [theme, setTheme] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedSet, setGeneratedSet] = useState<CostumeSet | null>(null);
    const [recentSets, setRecentSets] = useState<CostumeSet[]>([]);
    const [generationProgress, setGenerationProgress] = useState<{ current: number, total: number } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleGenerate = async () => {
        if (!theme.trim()) return;
        setIsGenerating(true);
        try {
            const result = await generateCostumeSet(character, theme);
            const newSet: CostumeSet = {
                id: uuidv4(),
                name: result.name,
                items: result.items,
                previewImage: result.image,
                createdAt: Date.now()
            };
            setGeneratedSet(newSet);
            setRecentSets(prev => [newSet, ...prev]);
        } catch (error) {
            console.error("Failed to generate costume set:", error);
            alert("Không thể tạo bộ trang phục. Vui lòng thử lại.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsGenerating(true);
        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = (reader.result as string).split(',')[1];
                const mimeType = file.type;

                // 1. Extract outfit description
                const analysis = await extractOutfitFromImage(base64, mimeType);
                
                // 2. Generate outfit on character
                const imageB64 = await generateOutfitImage(character, analysis.masterPrompt);
                
                const newSet: CostumeSet = {
                    id: uuidv4(),
                    name: analysis.name || "Trang phục từ ảnh",
                    items: [analysis.name || "Custom Outfit"],
                    previewImage: `data:image/jpeg;base64,${imageB64}`,
                    createdAt: Date.now()
                };
                setGeneratedSet(newSet);
                setTheme(analysis.name || ""); // Auto-fill theme input
                setRecentSets(prev => [newSet, ...prev]);
                setIsGenerating(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error("Failed to process uploaded image:", error);
            alert("Không thể phân tích ảnh trang phục. Vui lòng thử lại.");
            setIsGenerating(false);
        }
    };

    const handleGenerateRandom = async () => {
        setIsGenerating(true);
        setGenerationProgress({ current: 0, total: 10 });
        try {
            const prompts = await generateRandomOutfitPrompts(character);
            const newSets: CostumeSet[] = [];
            
            // Generate in parallel batches of 2 to speed up but avoid rate limits
            const batchSize = 2;
            for (let i = 0; i < prompts.length; i += batchSize) {
                const batch = prompts.slice(i, i + batchSize);
                const promises = batch.map(async (p: any) => {
                    try {
                        const imageB64 = await generateOutfitImage(character, p.prompt);
                        return {
                            id: uuidv4(),
                            name: p.name,
                            items: [p.name],
                            previewImage: `data:image/jpeg;base64,${imageB64}`,
                            createdAt: Date.now()
                        } as CostumeSet;
                    } catch (e) {
                        console.warn("Failed to generate one outfit", e);
                        return null;
                    }
                });
                
                const results = await Promise.all(promises);
                const validResults = results.filter(r => r !== null) as CostumeSet[];
                newSets.push(...validResults);
                
                setGenerationProgress(prev => ({ 
                    current: Math.min((prev?.current || 0) + batchSize, 10), 
                    total: 10 
                }));
            }
            
            if (newSets.length > 0) {
                // Add to costumeSets AND singleImages (album)
                const newSingleImages = newSets.map(set => ({
                    id: uuidv4(),
                    url: set.previewImage,
                    prompt: `Costume: ${set.name}`,
                    createdAt: Date.now()
                }));

                const updatedCharacter = {
                    ...character,
                    costumeSets: [...newSets, ...(character.costumeSets || [])],
                    singleImages: [...newSingleImages, ...(character.singleImages || [])].slice(0, 100) // Limit to 100
                };
                
                onSave(updatedCharacter);
                setRecentSets(prev => [...newSets, ...prev]);
                setGeneratedSet(newSets[newSets.length - 1]);
                alert(`Đã tạo và lưu ${newSets.length} bộ trang phục vào Album và Tủ Đồ!`);
            } else {
                alert("Không thể tạo bộ trang phục nào. Vui lòng thử lại.");
            }
            
        } catch (error) {
            console.error("Random generation failed", error);
            alert("Có lỗi xảy ra khi tạo bộ sưu tập.");
        } finally {
            setIsGenerating(false);
            setGenerationProgress(null);
        }
    };

    const handleSave = () => {
        if (!generatedSet) return;
        // Check if already saved (by random generation)
        const isAlreadySaved = character.costumeSets?.some(s => s.id === generatedSet.id);
        
        if (isAlreadySaved) {
             alert("Bộ trang phục này đã được lưu!");
             return;
        }

        const newSingleImage = {
            id: uuidv4(),
            url: generatedSet.previewImage,
            prompt: `Costume: ${generatedSet.name}`,
            createdAt: Date.now()
        };

        const updatedCharacter = {
            ...character,
            costumeSets: [generatedSet, ...(character.costumeSets || [])],
            singleImages: [newSingleImage, ...(character.singleImages || [])].slice(0, 100)
        };
        onSave(updatedCharacter);
        alert("Đã lưu bộ trang phục vào tủ đồ và album!");
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <button onClick={onBack} className="text-gray-400 hover:text-white flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Quay lại
                    </button>
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500">
                        Xưởng Thiết Kế Trang Phục
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Panel: Input */}
                    <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                        <div className="flex items-center gap-4 mb-6">
                            <img 
                                src={character.singleImages?.[0]?.url || character.referenceImage} 
                                alt={character.name} 
                                className="w-16 h-16 rounded-full object-cover border-2 border-pink-500"
                            />
                            <div>
                                <h2 className="text-xl font-bold">{character.name}</h2>
                                <p className="text-sm text-gray-400">Người mẫu của bạn</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-gray-300">Chủ đề trang phục</label>
                            <input 
                                type="text" 
                                value={theme}
                                onChange={(e) => setTheme(e.target.value)}
                                placeholder="Ví dụ: Dạ hội lộng lẫy, Cyberpunk, Bikini bãi biển..."
                                className="w-full bg-gray-900 border border-gray-600 rounded-xl p-4 text-white focus:border-pink-500 focus:outline-none"
                            />
                            
                            <div className="flex flex-wrap gap-2 mt-2">
                                {['Dạ hội', 'Bikini', 'Công sở', 'Thể thao', 'Cyberpunk', 'Cổ trang'].map(t => (
                                    <button 
                                        key={t}
                                        onClick={() => setTheme(t)}
                                        className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-full text-gray-300 transition-colors"
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>

                            <button 
                                onClick={handleGenerate}
                                disabled={isGenerating || !theme}
                                className="w-full mt-6 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isGenerating && !generationProgress ? <LoadingSpinner /> : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                                        </svg>
                                        Thiết Kế Ngay
                                    </>
                                )}
                            </button>

                            <div className="relative flex py-5 items-center">
                                <div className="flex-grow border-t border-gray-700"></div>
                                <span className="flex-shrink-0 mx-4 text-gray-500 text-xs">HOẶC</span>
                                <div className="flex-grow border-t border-gray-700"></div>
                            </div>

                            {/* Upload Image Button */}
                            <div 
                                onClick={() => !isGenerating && fileInputRef.current?.click()}
                                className={`border-2 border-dashed border-gray-600 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-pink-500 hover:bg-gray-800 transition-all ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-sm font-bold text-gray-300">Tải ảnh trang phục mẫu</span>
                                <span className="text-xs text-gray-500 mt-1">AI sẽ phân tích và thử đồ cho nhân vật</span>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleImageUpload} 
                                    accept="image/*" 
                                    className="hidden" 
                                    disabled={isGenerating}
                                />
                            </div>

                            <div className="relative flex py-5 items-center">
                                <div className="flex-grow border-t border-gray-700"></div>
                                <span className="flex-shrink-0 mx-4 text-gray-500 text-xs">HOẶC</span>
                                <div className="flex-grow border-t border-gray-700"></div>
                            </div>

                            <button 
                                onClick={handleGenerateRandom}
                                disabled={isGenerating}
                                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-gray-600 hover:border-pink-500"
                            >
                                {isGenerating && generationProgress ? (
                                    <div className="flex items-center gap-2">
                                        <LoadingSpinner />
                                        <span>Đang tạo {generationProgress.current}/{generationProgress.total}...</span>
                                    </div>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                        </svg>
                                        Tạo Ngẫu Nhiên 10 Bộ (Tự Động Lưu)
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Right Panel: Preview */}
                    <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 flex flex-col items-center justify-center min-h-[400px]">
                        {generatedSet ? (
                            <div className="w-full space-y-4 animate-fade-in">
                                <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden shadow-2xl">
                                    <img src={generatedSet.previewImage} alt="Preview" className="w-full h-full object-cover" />
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4">
                                        <h3 className="text-xl font-bold text-white">{generatedSet.name}</h3>
                                    </div>
                                </div>
                                
                                <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                                    <h4 className="text-sm font-bold text-gray-400 mb-2 uppercase">Chi tiết set đồ</h4>
                                    <ul className="space-y-1">
                                        {generatedSet.items.map((item, i) => (
                                            <li key={i} className="text-sm text-gray-300 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 bg-pink-500 rounded-full"></span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <button 
                                    onClick={handleSave}
                                    className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Lưu Vào Tủ Đồ
                                </button>
                            </div>
                        ) : (
                            <div className="text-center text-gray-500">
                                <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <p>Nhập chủ đề, tải ảnh mẫu hoặc chọn ngẫu nhiên</p>
                                <p className="text-sm mt-2">AI sẽ tạo ra bộ trang phục độc đáo cho {character.name}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Sets Grid */}
                {recentSets.length > 0 && (
                    <div className="mt-12">
                        <h3 className="text-2xl font-bold text-white mb-6">Bộ Sưu Tập Vừa Tạo</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {recentSets.map((set) => (
                                <div 
                                    key={set.id} 
                                    onClick={() => setGeneratedSet(set)}
                                    className={`relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${generatedSet?.id === set.id ? 'border-pink-500 scale-105 shadow-lg shadow-pink-500/20' : 'border-transparent hover:border-gray-500'}`}
                                >
                                    <img src={set.previewImage} alt={set.name} className="w-full h-full object-cover" />
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2">
                                        <p className="text-xs text-white font-bold truncate">{set.name}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CostumeStudio;
