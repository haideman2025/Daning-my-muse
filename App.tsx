
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import CharacterForm from './components/CharacterForm';
import MainMenu from './components/MainMenu';
import Library from './components/Library';
import StoryStudio from './components/StoryStudio';
import CostumeStudio from './components/CostumeStudio';
import { CharacterProfile, GalleryImage } from './types';
import { generateStoryline, generateCharacterImage } from './services/geminiService';
import LoadingSpinner from './components/LoadingSpinner';
import AgeGate from './components/AgeGate';
import Auth from './components/Auth';
import { PreviewContext } from './components/PreviewContext';
import ImagePreviewModal from './components/ImagePreviewModal';
import CreationChoiceModal from './components/CreationChoiceModal';

export type View = 'menu' | 'create' | 'library' | 'studio' | 'costume';

// Updated limit to 100 as requested. Note: LocalStorage might fill up quickly.
const MAX_IMAGES_PER_CHARACTER = 100;

const App: React.FC = () => {
  const [ageConfirmed, setAgeConfirmed] = useState(() => sessionStorage.getItem('ageConfirmed') === 'true');
  const [currentUser, setCurrentUser] = useState<string | null>(() => localStorage.getItem('my-muse-ai-currentUser'));
  const [view, setView] = useState<View>('menu');
  const [characters, setCharacters] = useState<CharacterProfile[]>([]);
  const [editingCharacter, setEditingCharacter] = useState<CharacterProfile | null>(null);
  const [studioCharacter, setStudioCharacter] = useState<CharacterProfile | null>(null);
  const [costumeCharacter, setCostumeCharacter] = useState<CharacterProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  
  // New State for Creation Flow
  const [isCreationModalOpen, setIsCreationModalOpen] = useState(false);

  useEffect(() => {
    // Load characters for the logged-in user with Safe Parsing
    if (currentUser) {
      try {
          const savedCharacters = localStorage.getItem(`my-muse-ai-characters-${currentUser}`);
          if (savedCharacters) {
            let parsedCharacters: any[] = JSON.parse(savedCharacters);
            
            if (!Array.isArray(parsedCharacters)) {
                console.warn("Saved data is not an array, resetting.");
                setCharacters([]);
                return;
            }

            // Migration logic for old data structure
            const migratedCharacters = parsedCharacters.map(char => {
                if (char.generatedImages && !char.singleImages) {
                    char.singleImages = char.generatedImages.map((url: string): GalleryImage => ({
                        id: uuidv4(),
                        url: url,
                        createdAt: Date.now() - Math.random() * 100000, // Stagger timestamps
                        prompt: 'Migrated image'
                    })).sort((a: GalleryImage, b: GalleryImage) => b.createdAt - a.createdAt);
                    delete char.generatedImages;
                }
                if (!char.videos) char.videos = [];
                if (!char.storyboards) char.storyboards = [];
                
                // Enforce limit on load as well to clean up old heavy data
                if (char.singleImages && char.singleImages.length > MAX_IMAGES_PER_CHARACTER) {
                    char.singleImages = char.singleImages.slice(0, MAX_IMAGES_PER_CHARACTER);
                }

                return char as CharacterProfile;
            });
            setCharacters(migratedCharacters);
          } else {
            setCharacters([]); 
          }
      } catch (e) {
          console.error("Failed to parse characters from localStorage. Data might be corrupted.", e);
          // Fallback: Don't crash, just start empty. User might lose data but app works.
          setCharacters([]); 
      }
    }
  }, [currentUser]);

  const saveToLocalStorageSafe = (key: string, data: any) => {
      try {
          const stringified = JSON.stringify(data);
          localStorage.setItem(key, stringified);
          return true;
      } catch (e: any) {
          console.error("LocalStorage Save Error:", e);
           if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
             alert("⚠️ Bộ nhớ trình duyệt đã đầy! Không thể lưu thêm dữ liệu. Vui lòng xóa bớt nhân vật hoặc ảnh cũ.");
        }
        return false;
      }
  };

  const saveCharacter = async (character: CharacterProfile) => {
    if (!currentUser) return; 

    setIsSaving(true);
    let updatedCharacters;
    const existingIndex = characters.findIndex(c => c.id === character.id);

    if (existingIndex === -1 && characters.length >= 10) {
      alert("Mỗi tài khoản có thể tạo tối đa 10 người mẫu. Vui lòng xóa bớt trước khi tạo mới.");
      setIsSaving(false);
      return;
    }

    let characterToSave = { ...character };

    // Optimization: Don't store the reference image preview blob if we have extracted features
    // Keep it only if user wants to see it, but it's heavy. 
    // Ideally, we rely on 'publicDescription'.

    if (!characterToSave.storyline) {
        try {
            const storyline = await generateStoryline(characterToSave);
            characterToSave.storyline = storyline;
        } catch (error) {
            console.error("Failed to generate storyline:", error);
        }
    }

    if ((characterToSave.singleImages || []).length === 0) {
        try {
            const imageBase64Array = await generateCharacterImage(characterToSave, { numberOfImages: 1 });
            if (imageBase64Array.length > 0) {
                const newImage: GalleryImage = {
                    id: uuidv4(),
                    url: `data:image/jpeg;base64,${imageBase64Array[0]}`,
                    createdAt: Date.now(),
                    prompt: 'Initial character image'
                };
                characterToSave.singleImages = [newImage];
            }
        } catch (error) {
            console.error("Failed to generate initial image:", error);
        }
    }

    // Strict Enforcement of Image Limit
    if ((characterToSave.singleImages || []).length > MAX_IMAGES_PER_CHARACTER) {
        characterToSave.singleImages = (characterToSave.singleImages || [])
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, MAX_IMAGES_PER_CHARACTER);
    }

    if (existingIndex > -1) {
      updatedCharacters = [...characters];
      updatedCharacters[existingIndex] = characterToSave;
    } else {
      updatedCharacters = [...characters, characterToSave];
    }
    
    setCharacters(updatedCharacters);
    saveToLocalStorageSafe(`my-muse-ai-characters-${currentUser}`, updatedCharacters);
    
    setIsSaving(false);
    setView('library');
  };

  const handleEditCharacter = (character: CharacterProfile) => {
    setEditingCharacter(character);
    setView('create');
  };
  
  const handleEnterStudio = (character: CharacterProfile) => {
    setStudioCharacter(character);
    setView('studio');
  };

  const handleEnterCostumeStudio = (character: CharacterProfile) => {
      setCostumeCharacter(character);
      setView('costume');
  };

  const handleUpdateFromStudio = (updatedCharacter: CharacterProfile) => {
     if (!currentUser) return;
     
     let characterToUpdate = { ...updatedCharacter };
     let singleImages = characterToUpdate.singleImages || [];

     // Strict Enforcement
     if (singleImages.length > MAX_IMAGES_PER_CHARACTER) {
        const removedCount = singleImages.length - MAX_IMAGES_PER_CHARACTER;
        characterToUpdate.singleImages = singleImages
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, MAX_IMAGES_PER_CHARACTER);
        console.warn(`Auto-removed ${removedCount} old images to save space.`);
     }

     const updatedCharacters = characters.map(c => 
        c.id === characterToUpdate.id ? characterToUpdate : c
     );
     
     setCharacters(updatedCharacters);
     setStudioCharacter(characterToUpdate); 
     
     const success = saveToLocalStorageSafe(`my-muse-ai-characters-${currentUser}`, updatedCharacters);
     if (!success) {
         // If save failed, maybe revert state or warn user they are out of sync?
         // For now, the alert in saveToLocalStorageSafe is sufficient.
     }
  };

  const handleDeleteCharacter = (characterId: string) => {
    if (!currentUser) return;
    const updatedCharacters = characters.filter(c => c.id !== characterId);
    setCharacters(updatedCharacters);
    saveToLocalStorageSafe(`my-muse-ai-characters-${currentUser}`, updatedCharacters);
  };

  const startNewCharacter = () => {
    if (characters.length >= 10) {
        alert("Mỗi tài khoản có thể tạo tối đa 10 người mẫu. Vui lòng xóa bớt trước khi tạo mới.");
        return;
    }
    setIsCreationModalOpen(true);
  };

  const handleCreationModeSelect = (mode: 'new' | 'template' | 'clone', templateId?: string) => {
      setIsCreationModalOpen(false);
      
      if (mode === 'new') {
          setEditingCharacter(null);
          setView('create');
      } else if (mode === 'template') {
          setEditingCharacter({ isTemplate: true } as any); // Partial init, form handles rest
          setView('create');
      } else if (mode === 'clone' && templateId) {
          const template = characters.find(c => c.id === templateId);
          if (template) {
              // Create a clone base
              const clone: Partial<CharacterProfile> = {
                  ...template,
                  id: uuidv4(), // New ID
                  name: `${template.name} (Clone)`,
                  isTemplate: false,
                  baseId: template.id,
                  singleImages: [], // Clear images
                  storyline: '', // Clear story
                  // Keep reference image!
                  referenceImage: template.referenceImage || template.singleImages?.[0]?.url
              };
              setEditingCharacter(clone as CharacterProfile);
              setView('create');
          }
      }
  };

  const handleAgeConfirm = () => {
    sessionStorage.setItem('ageConfirmed', 'true');
    setAgeConfirmed(true);
  };

  const handleLogin = (username: string) => {
    localStorage.setItem('my-muse-ai-currentUser', username);
    setCurrentUser(username);
  };

  const handleLogout = () => {
    localStorage.removeItem('my-muse-ai-currentUser');
    setCurrentUser(null);
    setCharacters([]);
    setView('menu');
  };

  const showPreview = (url: string) => setPreviewImageUrl(url);
  const hidePreview = () => setPreviewImageUrl(null);

  const renderContent = () => {
    if (!ageConfirmed) {
      return <AgeGate onConfirm={handleAgeConfirm} />;
    }

    if (!currentUser) {
      return <Auth onLogin={handleLogin} />;
    }

    if (isSaving) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center">
          <LoadingSpinner />
          <p className="mt-4 font-semibold text-pink-400">Đang hoàn tất...</p>
          <p className="text-sm text-gray-400">Đang nén ảnh và lưu dữ liệu an toàn.</p>
        </div>
      );
    }

    switch (view) {
      case 'create':
        return <CharacterForm onSave={saveCharacter} existingCharacter={editingCharacter} onBackToMenu={() => setView('menu')} />;
      case 'library':
        return <Library characters={characters} onNavigate={setView} onEdit={handleEditCharacter} onDelete={handleDeleteCharacter} onEnterStudio={handleEnterStudio} onEnterCostumeStudio={handleEnterCostumeStudio} onLogout={handleLogout} currentUser={currentUser} />;
      case 'studio':
        return studioCharacter ? <StoryStudio character={studioCharacter} allCharacters={characters} onUpdate={handleUpdateFromStudio} onBack={() => setView('library')} /> : null;
      case 'costume':
        return costumeCharacter ? <CostumeStudio character={costumeCharacter} onSave={handleUpdateFromStudio} onBack={() => setView('library')} /> : null;
      case 'menu':
      default:
        return <MainMenu onNavigate={startNewCharacter} hasCharacters={characters.length > 0} onLogout={handleLogout} onViewLibrary={() => setView('library')}/>;
    }
  };

  return (
    <PreviewContext.Provider value={{ showPreview }}>
      <div className="min-h-screen">
        <main className="container mx-auto p-4 py-8 md:p-12">
          {renderContent()}
        </main>
        {previewImageUrl && <ImagePreviewModal imageUrl={previewImageUrl} onClose={hidePreview} />}
        
        <CreationChoiceModal 
            isOpen={isCreationModalOpen}
            onClose={() => setIsCreationModalOpen(false)}
            onSelectMode={handleCreationModeSelect}
            templates={characters.filter(c => c.isTemplate)}
        />
      </div>
    </PreviewContext.Provider>
  );
};

export default App;
