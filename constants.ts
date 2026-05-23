import React from 'react';
// FIX: Removed Pose, Background, and OutfitSuggestion from import as they are not defined types in types.ts
import { ArtStyle, Gender, Ethnicity, HairStyle, BodyType, BreastSize, ButtSize } from './types';

interface Option<T> {
  value: T;
  label: string;
  imageUrl?: string; 
  iconComponent?: React.FC<{className?: string}>;
  isPremium?: boolean;
}

// --- SVG Icons for Body Shapes ---
// A collection of custom, stylized icons to represent body attributes elegantly.
// FIX: Converted all icon components from JSX to React.createElement calls to resolve compatibility issues with the .ts file extension.
const IconSlim: React.FC<{className?: string}> = ({className}) => (React.createElement('svg', {className, viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:"1.5"}, React.createElement('path', {d:"M12 3V21M9 3H15M9.5 21H14.5"})));
const IconAthletic: React.FC<{className?: string}> = ({className}) => (React.createElement('svg', {className, viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:"1.5"}, React.createElement('path', {d:"M12 3L9 9H15L12 3ZM9 9L5 21H9.5L12 15L14.5 21H19L15 9H9Z"})));
const IconVoluptuous: React.FC<{className?: string}> = ({className}) => (React.createElement('svg', {className, viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:"1.5"}, React.createElement('path', {d:"M9 3C7 5 7 7 9 9S11 11 9 13s-2 4 0 6M15 3c2 2 2 4 0 6s-2 2 0 4s2 4 0 6"})));
const IconCurvy: React.FC<{className?: string}> = ({className}) => (React.createElement('svg', {className, viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:"1.5"}, React.createElement('path', {d:"M10 20.5c-2.5-1-4.5-3.5-4.5-6.5s2-6 4.5-7.5M14 3.5c2.5 1.5 4.5 4 4.5 7.5s-2 6.5-4.5 7.5"})));
const IconMuscular: React.FC<{className?: string}> = ({className}) => (React.createElement('svg', {className, viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:"1.5"}, React.createElement('path', {d:"M4 12h16M4 12l4-4m-4 4l4 4m12-4l-4-4m4 4l-4 4"})));
const IconFlat: React.FC<{className?: string}> = ({className}) => (React.createElement('svg', {className, viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:"1.5"}, React.createElement('path', {d:"M6 10h12"})));
const IconSmall: React.FC<{className?: string}> = ({className}) => (React.createElement('svg', {className, viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:"1.5"}, React.createElement('path', {d:"M8 12 A2 2 0 0 1 12 12 A2 2 0 0 1 16 12"})));
const IconMedium: React.FC<{className?: string}> = ({className}) => (React.createElement('svg', {className, viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:"1.5"}, React.createElement('path', {d:"M7 13 A4 4 0 0 1 12 11 A4 4 0 0 1 17 13"})));
const IconLarge: React.FC<{className?: string}> = ({className}) => (React.createElement('svg', {className, viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:"1.5"}, React.createElement('path', {d:"M6 14 A6 6 0 0 1 12 10 A6 6 0 0 1 18 14"})));
const IconXL: React.FC<{className?: string}> = ({className}) => (React.createElement('svg', {className, viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:"1.5"}, React.createElement('path', {d:"M5 15 A8 8 0 0 1 12 9 A8 8 0 0 1 19 15"})));
const IconSkinnyButt: React.FC<{className?: string}> = ({className}) => (React.createElement('svg', {className, viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:"1.5"}, React.createElement('path', {d:"M9 14h6"})));
const IconAthleticButt: React.FC<{className?: string}> = ({className}) => (React.createElement('svg', {className, viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:"1.5"}, React.createElement('path', {d:"M8 16 C12 13, 12 13, 16 16"})));
const IconMediumButt: React.FC<{className?: string}> = ({className}) => (React.createElement('svg', {className, viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:"1.5"}, React.createElement('path', {d:"M7 17 C12 12, 12 12, 17 17"})));
const IconLargeButt: React.FC<{className?: string}> = ({className}) => (React.createElement('svg', {className, viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:"1.5"}, React.createElement('path', {d:"M6 18 C12 11, 12 11, 18 18"})));
const IconCustom: React.FC<{className?: string}> = ({className}) => (React.createElement('svg', {className, viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:"1.5"}, React.createElement('path', {d:"M12 4v16m-8-8h16"})));


const placeholderImage = (path: string) => `https://storage.googleapis.com/maker-suite-project-files-prod/ai-apps/my-muse-ai/placeholders/${path}`;

export const GENDER_OPTIONS: Option<Gender>[] = [
  { value: Gender.Female, label: 'Nữ', imageUrl: placeholderImage('gender_female.webp') },
  { value: Gender.Male, label: 'Nam', imageUrl: placeholderImage('gender_male.webp') },
];

export const ART_STYLE_OPTIONS: Option<ArtStyle>[] = [
  { value: ArtStyle.Realistic, label: 'Thực tế', imageUrl: placeholderImage('style_realistic.webp') },
];

export const ETHNICITY_OPTIONS: Option<Ethnicity>[] = [
  { value: Ethnicity.Asian, label: 'Châu Á', imageUrl: placeholderImage('ethnicity_asian.webp') },
  { value: Ethnicity.Black, label: 'Da đen', imageUrl: placeholderImage('ethnicity_black.webp') },
  { value: Ethnicity.White, label: 'Da trắng', imageUrl: placeholderImage('ethnicity_white.webp') },
  { value: Ethnicity.Latina, label: 'Latin', imageUrl: placeholderImage('ethnicity_latina.webp') },
  { value: Ethnicity.Arab, label: 'Ả Rập', imageUrl: placeholderImage('ethnicity_arab.webp') },
  { value: Ethnicity.Indian, label: 'Ấn Độ', imageUrl: placeholderImage('ethnicity_indian.webp') },
  { value: Ethnicity.Custom, label: 'Tùy chỉnh', iconComponent: IconCustom, isPremium: true },
];

export const SKIN_TONES = ['#FFDFC4', '#E0A378', '#C68642', '#A1662F', '#8D5524', '#693D1C'];
export const EYE_COLORS = ['#222222', '#634e34', '#d82121', '#ffc107', '#28a745', '#007bff', '#9c27b0', '#ec407a', '#f8f9fa', '#6c757d'];
export const HAIR_COLORS = ['#3B342F', '#8D4A27', '#D1202D', '#F4C431', '#F5F2E8', '#428AF4', '#9B58B5', '#E84393', '#BDC3C7', '#6A737D'];

export const HAIR_STYLE_OPTIONS: Option<HairStyle>[] = [
  { value: HairStyle.Long, label: 'Tóc dài', imageUrl: placeholderImage('hair_long.webp') },
  { value: HairStyle.Short, label: 'Tóc ngắn', imageUrl: placeholderImage('hair_short.webp') },
  { value: HairStyle.Ponytail, label: 'Tóc đuôi ngựa', imageUrl: placeholderImage('hair_ponytail.webp') },
  { value: HairStyle.Braided, label: 'Tóc tết', imageUrl: placeholderImage('hair_braided.webp') },
  { value: HairStyle.Bangs, label: 'Tóc mái', imageUrl: placeholderImage('hair_bangs.webp') },
  { value: HairStyle.Bun, label: 'Tóc búi', imageUrl: placeholderImage('hair_bun.webp') },
  { value: HairStyle.Buns, label: 'Tóc búi hai bên', imageUrl: placeholderImage('hair_buns.webp') },
  { value: HairStyle.Wavy, label: 'Tóc gợn sóng', imageUrl: placeholderImage('hair_wavy.webp') },
  { value: HairStyle.Pixie, label: 'Tóc pixie', imageUrl: placeholderImage('hair_pixie.webp') },
  { value: HairStyle.Dreadlocks, label: 'Dreadlocks', imageUrl: placeholderImage('hair_dreadlocks.webp') },
  { value: HairStyle.Afro, label: 'Tóc Afro', imageUrl: placeholderImage('hair_afro.webp') },
  { value: HairStyle.Mullet, label: 'Tóc Mullet', imageUrl: placeholderImage('hair_mullet.webp') },
  { value: HairStyle.WolfCut, label: 'Wolf Cut', imageUrl: placeholderImage('hair_wolfcut.webp') },
  { value: HairStyle.Undercut, label: 'Undercut', imageUrl: placeholderImage('hair_undercut.webp') },
  { value: HairStyle.Custom, label: 'Tùy chỉnh', iconComponent: IconCustom, isPremium: true },
];

export const BODY_TYPE_OPTIONS: Option<BodyType>[] = [
  { value: BodyType.Slim, label: 'Mảnh mai', iconComponent: IconSlim },
  { value: BodyType.Athletic, label: 'Khỏe khoắn', iconComponent: IconAthletic },
  { value: BodyType.Voluptuous, label: 'Đầy đặn', iconComponent: IconVoluptuous },
  { value: BodyType.Curvy, label: 'Cong', iconComponent: IconCurvy },
  { value: BodyType.Muscular, label: 'Cơ bắp', iconComponent: IconMuscular },
];

export const BREAST_SIZE_OPTIONS: Option<BreastSize>[] = [
  { value: BreastSize.Flat, label: 'Phẳng', iconComponent: IconFlat },
  { value: BreastSize.Small, label: 'Nhỏ', iconComponent: IconSmall },
  { value: BreastSize.Medium, label: 'Vừa', iconComponent: IconMedium },
  { value: BreastSize.Large, label: 'Lớn', iconComponent: IconLarge },
  { value: BreastSize.XL, label: 'Rất lớn', iconComponent: IconXL },
];

export const BUTT_SIZE_OPTIONS: Option<ButtSize>[] = [
  { value: ButtSize.Small, label: 'Nhỏ', iconComponent: IconSmall },
  { value: ButtSize.Skinny, label: 'Gầy', iconComponent: IconSkinnyButt },
  { value: ButtSize.Athletic, label: 'Săn chắc', iconComponent: IconAthleticButt },
  { value: ButtSize.Medium, label: 'Vừa', iconComponent: IconMediumButt },
  { value: ButtSize.Large, label: 'Lớn', iconComponent: IconLargeButt },
];

// New options for Step 5 simplification
export const PERSONALITY_OPTIONS: Option<string>[] = [
    { value: 'Vui vẻ & hoạt bát', label: 'Vui vẻ & hoạt bát' },
    { value: 'Bí ẩn & trầm tính', label: 'Bí ẩn & trầm tính' },
    { value: 'Tự tin & lôi cuốn', label: 'Tự tin & lôi cuốn' },
    { value: 'Nhút nhát & ngọt ngào', label: 'Nhút nhát & ngọt ngào' },
    { value: 'Nổi loạn & cá tính', label: 'Nổi loạn & cá tính' },
    { value: 'Trí thức & sâu sắc', label: 'Trí thức & sâu sắc' },
    { value: 'Lạnh lùng & xa cách', label: 'Lạnh lùng & xa cách' },
    { value: 'Năng động & thích phiêu lưu', label: 'Năng động & phiêu lưu' },
    { value: 'Nghiêm túc & trách nhiệm', label: 'Nghiêm túc & trách nhiệm' },
    { value: 'Lãng mạn & mơ mộng', label: 'Lãng mạn & mơ mộng' },
    { value: 'Hài hước & dí dỏm', label: 'Hài hước & dí dỏm' },
    { value: 'Khiêm tốn & giản dị', label: 'Khiêm tốn & giản dị' },
];

export const OCCUPATION_OPTIONS: Option<string>[] = [
    { value: 'Nghệ sĩ', label: 'Nghệ sĩ' },
    { value: 'Nhà khoa học', label: 'Nhà khoa học' },
    { value: 'Thám tử', label: 'Thám tử' },
    { value: 'Chiến binh', label: 'Chiến binh' },
    { value: 'Bác sĩ', label: 'Bác sĩ' },
    { value: 'Doanh nhân', label: 'Doanh nhân' },
    { value: 'Sinh viên', label: 'Sinh viên' },
    { value: 'Người mẫu', label: 'Người mẫu' },
    { value: 'Giáo viên', label: 'Giáo viên' },
    { value: 'Đầu bếp', label: 'Đầu bếp' },
    { value: 'Nhạc sĩ', label: 'Nhạc sĩ' },
    { value: 'Phi hành gia', label: 'Phi hành gia' },
    { value: 'Điệp viên', label: 'Điệp viên' },
    { value: 'Nhà thám hiểm', label: 'Nhà thám hiểm' },
    { value: 'Lập trình viên', label: 'Lập trình viên' },
    { value: 'Y tá', label: 'Y tá' },
];

export const RELATIONSHIP_OPTIONS: Option<string>[] = [
    { value: 'Độc thân', label: 'Độc thân' },
    { value: 'Đang hẹn hò', label: 'Đang hẹn hò' },
    { value: 'Mối quan hệ phức tạp', label: 'Mối quan hệ phức tạp' },
    { value: 'Đã kết hôn', label: 'Đã kết hôn' },
    { value: 'Bạn bè có lợi ích', label: 'Bạn bè có lợi ích' },
    { value: 'Mối quan hệ mở', label: 'Mối quan hệ mở' },
    { value: 'Vừa chia tay', label: 'Vừa chia tay' },
];

export const HOBBY_OPTIONS: Option<string>[] = [
    { value: 'Đọc sách', label: 'Đọc sách' },
    { value: 'Chơi game', label: 'Chơi game' },
    { value: 'Du lịch', label: 'Du lịch' },
    { value: 'Nấu ăn', label: 'Nấu ăn' },
    { value: 'Vẽ', label: 'Vẽ' },
    { value: 'Chơi thể thao', label: 'Chơi thể thao' },
    { value: 'Hội họa', label: 'Hội họa' },
    { value: 'Viết lách', label: 'Viết lách' },
    { value: 'Khiêu vũ', label: 'Khiêu vũ' },
    { value: 'Làm vườn', label: 'Làm vườn' },
    { value: 'Yoga & Thiền', label: 'Yoga & Thiền' },
    { value: 'Chơi nhạc cụ', label: 'Chơi nhạc cụ' },
];


// --- STUDIO LIBRARIES ---
type StudioOption = { name: string; prompt: string };

export const FEMALE_POSES: StudioOption[] = [
    { name: 'Nhìn qua vai', prompt: 'Close-up shot, looking over her shoulder, mysterious smile, soft lighting.' },
    { name: 'Tựa cửa sổ', prompt: 'Medium shot, leaning against a window frame, thoughtful expression, natural light.' },
    { name: 'Dựa vào tường', prompt: 'Full body shot, leaning casually against a brick wall, confident pose.' },
    { name: 'Vui đùa trên bãi biển', prompt: 'Action shot, running along the shoreline, laughing, golden hour light.' },
    { name: 'Uống cà phê', prompt: 'Waist-up shot, sitting at a cafe table, holding a coffee cup, relaxed vibe.' },
    { name: 'Đọc sách', prompt: 'Sitting on a comfy armchair, engrossed in a book, cozy indoor lighting.' },
    { name: 'Tạo dáng quyền lực', prompt: 'Full body shot, hands on hips, strong posture, looking directly at the camera.' },
    { name: 'Đi dạo trong thành phố', prompt: 'Walking on a busy city street, candid shot, motion blur in background.' },
    { name: 'Nằm trên cỏ', prompt: 'Lying on her back in a field of flowers, looking up at the sky, dreamy expression.' },
    { name: 'Chân dung cận mặt', prompt: 'Extreme close-up, focusing on her eyes, captivating and intense gaze.' },
    { name: 'Khiêu vũ', prompt: 'Full body shot, captured mid-dance, flowing dress, dynamic and energetic.' },
    { name: 'Tư thế yoga', prompt: 'Practicing a yoga pose in a serene setting, calm and focused.' },
    { name: 'Chỉnh lại tóc', prompt: 'Candid shot, brushing her hair away from her face with her hand.' },
    { name: 'Ngồi trên bậc thang', prompt: 'Sitting on outdoor steps, relaxed and casual pose, looking off-camera.' },
    { name: 'Selfie trong gương', prompt: 'Taking a selfie in a stylish mirror, playful and modern.' },
    { name: 'Thì thầm', prompt: 'Close-up, hand near her mouth as if sharing a secret, intriguing.' },
    { name: 'Tựa lan can', prompt: 'Leaning on a balcony railing, overlooking a scenic view.' },
    { name: 'Vươn vai buổi sáng', prompt: 'Stretching languidly in bed, morning light streaming in.' },
    { name: 'Cười hết cỡ', prompt: 'Candid shot of a genuine, joyful laugh, eyes sparkling.' },
    { name: 'Tạo dáng high fashion', prompt: 'Avant-garde pose, architectural and artistic, for a high-fashion look.' },
];

export const MALE_POSES: StudioOption[] = [
    { name: 'Tựa tường suy tư', prompt: 'Full body shot, leaning against a concrete wall, hands in pockets, thoughtful gaze.' },
    { name: 'Chỉnh lại cà vạt', prompt: 'Medium shot, adjusting his tie, looking sharp and focused, in a business setting.' },
    { name: 'Sải bước tự tin', prompt: 'Action shot, walking towards the camera with confidence, city street background.' },
    { name: 'Ngồi trên ghế bành', prompt: 'Sitting in a leather armchair, one leg crossed over the other, looking powerful.' },
    { name: 'Nhìn xa xăm', prompt: 'Close-up profile shot, looking into the distance, serious and determined expression.' },
    { name: 'Lái xe', prompt: 'Behind the wheel of a classic car, one hand on the steering wheel, cool demeanor.' },
    { name: 'Khoanh tay', prompt: 'Waist-up shot, arms crossed, confident and assertive stance.' },
    { name: 'Tập luyện', prompt: 'Action shot in a gym, lifting weights, showing strength and determination.' },
    { name: 'Uống rượu whiskey', prompt: 'Sitting at a dimly lit bar, swirling a glass of whiskey, sophisticated.' },
    { name: 'Cười sảng khoái', prompt: 'Candid medium shot, laughing genuinely, showing a charismatic personality.' },
    { name: 'Chân dung đen trắng', prompt: 'Gritty black and white portrait, high contrast, focusing on facial features.' },
    { name: 'Đi bộ đường dài', prompt: 'In hiking gear, looking at a map with a mountainous background, adventurous.' },
    { name: 'Chơi guitar', prompt: 'Sitting on a stool, passionately playing an acoustic guitar.' },
    { name: 'Tựa vào xe', prompt: 'Leaning against a vintage motorcycle, exuding a rebellious attitude.' },
    { name: 'Nhìn thẳng camera', prompt: 'Intense close-up, making direct eye contact with the camera, powerful.' },
    { name: 'Sửa soạn trước gương', prompt: 'Getting ready in front of a mirror, buttoning his shirt.' },
    { name: 'Đội mũ trùm đầu', prompt: 'Wearing a hoodie, hood up, in an urban alley, mysterious and cool.' },
    { name: 'Nhảy lên không', prompt: 'Jumping in the air with an energetic and joyful expression.' },
    { name: 'Đọc báo', prompt: 'Sitting at a cafe, reading a newspaper, classic and intellectual.' },
    { name: 'Vuốt ngược tóc', prompt: 'Running a hand through his hair, casual and charming.' },
];

export const BACKGROUNDS: StudioOption[] = [
    { name: 'Căn hộ áp mái', prompt: 'a luxurious penthouse apartment with floor-to-ceiling windows overlooking the city at night.' },
    { name: 'Quán cà phê ấm cúng', prompt: 'a cozy, rustic coffee shop with warm lighting and the smell of fresh coffee.' },
    { name: 'Bãi biển hoàng hôn', prompt: 'a serene beach at sunset, with golden light and soft waves.' },
    { name: 'Khu rừng huyền bí', prompt: 'an enchanted forest with ancient trees and shafts of light filtering through the canopy.' },
    { name: 'Đường phố Neon', prompt: 'a bustling city street at night, filled with vibrant neon signs and reflections on wet pavement, Blade Runner style.' },
    { name: 'Thư viện cổ', prompt: 'a grand, old library with towering shelves of books and a quiet, scholarly atmosphere.' },
    { name: 'Trạm vũ trụ', prompt: 'the interior of a futuristic space station, with panoramic views of Earth and stars.' },
    { name: 'Phòng khiêu vũ', prompt: 'an opulent ballroom with crystal chandeliers and a polished dance floor.' },
    { name: 'Ngõ hẻm Graffiti', prompt: 'a gritty urban alleyway covered in colorful graffiti art.' },
    { name: 'Đỉnh núi', prompt: 'the summit of a majestic mountain, with breathtaking panoramic views.' },
    { name: 'Xưởng nghệ thuật', prompt: 'a messy but inspiring artist\'s studio, filled with canvases, paints, and sculptures.' },
    { name: 'Bể bơi sang trọng', prompt: 'a luxurious infinity pool at a tropical resort.' },
    { name: 'Casino hào nhoáng', prompt: 'a glamorous casino floor with poker tables and slot machines, James Bond style.' },
    { name: 'Phòng ngủ tối giản', prompt: 'a minimalist, modern bedroom with clean lines and soft, neutral colors.' },
    { name: 'Sân khấu ca nhạc', prompt: 'on a concert stage, with bright spotlights and a cheering crowd in the background.' },
    { name: 'Vườn Nhật Bản', prompt: 'a tranquil Japanese garden with a koi pond, cherry blossoms, and stone lanterns.' },
    { name: 'Boong tàu', prompt: 'the deck of a sailboat at sea, with open water and a clear blue sky.' },
    { name: 'Nhà ga xe lửa', prompt: 'a vintage train station platform, with steam and a sense of romantic departure.' },
    { name: 'Lâu đài cổ tích', prompt: 'a magical, fairytale castle with towering spires.' },
    { name: 'Phòng thí nghiệm', prompt: 'a high-tech science laboratory with glowing beakers and futuristic equipment.' },
];

export const FEMALE_OUTFITS: StudioOption[] = [
    { name: 'Đầm dạ hội', prompt: 'an elegant, floor-length evening gown, sparkling with sequins.' },
    { name: 'Đồ công sở', prompt: 'a sharp, tailored pantsuit with a silk blouse, professional and chic.' },
    { name: 'Streetwear', prompt: 'baggy jeans, a crop top, an oversized jacket, and chunky sneakers.' },
    { name: 'Bikini', prompt: 'a stylish bikini on a sunny beach.' },
    { name: 'Đồ ngủ', prompt: 'a delicate silk and lace lingerie set.' },
    { name: 'Trang phục thể thao', prompt: 'matching yoga pants and a sports bra, in a gym setting.' },
    { name: 'Váy hè', prompt: 'a light, flowy sundress with a floral pattern.' },
    { name: 'Áo cưới', prompt: 'a beautiful, intricate white wedding dress.' },
    { name: 'Đồ da', prompt: 'a black leather jacket, leather pants, and combat boots, edgy and rebellious.' },
    { name: 'Trang phục Bohemian', prompt: 'a bohemian-style maxi skirt, a crochet top, and layered jewelry.' },
    { name: 'Áo len oversize', prompt: 'a cozy, oversized knit sweater and leggings, perfect for autumn.' },
    { name: 'Đầm cocktail', prompt: 'a sophisticated little black dress, perfect for a cocktail party.' },
    { name: 'Đồ vintage', prompt: 'a 1950s style swing dress with polka dots.' },
    { name: 'Trang phục phiêu lưu', prompt: 'rugged cargo pants, a tank top, and hiking boots, ready for adventure.' },
    { name: 'Kimono', prompt: 'a beautiful, traditional Japanese kimono with intricate patterns.' },
    { name: 'Pijama', prompt: 'cute and comfortable pajamas with a fun print.' },
];

export const MALE_OUTFITS: StudioOption[] = [
    { name: 'Bộ suit lịch lãm', prompt: 'a perfectly tailored three-piece suit, looking sharp and sophisticated.' },
    { name: 'Đồ Thường ngày', prompt: 'a comfortable yet stylish outfit with a high-quality t-shirt, slim-fit jeans, and white sneakers.' },
    { name: 'Streetwear', prompt: 'an oversized hoodie, cargo pants, and high-top sneakers, with a beanie or cap.' },
    { name: 'Đồ bơi', prompt: 'stylish swim trunks at a poolside or beach setting.' },
    { name: 'Trang phục thể thao', prompt: 'performance athletic wear, like a tank top and shorts, in a gym or on a track.' },
    { name: 'Áo khoác da', prompt: 'a classic black leather jacket over a simple t-shirt with dark jeans, exuding a cool, rebellious vibe.' },
    { name: 'Trang phục phiêu lưu', prompt: 'rugged and practical outdoor gear, including a durable jacket, hiking boots, and a backpack.' },
    { name: 'Tuxedo', prompt: 'a classic black tuxedo, looking elegant and ready for a formal event, James Bond style.' },
    { name: 'Đồng phục phi công', prompt: 'a classic pilot uniform with a leather bomber jacket and aviator sunglasses.' },
    { name: 'Trang phục Biker', prompt: 'a rugged biker vest over a t-shirt, ripped jeans, and heavy boots.' },
    { name: 'Phong cách Bohemian', prompt: 'a loose-fitting linen shirt, comfortable trousers, and sandals.' },
    { name: 'Áo len dệt kim', prompt: 'a cozy, chunky knit turtleneck sweater, perfect for a winter scene.' },
    { name: 'Polo và Quần short', prompt: 'a preppy look with a classic polo shirt and chino shorts.' },
    { name: 'Đồ vintage', prompt: 'a 1970s-style outfit with a patterned shirt, flared trousers, and platform shoes.' },
    { name: 'Đồng phục bác sĩ', prompt: 'a professional doctor\'s white coat or scrubs.' },
    { name: 'Kimono/Yukata', prompt: 'a traditional Japanese yukata, suitable for a festival or a serene garden setting.' },
    { name: 'Pijama', prompt: 'comfortable and stylish silk pajamas in a relaxed home setting.' },
    { name: 'Áo khoác dài', prompt: 'a long, stylish trench coat or overcoat for a dramatic, cinematic look in the city.' }
];

interface CategorizedStudioOptions {
  category: string;
  items: StudioOption[];
}

export const JAPANESE_DANCE_MOVES: CategorizedStudioOptions[] = [
    {
        category: 'Vũ điệu Lễ hội & Truyền thống',
        items: [
            { name: 'Múa Bon Odori', prompt: 'performing a traditional Bon Odori dance at a summer festival, wearing a yukata, surrounded by paper lanterns' },
            { name: 'Nhảy Yosakoi', prompt: 'a vibrant and energetic Yosakoi dance, holding naruko clappers, with a colorful team costume' },
            { name: 'Múa Awa Odori', prompt: 'performing the Awa Odori "fool\'s dance", with characteristic raised arms and legs, in a street procession' },
            { name: 'Múa Soran Bushi', prompt: 'a powerful Soran Bushi dance, mimicking fishermen hauling nets, with strong, low stances' },
        ]
    },
    {
        category: 'Vũ điệu Sân khấu & Nghệ thuật',
        items: [
            { name: 'Múa Nihon Buyo', prompt: 'an elegant and graceful Nihon Buyo performance, using a fan, wearing a formal kimono on a stage' },
            { name: 'Múa Kabuki', prompt: 'a dramatic Kabuki-inspired dance, with exaggerated movements and mie poses, wearing theatrical makeup' },
            { name: 'Múa Kagura', prompt: 'a sacred Kagura dance, a theatrical performance dedicated to the gods, wearing an ornate mask' },
        ]
    },
    {
        category: 'Vũ điệu Hiện đại & J-Pop',
        items: [
            { name: 'Nhảy Para Para', prompt: 'a synchronized Para Para dance, with intricate arm and hand movements, popular in the 90s Eurobeat scene' },
            { name: 'Nhảy Wotagei/Otagei', prompt: 'performing a Wotagei/Otagei cheer dance with glow sticks at an idol concert, full of energy' },
            { name: 'Vũ điệu Tiktok Trend', prompt: 'a viral Japanese TikTok dance challenge, fun and trendy' },
        ]
    }
];

export const COSPLAY_OUTFITS: CategorizedStudioOptions[] = [
    {
        category: 'Anh hùng Shonen',
        items: [
            { name: 'Naruto Uzumaki', prompt: 'cosplaying as Naruto Uzumaki from Naruto, in his orange and black jumpsuit, with a forehead protector' },
            { name: 'Monkey D. Luffy', prompt: 'cosplaying as Monkey D. Luffy from One Piece, wearing his red vest, blue shorts, and straw hat' },
            { name: 'Gojo Satoru', prompt: 'cosplaying as Gojo Satoru from Jujutsu Kaisen, with his black blindfold and dark high-collar uniform' },
            { name: 'Son Goku', prompt: 'cosplaying as Son Goku from Dragon Ball Z, in his orange and blue gi with the "Go" kanji' },
            { name: 'Levi Ackerman', prompt: 'cosplaying as Levi Ackerman from Attack on Titan, wearing the Survey Corps uniform with 3D maneuver gear' },
        ]
    },
    {
        category: 'Thiếu nữ Phép thuật & Shojo',
        items: [
            { name: 'Sailor Moon', prompt: 'cosplaying as Sailor Moon, in her classic white, blue, and red sailor fuku with a golden tiara' },
            { name: 'Sakura Kinomoto', prompt: 'cosplaying as Sakura Kinomoto from Cardcaptor Sakura, in one of her cute, frilly battle costumes with the Sealing Wand' },
            { name: 'Madoka Kaname', prompt: 'cosplaying as Madoka Kaname from Puella Magi Madoka Magica, in her pink magical girl dress with bows' },
        ]
    },
    {
        category: 'Huyền thoại Game',
        items: [
            { name: '2B (Nier: Automata)', prompt: 'cosplaying as 2B from Nier: Automata, in her elegant black gothic dress, with a blindfold and holding the Virtuous Contract katana' },
            { name: 'Tifa Lockhart', prompt: 'cosplaying as Tifa Lockhart from Final Fantasy VII, in her white crop top, black miniskirt, and red boots' },
            { name: 'Zelda (BOTW)', prompt: 'cosplaying as Princess Zelda from Breath of the Wild, in her royal blue and gold champion\'s tunic' },
            { name: 'Raiden Shogun', prompt: 'cosplaying as the Raiden Shogun from Genshin Impact, in her ornate purple kimono with a large bow and long braided hair' },
        ]
    },
    {
        category: 'Kinh điển & Ghibli',
        items: [
            { name: 'Rei Ayanami', prompt: 'cosplaying as Rei Ayanami from Neon Genesis Evangelion, in her white plugsuit' },
            { name: 'Kiki (Kiki\'s Delivery)', prompt: 'cosplaying as Kiki from Kiki\'s Delivery Service, wearing her simple dark purple dress with a large red bow in her hair' },
            { name: 'Howl Pendragon', prompt: 'cosplaying as Howl from Howl\'s Moving Castle, in his flamboyant pink and grey diamond-patterned coat' },
        ]
    },
    {
        category: 'Vocaloid & Thần tượng',
        items: [
            { name: 'Hatsune Miku', prompt: 'cosplaying as Hatsune Miku, with her iconic long turquoise twintails and futuristic schoolgirl-style outfit' },
            { name: 'Idol (Love Live!)', prompt: 'cosplaying as an idol from Love Live!, in a bright and sparkling stage costume' },
        ]
    }
];
