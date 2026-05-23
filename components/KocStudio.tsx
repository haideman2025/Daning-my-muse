
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CharacterProfile, GalleryImage } from '../types';
import { generateCharacterImage } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { usePreview } from './PreviewContext';

interface KocStudioProps {
  character: CharacterProfile;
  onUpdate: (updatedCharacter: CharacterProfile) => void;
  onBack: () => void;
}

interface StoryContext {
    id: string;
    label: string;
    description: string;
    prompt: string;
    mood: string;
}

const STORY_CONTEXTS: StoryContext[] = [
    { 
        id: 'street_style', 
        label: 'OOTD Dạo Phố', 
        description: 'Năng động, tự tin khoe outfit trên đường phố sầm uất.',
        prompt: 'walking confidently on a high-end fashion street, paparazzi style photography, motion blur background with city life, golden hour lighting, holding a take-away coffee cup',
        mood: 'Confident & Trendy'
    },
    { 
        id: 'review_home', 
        label: 'Góc Review Tại Nhà', 
        description: 'Gần gũi, chân thực, không gian sống chill & cozy.',
        prompt: 'sitting comfortably on a soft rug or minimalist sofa, soft diffused natural window lighting, clean and aesthetic home interior background, warm tones',
        mood: 'Cozy & Authentic'
    },
    { 
        id: 'luxury_event', 
        label: 'Sự Kiện Sang Trọng', 
        description: 'Đẳng cấp, quyến rũ, check-in tiệc tối hoặc thảm đỏ.',
        prompt: 'standing at a luxury gala event or rooftop bar at night, bokeh city lights in background, flash photography style, elegant pose, holding a champagne glass',
        mood: 'Glamorous & Luxurious'
    },
    { 
        id: 'travel_lifestyle', 
        label: 'Du Lịch & Nghỉ Dưỡng', 
        description: 'Tự do, phóng khoáng, check-in resort hoặc địa điểm hot.',
        prompt: 'posing against a breathtaking scenic view (luxury resort pool or european architecture), wind blowing in hair, laughing naturally, travel blogger aesthetic, vibrant colors',
        mood: 'Adventurous & Free'
    },
    { 
        id: 'gym_fitness', 
        label: 'Sporty & Fitness', 
        description: 'Khoe dáng, năng lượng, phòng tập hoặc chạy bộ.',
        prompt: 'in a modern gym or yoga studio with mirrors, slight sweat glow on skin, dynamic pose showing curves and strength, holding a water bottle, energetic atmosphere',
        mood: 'Energetic & Healthy'
    },
    {
        id: 'coffee_date',
        label: 'Cà Phê Cuối Tuần',
        description: 'Thư giãn, nhẹ nhàng, hẹn hò tại quán cafe đẹp.',
        prompt: 'sitting at a stylish outdoor cafe table, sunlight filtering through trees, engaging with the camera across the table, relaxing weekend vibes',
        mood: 'Relaxed & Romantic'
    }
];

const PRODUCT_FOCUS_OPTIONS = [
    { id: 'full_body', label: 'Toàn Thân (Outfit)' },
    { id: 'portrait', label: 'Cận Mặt (Makeup/Kính)' },
    { id: 'upper_body', label: 'Thân Trên (Áo/Vòng)' },
    { id: 'lower_body', label: 'Thân Dưới (Quần/Giày)' },
    { id: 'hands', label: 'Cận Tay (Túi/Đồng hồ)' },
];

const FASHION_CATEGORIES = [
    { key: 'top', label: 'Áo / Váy Liền' },
    { key: 'bottom', label: 'Quần / Chân Váy' },
    { key: 'shoes', label: 'Giày / Dép' },
    { key: 'bag', label: 'Túi Xách / Ví' },
    { key: 'accessory', label: 'Đồng Hồ / Trang Sức' },
    { key: 'eyewear', label: 'Kính Mắt' },
];

// Icons
const IconHanger = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" /></svg>;
const IconCamera = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>;
const IconSparkles = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.934L13.033 17.256A1 1 0 0112 18V2z" clipRule="evenodd" /></svg>;

const KocStudio: React.FC<KocStudioProps> = ({ character, onUpdate, onBack }) => {
    const [selectedContext, setSelectedContext] = useState<StoryContext | null>(null);
    const [productFocus, setProductFocus] = useState('full_body');
    
    // Fashion Matrix State - allow user to type details if they don't have wardrobe items
    const [fashionDetails, setFashionDetails] = useState<Record<string, string>>({
        top: '',
        bottom: '',
        shoes: '',
        bag: '',
        accessory: '',
        eyewear: ''
    });

    // Also allow selecting from Wardrobe if available
    const [selectedWardrobeIds, setSelectedWardrobeIds] = useState<Record<string, string>>({});

    const [customStory, setCustomStory] = useState('');
    const [quantity, setQuantity] = useState(2);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImages, setGeneratedImages] = useState<GalleryImage[]>([]);
    const { showPreview } = usePreview();

    const wardrobe = character.wardrobe || [];

    const handleFashionDetailChange = (category: string, value: string) => {
        setFashionDetails(prev => ({ ...prev, [category]: value }));
        // If typing manually, clear the wardrobe selection for this category to avoid conflict
        if (selectedWardrobeIds[category]) {
            setSelectedWardrobeIds(prev => {
                const next = { ...prev };
                delete next[category];
                return next;
            });
        }
    };

    const handleWardrobeSelect = (category: string, itemId: string) => {
        const item = wardrobe.find(w => w.id === itemId);
        if (item) {
            setFashionDetails(prev => ({ ...prev, [category]: item.masterPrompt })); // Use master prompt for generation
            setSelectedWardrobeIds(prev => ({ ...prev, [category]: itemId }));
        } else {
             setSelectedWardrobeIds(prev => {
                const next = { ...prev };
                delete next[category];
                return next;
            });
             setFashionDetails(prev => ({ ...prev, [category]: '' }));
        }
    };

    const handleGenerate = async () => {
        if (!selectedContext) {
            alert("Vui lòng chọn bối cảnh câu chuyện (Story Context)!");
            return;
        }

        setIsGenerating(true);
        
        // --- Prompt Engineering for KOC/Affiliate ---
        let outfitDescriptionParts = [];
        if (fashionDetails.top) outfitDescriptionParts.push(`wearing ${fashionDetails.top}`);
        if (fashionDetails.bottom) outfitDescriptionParts.push(`wearing ${fashionDetails.bottom}`);
        if (fashionDetails.shoes) outfitDescriptionParts.push(`wearing ${fashionDetails.shoes}`);
        if (fashionDetails.bag) outfitDescriptionParts.push(`carrying ${fashionDetails.bag}`);
        if (fashionDetails.accessory) outfitDescriptionParts.push(`wearing ${fashionDetails.accessory}`);
        if (fashionDetails.eyewear) outfitDescriptionParts.push(`wearing ${fashionDetails.eyewear}`);

        const outfitPrompt = outfitDescriptionParts.length > 0 ? outfitDescriptionParts.join(', ') : "wearing stylish, trending fashion outfit";

        // Focus Logic
        let cameraInstruction = "";
        switch (productFocus) {
            case 'portrait': cameraInstruction = "Close-up portrait shot, focus on face and accessories, shallow depth of field, detailed skin texture"; break;
            case 'upper_body': cameraInstruction = "Medium shot, waist up, focus on top clothing and jewelry, sharp focus"; break;
            case 'lower_body': cameraInstruction = "Low angle shot, focus on legs, shoes and pants/skirt, street fashion vibe"; break;
            case 'hands': cameraInstruction = "Extreme close up on hands holding the bag or showing the watch/ring, blurry background, product photography style"; break;
            default: cameraInstruction = "Full body shot, showcasing the entire outfit from head to toe, wide dynamic range"; break;
        }

        // Final Prompt Assembly
        const finalPrompt = `
            Fashion editorial photography of ${character.name}, a top virtual influencer.
            **Context:** ${selectedContext.prompt}.
            **Atmosphere:** ${selectedContext.mood}.
            **Fashion Breakdown:** ${outfitPrompt}.
            **Camera Focus:** ${cameraInstruction}.
            **Story/Details:** ${customStory}.
            **Style:** High-end fashion lookbook, commercial lighting, trending on Vogue, 8k, ultra-realistic texture.
        `;

        try {
            const imageBase64Array = await generateCharacterImage(character, {
                numberOfImages: quantity,
                backgroundPrompt: finalPrompt,
                posePrompt: "professional fashion model pose, engaging with camera or looking effortlessly chic"
            });

            const newImages: GalleryImage[] = imageBase64Array.map(b64 => ({
                id: uuidv4(),
                url: `data:image/jpeg;base64,${b64}`,
                createdAt: Date.now(),
                prompt: `Campaign: ${selectedContext.label} - ${productFocus}`
            }));

            setGeneratedImages(prev => [...newImages, ...prev]);
            onUpdate({
                ...character,
                singleImages: [...newImages, ...(character.singleImages || [])]
            });

        } catch (error) {
            console.error("KOC Generation failed", error);
            alert("Tạo ảnh thất bại. Vui lòng thử lại.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex flex-col h-full text-white">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500 flex items-center gap-2">
                        <IconSparkles /> KOC.AI Manager
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Xây dựng thương hiệu cá nhân & Kiếm tiền từ người mẫu ảo</p>
                </div>
                <button onClick={onBack} className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold border border-gray-600 transition-colors">
                    Thoát
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
                
                {/* Left Sidebar: Strategy & Campaign Config */}
                <div className="w-full lg:w-5/12 flex flex-col gap-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700">
                    
                    {/* Phase 1: Story Context */}
                    <div className="bg-gray-900/80 p-4 rounded-xl border border-gray-700 shadow-md">
                        <h3 className="text-pink-400 font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                            <span className="bg-pink-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                            Bối cảnh & Câu chuyện
                        </h3>
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                            {STORY_CONTEXTS.map(ctx => (
                                <button
                                    key={ctx.id}
                                    onClick={() => setSelectedContext(ctx)}
                                    className={`p-3 rounded-lg text-left border transition-all ${
                                        selectedContext?.id === ctx.id 
                                        ? 'bg-pink-600/30 border-pink-500 text-white ring-1 ring-pink-500' 
                                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-750 hover:border-gray-500'
                                    }`}
                                >
                                    <div className="font-bold text-xs">{ctx.label}</div>
                                    <div className="text-[10px] text-gray-400 mt-1 line-clamp-2 leading-tight">{ctx.description}</div>
                                </button>
                            ))}
                        </div>
                        <div className="mt-3">
                            <label className="text-xs text-gray-500 block mb-1">Chi tiết bổ sung (tùy chọn):</label>
                            <textarea 
                                value={customStory}
                                onChange={(e) => setCustomStory(e.target.value)}
                                placeholder="VD: Đang cầm ly trà sữa, tâm trạng vui vẻ, ánh nắng chiếu vào tóc..."
                                className="w-full bg-gray-800 p-2 rounded-lg text-xs border border-gray-700 focus:border-pink-500 focus:outline-none text-white resize-none h-16"
                            />
                        </div>
                    </div>

                    {/* Phase 2: Affiliate Products (Fashion Matrix) */}
                    <div className="bg-gray-900/80 p-4 rounded-xl border border-gray-700 shadow-md">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-blue-400 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                                <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                                Ma Trận Thời Trang
                            </h3>
                            <div className="text-[10px] text-gray-500 bg-gray-800 px-2 py-1 rounded flex items-center gap-1"><IconHanger /> Affiliate Items</div>
                        </div>
                        
                        <div className="space-y-3">
                            {FASHION_CATEGORIES.map((cat) => (
                                <div key={cat.key} className="flex items-center gap-2">
                                    <div className="w-20 text-[11px] font-semibold text-gray-400 text-right">{cat.label}</div>
                                    <div className="flex-1 flex gap-2">
                                        {/* Wardrobe Selector */}
                                        {wardrobe.length > 0 && (
                                            <div className="relative w-1/3">
                                                 <select 
                                                    className="w-full bg-gray-800 text-[10px] border border-gray-600 rounded px-2 py-2 text-white focus:border-blue-500 outline-none appearance-none"
                                                    value={selectedWardrobeIds[cat.key] || ''}
                                                    onChange={(e) => handleWardrobeSelect(cat.key, e.target.value)}
                                                >
                                                    <option value="">Tủ Đồ</option>
                                                    {wardrobe.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                                                    <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                                </div>
                                            </div>
                                        )}
                                        {/* Manual Input */}
                                        <input 
                                            type="text" 
                                            value={fashionDetails[cat.key]}
                                            onChange={(e) => handleFashionDetailChange(cat.key, e.target.value)}
                                            placeholder={`Mô tả chi tiết (VD: Red Gucci bag)`}
                                            className="flex-1 bg-black/40 border border-gray-600 rounded px-3 py-2 text-xs text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Phase 3: Visual Strategy */}
                    <div className="bg-gray-900/80 p-4 rounded-xl border border-gray-700 shadow-md flex-grow flex flex-col">
                        <h3 className="text-purple-400 font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                            <span className="bg-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                            Chiến Lược Hình Ảnh
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {PRODUCT_FOCUS_OPTIONS.map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setProductFocus(opt.id)}
                                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${
                                        productFocus === opt.id 
                                        ? 'bg-purple-600 border-purple-500 text-white shadow-md' 
                                        : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        {/* Action Area */}
                         <div className="mt-auto flex items-center gap-3 pt-3 border-t border-gray-700">
                            <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2 border border-gray-600">
                                <span className="text-xs text-gray-400 font-semibold">SL:</span>
                                <select value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} className="bg-transparent text-white text-sm font-bold outline-none cursor-pointer">
                                    <option value={1}>1</option>
                                    <option value={2}>2</option>
                                    <option value={4}>4</option>
                                </select>
                            </div>
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className="flex-1 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                            >
                                {isGenerating ? <LoadingSpinner /> : <IconCamera />}
                                {isGenerating ? 'Đang sản xuất...' : 'SHOOT CAMPAIGN'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar: Results & Gallery */}
                <div className="w-full lg:w-7/12 bg-black/40 rounded-xl border border-gray-800 p-6 flex flex-col h-full min-h-[500px]">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between border-b border-gray-800 pb-2">
                        <span>Kết Quả Campaign</span>
                        <span className="text-xs font-normal text-gray-400 bg-gray-900 px-3 py-1 rounded-full border border-gray-700">{generatedImages.length} ảnh được tạo</span>
                    </h3>
                    
                    <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                        {generatedImages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-60">
                                <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-4 border-2 border-dashed border-gray-600">
                                    <IconCamera />
                                </div>
                                <p className="text-center max-w-xs text-sm font-medium">Chưa có nội dung nào.<br/>Hãy thiết lập chiến dịch bên trái để bắt đầu tạo ra tài sản số.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-20">
                                {generatedImages.map(img => (
                                    <div 
                                        key={img.id} 
                                        className="relative aspect-[3/4] rounded-lg overflow-hidden group cursor-pointer border-2 border-transparent hover:border-pink-500 transition-all shadow-xl bg-gray-900"
                                        onClick={() => showPreview(img.url)}
                                    >
                                        <img src={img.url} alt="Generated" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                            <p className="text-[10px] text-gray-300 uppercase tracking-wider font-bold mb-1">Campaign Asset</p>
                                            <p className="text-xs text-white line-clamp-2 leading-snug">{img.prompt}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KocStudio;
