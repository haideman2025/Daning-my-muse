
import { GoogleGenAI, Modality, Type, Operation } from '@google/genai';
import { CharacterProfile, Gender, ArtStyle, Ethnicity, HairStyle, BodyType, GameRound, CategorizedClothing, VideoAsset, StoryboardScene } from '../types';
import { HAIR_COLORS, EYE_COLORS, PERSONALITY_OPTIONS, OCCUPATION_OPTIONS, RELATIONSHIP_OPTIONS, HOBBY_OPTIONS } from '../constants';

// Add comment: Always create a new GoogleGenAI instance right before making an API call for up-to-date key.
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY! });

const compressImageBase64 = (base64String: string, quality: number = 0.6, maxWidth: number = 800): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = `data:image/jpeg;base64,${base64String}`;
        img.onload = () => {
            let { width, height } = img;
            if (width > maxWidth) {
                height *= maxWidth / width;
                width = maxWidth;
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return resolve(base64String);
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve(compressedDataUrl.split(',')[1]);
        };
        img.onerror = () => resolve(base64String);
    });
};

const buildCharacterPrompt = (character: Partial<CharacterProfile>): string => {
    const basePrompt = `RAW photo, professional photograph, cinematic lighting, hyper-realistic, extremely detailed, lifelike, 8k, sharp focus, masterpiece. Avoid 3d render, anime, cartoon, illustration.`;

    if (character.publicDescription) {
        return `${basePrompt} A photograph of (${character.publicDescription}), ${character.customPhysicalDetails || ''}`;
    }

    let description = `The subject is a ${character.age}-year-old ${character.gender === Gender.Male ? 'man' : 'woman'}.`;
    if (character.ethnicity) description += ` Ethnicity: ${character.ethnicity}.`;
    if (character.skinTone) description += ` Skin tone: ${character.skinTone}.`;
    if (character.eyeColor) description += ` Eye color: ${character.eyeColor}.`;
    if (character.hairStyle) description += ` Hair style: ${character.hairStyle}, color: ${character.hairColor}.`;
    if (character.bodyType) description += ` Body type: ${character.bodyType}.`;
    
    return `${basePrompt} ${description}`;
};

export const generateStoryline = async (character: CharacterProfile): Promise<string> => {
    const ai = getAI();
    const prompt = `Create a short, intriguing, one-paragraph backstory (around 100 words) for: ${character.name}, ${character.personality}, ${character.occupation}. Use Vietnamese.`;
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
    });
    return response.text?.trim() || "";
};

interface GenerateImageOptions {
    numberOfImages?: number;
    makeupPrompt?: string; 
    outfitPrompt?: string;
    backgroundPrompt?: string;
    posePrompt?: string;
    cameraAnglePrompt?: string;
    referenceImage?: string; // base64
}

export const generateCharacterImage = async (character: CharacterProfile, options: GenerateImageOptions = {}): Promise<string[]> => {
    const ai = getAI();
    let { numberOfImages = 1, makeupPrompt, outfitPrompt, backgroundPrompt, posePrompt, cameraAnglePrompt, referenceImage } = options;
    
    // Fallback to character's reference image if not provided in options
    if (!referenceImage && character.referenceImage) {
        referenceImage = character.referenceImage;
    }

    const baseCharacterPrompt = buildCharacterPrompt(character);
    
    const constructPrompt = (angle: string) => {
        let finalPrompt = `${angle}, ${baseCharacterPrompt}`;
        if (makeupPrompt) finalPrompt += `, makeup: ${makeupPrompt}`;
        if (outfitPrompt) finalPrompt += `, wearing: ${outfitPrompt}`;
        if (backgroundPrompt) finalPrompt += `, background: ${backgroundPrompt}`;
        if (posePrompt) finalPrompt += `, pose: ${posePrompt}`;
        if (referenceImage) finalPrompt += `. Ensure the character looks identical to the provided reference image but with the specified attributes (gender: ${character.gender}, style: ${character.style}).`;
        return finalPrompt;
    };

    let requests = [];
    if (numberOfImages === 1) {
         requests.push(constructPrompt(cameraAnglePrompt || 'full body shot, eye-level'));
    } else {
        ['full body', 'medium shot', 'close up', 'low angle'].slice(0, numberOfImages).forEach(angle => {
             requests.push(constructPrompt(angle));
        });
    }

    const imagePromises = requests.map(async (prompt) => {
        const contents: any = { parts: [{ text: prompt }] };
        
        // If reference image is provided, add it to the request for image-to-image generation
        if (referenceImage) {
            // Ensure we strip the prefix if present
            const cleanBase64 = referenceImage.replace(/^data:image\/\w+;base64,/, '');
            contents.parts.push({
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: cleanBase64
                }
            });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image', // Banana
            contents: contents,
            config: { imageConfig: { aspectRatio: "3:4" } }
        });
        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) return part.inlineData.data;
            }
        }
        return null;
    });

    const rawImages = await Promise.all(imagePromises);
    const validImages = rawImages.filter(img => img !== null) as string[];
    return await Promise.all(validImages.map(b64 => compressImageBase64(b64)));
};

// Add comment: Generate a full costume set (collection) for a character.
export const generateCostumeSet = async (character: CharacterProfile, theme: string): Promise<{ name: string, items: string[], image: string }> => {
    const ai = getAI();
    
    // 1. Generate the outfit concept
    const conceptPrompt = `Design a unique costume set for ${character.name} with theme "${theme}". Return JSON: { name: "Creative Set Name", items: ["Item 1", "Item 2", "Item 3"], visualPrompt: "Detailed visual description of the outfit" }. Use Vietnamese for name and items.`;
    
    const conceptResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: conceptPrompt,
        config: { responseMimeType: "application/json" }
    });
    
    const concept = JSON.parse(conceptResponse.text?.replace(/```json\n?|\n?```/g, '').trim() || "{}");
    
    // 2. Generate the image of the character wearing it
    const imageB64 = await generateOutfitImage(character, concept.visualPrompt || theme);
    
    return {
        name: concept.name || theme,
        items: concept.items || [],
        image: `data:image/jpeg;base64,${imageB64}`
    };
};

export const generateAndDetailCharacterImage = async (base64Data: string, mimeType: string): Promise<Partial<CharacterProfile>> => {
    const ai = getAI();
    const compressedBase64 = await compressImageBase64(base64Data, 0.8, 1024);
    
    const prompt = `Clone this person for a digital twin. Provide a dense, specific "publicDescription" in English of their immutable facial features, jawline, eye shape, and nose tip. Also return JSON: gender, ethnicity (Asian, Black, White, Latina, Arab, Indian), age, hairStyle, bodyType, hairColor, eyeColor, name (Vietnamese), personality, occupation, relationship, hobby.`;
    
    const imagePart = { inlineData: { data: compressedBase64, mimeType: 'image/jpeg' } };
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: { parts: [{ text: prompt }, imagePart] },
        config: { responseMimeType: "application/json" }
    });
    
    const analysis = JSON.parse(response.text?.replace(/```json\n?|\n?```/g, '').trim() || "{}");
    return { ...analysis, referenceImage: `data:image/jpeg;base64,${compressedBase64}` };
};

export const chatWithCharacter = async (character: CharacterProfile, chatHistory: any[], message: string): Promise<{ textResponse: string, imagePrompt?: string }> => {
    const ai = getAI();
    const systemInstruction = `You are ${character.name}, ${character.personality}. Speak Vietnamese. If asked for an image, add GENERATE_IMAGE:[detailed prompt].`;
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: message,
        config: { systemInstruction }
    });
    let text = response.text || "";
    let imagePrompt: string | undefined = undefined;
    const match = text.match(/GENERATE_IMAGE:\[(.*?)\]/);
    if (match) {
        imagePrompt = match[1];
        text = text.replace(/GENERATE_IMAGE:\[(.*?)\]/, '').trim();
    }
    return { textResponse: text, imagePrompt };
};

export const extractOutfitFromImage = async (base64Data: string, mimeType: string): Promise<{ name: string; masterPrompt: string }> => {
    const ai = getAI();
    const prompt = "Describe the outfit in this image. Return JSON: {name: 'Vietnamese name', masterPrompt: 'English detailed description'}";
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: { parts: [{ text: prompt }, { inlineData: { data: base64Data, mimeType: 'image/jpeg' } }] },
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text?.replace(/```json\n?|\n?```/g, '').trim() || "{}");
};

// Add comment: Generate character details using gemini-3-flash-preview.
export const generateCharacterDetails = async (character: Partial<CharacterProfile>): Promise<Partial<CharacterProfile>> => {
    const ai = getAI();
    const prompt = `Based on this partial character profile: ${JSON.stringify(character)}, generate interesting and fitting details for the missing fields. Return JSON: { personality, occupation, relationship, hobby, greeting, scenario, additionalPersonality, extraDetails }. Use Vietnamese for text values.`;
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text?.replace(/```json\n?|\n?```/g, '').trim() || "{}");
};

// Add comment: Generate scene suggestions using gemini-3-flash-preview.
export const generateSceneSuggestions = async (character: CharacterProfile): Promise<string[]> => {
    const ai = getAI();
    const prompt = `Based on this character: ${character.name}, suggest 5 short scene descriptions for a photoshoot. Return JSON array of strings in Vietnamese.`;
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text?.replace(/```json\n?|\n?```/g, '').trim() || []);
};

// Add comment: Generate scene concepts using gemini-3-flash-preview.
export const generateSceneConcept = async (character: CharacterProfile): Promise<any[]> => {
    const ai = getAI();
    const prompt = `Suggest 3 unique photoshoot concepts for ${character.name}. Return JSON array of objects: { makeup, outfit, background }. All values in English.`;
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text?.replace(/```json\n?|\n?```/g, '').trim() || []);
};

// Add comment: Start and poll video generation using veo-3.1-fast-generate-preview.
export const generateDanceVideo = async (
    character: CharacterProfile,
    imageB64: string,
    dancePrompt: string,
    onSuccess: (result: Partial<VideoAsset>) => void,
    onError: (error: Error) => void
) => {
    try {
        const ai = getAI();
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: `${dancePrompt}. The subject is a person described as: ${character.publicDescription || character.name}.`,
            image: {
                imageBytes: imageB64,
                mimeType: 'image/jpeg',
            },
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '9:16'
            }
        });

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await response.blob();
        const videoUrl = URL.createObjectURL(blob);

        onSuccess({
            url: videoUrl,
            downloadUri: downloadLink,
            videoObject: operation.response?.generatedVideos?.[0]?.video,
            extensionCount: 0
        });
    } catch (e: any) {
        onError(e);
    }
};

// Add comment: Simple poll helper for video operations.
export const pollVideoOperation = async (operation: any): Promise<any> => {
    const ai = getAI();
    return await ai.operations.getVideosOperation({ operation });
};

// Add comment: Extend an existing video using veo-3.1-generate-preview.
export const extendDanceVideo = async (
    character: CharacterProfile,
    videoAsset: VideoAsset,
    extensionPrompt: string,
    onSuccess: (result: Partial<VideoAsset>) => void,
    onError: (error: Error) => void
) => {
    try {
        const ai = getAI();
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-generate-preview',
            prompt: extensionPrompt,
            video: videoAsset.videoObject,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '9:16'
            }
        });

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await response.blob();
        const videoUrl = URL.createObjectURL(blob);

        onSuccess({
            url: videoUrl,
            downloadUri: downloadLink,
            videoObject: operation.response?.generatedVideos?.[0]?.video,
            extensionCount: (videoAsset.extensionCount || 0) + 1
        });
    } catch (e: any) {
        onError(e);
    }
};

// Add comment: Generate in-game chat messages in character voice.
export const generateInGameChatMessage = async (character: CharacterProfile, event: string): Promise<string> => {
    const ai = getAI();
    const prompt = `You are ${character.name}, ${character.personality}. We are playing a game. Event: ${event}. Say something short and fitting in Vietnamese.`;
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
    });
    return response.text?.trim() || "";
};

// Add comment: Generate TTS audio for level completion.
export const generateLevelCompleteVoice = async (text: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Say cheerfully: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
      },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
};

// Add comment: Generate outfit ideas using gemini-3-flash-preview.
export const generateOutfitIdeas = async (character: CharacterProfile): Promise<any[]> => {
    const ai = getAI();
    const prompt = `Suggest 4 specific outfit ideas for ${character.name}. Return JSON array of objects: { name: 'Vietnamese name', prompt: 'detailed English visual prompt' }.`;
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text?.replace(/```json\n?|\n?```/g, '').trim() || []);
};

// Add comment: Generate 10 random outfit prompts.
export const generateRandomOutfitPrompts = async (character: CharacterProfile): Promise<any[]> => {
    const ai = getAI();
    const prompt = `Suggest 10 unique, diverse, and creative outfit ideas for ${character.name}. Ranging from casual, formal, fantasy, to sci-fi. Return JSON array of objects: { name: 'Vietnamese name', prompt: 'detailed English visual prompt' }.`;
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text?.replace(/```json\n?|\n?```/g, '').trim() || []);
};

// Add comment: Generate specific outfit image using gemini-2.5-flash-image.
export const generateOutfitImage = async (character: CharacterProfile, outfitPrompt: string): Promise<string> => {
    const ai = getAI();
    const basePrompt = buildCharacterPrompt(character);
    const finalPrompt = `${basePrompt}, wearing ${outfitPrompt}, high-end fashion photography.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: finalPrompt }] }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) return part.inlineData.data;
    }
    throw new Error("Failed to generate outfit image");
};

// Add comment: Analyze image to identify clothing items.
export const identifyClothingItems = async (base64Data: string): Promise<CategorizedClothing> => {
    const ai = getAI();
    const prompt = `Identify clothing items in this image. Categorize them into: accessories, outerwear, main_clothing. Return JSON: { accessories: string[], outerwear: string[], main_clothing: string[] }. Use Vietnamese for names.`;
    const imagePart = { inlineData: { data: base64Data, mimeType: 'image/jpeg' } };
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [{ text: prompt }, imagePart] },
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text?.replace(/```json\n?|\n?```/g, '').trim() || { accessories: [], outerwear: [], main_clothing: [] });
};

// Add comment: Edit image to remove a specific item using gemini-2.5-flash-image.
export const generateImageWithItemRemoved = async (character: CharacterProfile, base64: string, item: string): Promise<string> => {
    const ai = getAI();
    const prompt = `Edit this image of ${character.name}. Remove the ${item} and realistically depict what is underneath or replace it with appropriate skin/underwear if needed for a mature context. Return the edited image.`;
    const imagePart = { inlineData: { data: base64, mimeType: 'image/jpeg' } };
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [imagePart, { text: prompt }] }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) return part.inlineData.data;
    }
    throw new Error("Failed to edit image");
};

// Add comment: Generate a background for the game using gemini-2.5-flash-image.
export const generateGameBackground = async (character: CharacterProfile, level: number): Promise<string> => {
    const ai = getAI();
    const prompt = `Hyper-realistic wide shot of a futuristic cyberpunk neon nightclub interior for game level ${level}. Cinematic lighting, 8k.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) return part.inlineData.data;
    }
    throw new Error("Failed to generate background");
};

// Add comment: Generate storyboard concept using gemini-3-flash-preview.
export const generateStoryboardConcept = async (character: CharacterProfile, idea: string, category: string): Promise<any[]> => {
    const ai = getAI();
    const prompt = `Develop a 5-scene storyboard for a ${category} project featuring ${character.name}. Idea: ${idea}. Return JSON array of objects: { sceneNumber, description, cameraAngle, setting, action, outfit }. Use Vietnamese for text values.`;
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text?.replace(/```json\n?|\n?```/g, '').trim() || []);
};

// Add comment: Generate image for a specific storyboard scene using gemini-2.5-flash-image.
export const generateStoryboardSceneImage = async (character: CharacterProfile, scene: any): Promise<string> => {
    const ai = getAI();
    const basePrompt = buildCharacterPrompt(character);
    const finalPrompt = `${basePrompt}, Scene ${scene.sceneNumber}: ${scene.description}. Setting: ${scene.setting}. Angle: ${scene.cameraAngle}. Action: ${scene.action}. Cinematic lighting, 8k.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: finalPrompt }] }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) return part.inlineData.data;
    }
    throw new Error("Failed to generate scene image");
};
