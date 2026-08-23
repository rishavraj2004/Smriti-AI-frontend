import { SupportedLanguage } from '../types/auth';
import { COLORS } from '../theme/theme';

export interface LocalizedMemoryCard {
  id: number;
  symbol: string;
  name: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface LocalizedAttentionItem {
  id?: string;
  symbol: string;
  name: string;
  color?: string;
}

export interface LocalizedAttentionRound {
  roundNumber: number;
  target: LocalizedAttentionItem;
  grid: LocalizedAttentionItem[];
}

export interface LocalizedMathQuestion {
  id: number;
  prompt: string;
  itemsDisplay?: string | null;
  correctAnswer: number;
  options: number[];
  explanation?: string;
}

export interface LocalizedObjectOption {
  label: string;
  emoji: string;
  name: string;
}

export interface LocalizedObjectQuestion {
  id: number;
  prompt: string;
  correctAnswer: string;
  options: LocalizedObjectOption[];
  hint: string;
}

export interface LocalizedRoutineStep {
  id: string;
  order: number;
  title: string;
  emoji: string;
  timeSlot: string;
}

export interface LocalizedWordPrompt {
  id: number;
  prefix: string;
  correctWord: string;
  options: string[];
  hint?: string;
}

// ----------------------------------------------------
// 1. MEMORY MATCH CARDS DATA
// ----------------------------------------------------
const MEMORY_CARDS_MAP: Record<SupportedLanguage, { symbol: string; name: string }[]> = {
  en: [
    { symbol: '🌱', name: 'Assam Tea' },
    { symbol: '🦏', name: 'Kaziranga Rhino' },
    { symbol: '🥁', name: 'Bihu Dhol' },
    { symbol: '🦜', name: 'Hornbill Bird' },
    { symbol: '🎋', name: 'Bamboo Craft' },
    { symbol: '🌊', name: 'Loktak Lake' },
  ],
  hi: [
    { symbol: '🌱', name: 'असम चाय पत्ती' },
    { symbol: '🦏', name: 'काजीरंगा गैंडा' },
    { symbol: '🥁', name: 'बिहू ढोल' },
    { symbol: '🦜', name: 'हॉर्नबिल पक्षी' },
    { symbol: '🎋', name: 'बांस की टोकरी' },
    { symbol: '🌊', name: 'लोकटक झील' },
  ],
  as: [
    { symbol: '🌱', name: 'অসমৰ চাহ পাত' },
    { symbol: '🦏', name: 'কাজিৰঙাৰ গঁড়' },
    { symbol: '🥁', name: 'বিহুৰ ঢোল' },
    { symbol: '🦜', name: 'ধনেশ পক্ষী' },
    { symbol: '🎋', name: 'বাঁহৰ জাপি' },
    { symbol: '🌊', name: 'লোকটক হ্ৰদ' },
  ],
  bn: [
    { symbol: '🌱', name: 'আসামের চা পাতা' },
    { symbol: '🦏', name: 'কাজিরাঙ্গার গণ্ডার' },
    { symbol: '🥁', name: 'বিহু ঢোল' },
    { symbol: '🦜', name: 'ধনেশ পাখি' },
    { symbol: '🎋', name: 'বাঁশের কারুকাজ' },
    { symbol: '🌊', name: 'লোকটাক হ্রদ' },
  ],
  mn: [
    { symbol: '🌱', name: 'চা মনা' },
    { symbol: '🦏', name: 'কাজিৰঙাগী সমুক' },
    { symbol: '🥁', name: 'বিহু ঢোল' },
    { symbol: '🦜', name: 'উচেক উচাও' },
    { symbol: '🎋', name: 'ৱাগী শান্নপোৎ' },
    { symbol: '🌊', name: 'লোকতাক পাত' },
  ],
  mz: [
    { symbol: '🌱', name: 'Thingpui Hnah' },
    { symbol: '🦏', name: 'Kaziranga Sazuk' },
    { symbol: '🥁', name: 'Bihu Khuang' },
    { symbol: '🦜', name: 'Vaphai Sava' },
    { symbol: '🎋', name: 'Mau Hmanrua' },
    { symbol: '🌊', name: 'Loktak Dil' },
  ],
};

export const getMemoryCardsData = (lang: SupportedLanguage, targetPairs: number = 4): LocalizedMemoryCard[] => {
  const list = MEMORY_CARDS_MAP[lang] || MEMORY_CARDS_MAP.en;
  const selected = list.slice(0, targetPairs);
  const deck = [...selected, ...selected]
    .sort(() => Math.random() - 0.5)
    .map((item, index) => ({
      id: index,
      symbol: item.symbol,
      name: item.name,
      isFlipped: false,
      isMatched: false,
    }));
  return deck;
};

// ----------------------------------------------------
// 2. ATTENTION GAME ITEMS
// ----------------------------------------------------
const ATTENTION_ITEMS_MAP: Record<SupportedLanguage, LocalizedAttentionItem[]> = {
  en: [
    { symbol: '🌱', name: 'Assam Tea Leaf', color: COLORS.teaGreen },
    { symbol: '🦏', name: 'Kaziranga Rhino', color: COLORS.rhinoGrey },
    { symbol: '🥁', name: 'Bihu Dhol', color: COLORS.secondary },
    { symbol: '🎋', name: 'Bamboo Craft', color: COLORS.bambooYellow },
    { symbol: '🌸', name: 'Rhodo Flower', color: COLORS.flowerPink },
    { symbol: '🌧️', name: 'Cherrapunji Rain', color: COLORS.skyBlue },
  ],
  hi: [
    { symbol: '🌱', name: 'असम चाय पत्ती', color: COLORS.teaGreen },
    { symbol: '🦏', name: 'काजीरंगा गैंडा', color: COLORS.rhinoGrey },
    { symbol: '🥁', name: 'पारंपरिक बिहू ढोल', color: COLORS.secondary },
    { symbol: '🎋', name: 'बांस का हस्तशिल्प', color: COLORS.bambooYellow },
    { symbol: '🌸', name: 'रोडोडेंड्रॉन फूल', color: COLORS.flowerPink },
    { symbol: '🌧️', name: 'चेरापूंजी वर्षा', color: COLORS.skyBlue },
  ],
  as: [
    { symbol: '🌱', name: 'অসমীয়া চাহ পাত', color: COLORS.teaGreen },
    { symbol: '🦏', name: 'কাজিৰঙাৰ এশিঙীয়া গঁড়', color: COLORS.rhinoGrey },
    { symbol: '🥁', name: 'বিহুৰ বাদ্য ঢোল', color: COLORS.secondary },
    { symbol: '🎋', name: 'বাঁহ-বেতৰ শিল্প', color: COLORS.bambooYellow },
    { symbol: '🌸', name: 'কপৌ ফুল', color: COLORS.flowerPink },
    { symbol: '🌧️', name: 'চেৰাপুঞ্জীৰ বৰষুণ', color: COLORS.skyBlue },
  ],
  bn: [
    { symbol: '🌱', name: 'আসামের তাজা চা পাতা', color: COLORS.teaGreen },
    { symbol: '🦏', name: 'কাজিরাঙ্গার একশৃঙ্গ গণ্ডার', color: COLORS.rhinoGrey },
    { symbol: '🥁', name: 'ঐতিহ্যবাহী বিহু ঢোল', color: COLORS.secondary },
    { symbol: '🎋', name: 'বাঁশের তৈরি পাত্র', color: COLORS.bambooYellow },
    { symbol: '🌸', name: 'রডোডেনড্রন ফুল', color: COLORS.flowerPink },
    { symbol: '🌧️', name: 'চেরাপুঞ্জির বৃষ্টি', color: COLORS.skyBlue },
  ],
  mn: [
    { symbol: '🌱', name: 'চা মনা', color: COLORS.teaGreen },
    { symbol: '🦏', name: 'কাজিৰঙাগী সমুক', color: COLORS.rhinoGrey },
    { symbol: '🥁', name: 'বিহুগী ঢোল', color: COLORS.secondary },
    { symbol: '🎋', name: 'ৱাগী শান্নপোৎ', color: COLORS.bambooYellow },
    { symbol: '🌸', name: 'শিরুই লিলি লৈ', color: COLORS.flowerPink },
    { symbol: '🌧️', name: 'নাহাক্কী নোং', color: COLORS.skyBlue },
  ],
  mz: [
    { symbol: '🌱', name: 'Thingpui Hnah Hring', color: COLORS.teaGreen },
    { symbol: '🦏', name: 'Kaziranga Sazuk', color: COLORS.rhinoGrey },
    { symbol: '🥁', name: 'Bihu Khuang', color: COLORS.secondary },
    { symbol: '🎋', name: 'Mau Hmanrua', color: COLORS.bambooYellow },
    { symbol: '🌸', name: 'Chhawkhlei Pangpar', color: COLORS.flowerPink },
    { symbol: '🌧️', name: 'Ruah Sur', color: COLORS.skyBlue },
  ],
};

export const getAttentionRoundsData = (lang: SupportedLanguage, totalRounds: number = 5): LocalizedAttentionRound[] => {
  const items = ATTENTION_ITEMS_MAP[lang] || ATTENTION_ITEMS_MAP.en;
  const generatedRounds: LocalizedAttentionRound[] = [];
  for (let r = 0; r < totalRounds; r++) {
    const target = items[Math.floor(Math.random() * items.length)];
    const distractors = items
      .filter((i) => i.name !== target.name)
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);
    const grid = [target, ...distractors].sort(() => Math.random() - 0.5);
    generatedRounds.push({
      roundNumber: r + 1,
      target,
      grid,
    });
  }
  return generatedRounds;
};

// ----------------------------------------------------
// 3. GENTLE MATH QUESTIONS
// ----------------------------------------------------
const MATH_QUESTIONS_MAP: Record<SupportedLanguage, LocalizedMathQuestion[]> = {
  en: [
    {
      id: 1,
      prompt: 'Count how many fresh Assam tea leaves are displayed below:',
      itemsDisplay: '🌱  🌱  🌱  🌱',
      correctAnswer: 4,
      options: [3, 4, 5, 6],
    },
    {
      id: 2,
      prompt: 'You take 2 morning pills and 1 evening pill. How many total pills in a day?',
      correctAnswer: 3,
      options: [2, 3, 4, 5],
    },
    {
      id: 3,
      prompt: 'If you have 5 fresh starfruits and share 2 with your neighbor, how many do you have left?',
      correctAnswer: 3,
      options: [2, 3, 4, 1],
    },
    {
      id: 4,
      prompt: 'Count how many drumsticks are used for 2 Bihu Dhols (2 per dhol):',
      itemsDisplay: '🥢 🥢   🥢 🥢',
      correctAnswer: 4,
      options: [2, 4, 6, 8],
    },
  ],
  hi: [
    {
      id: 1,
      prompt: 'गिनें कि नीचे कितनी असम चाय की पत्तियां दिखाई दे रही हैं:',
      itemsDisplay: '🌱  🌱  🌱  🌱',
      correctAnswer: 4,
      options: [3, 4, 5, 6],
    },
    {
      id: 2,
      prompt: 'आप सुबह 2 गोलियां और शाम को 1 गोली लेते हैं। दिन में कुल कितनी गोलियां हुईं?',
      correctAnswer: 3,
      options: [2, 3, 4, 5],
    },
    {
      id: 3,
      prompt: 'यदि आपके पास 5 ताजे कमरख (स्टारफ्रूट) हैं और 2 पड़ोसी को देते हैं, तो कितने बचे?',
      correctAnswer: 3,
      options: [2, 3, 4, 1],
    },
    {
      id: 4,
      prompt: '2 बिहू ढोल बजाने के लिए कुल कितनी डंडियां (प्रति ढोल 2) दिख रही हैं:',
      itemsDisplay: '🥢 🥢   🥢 🥢',
      correctAnswer: 4,
      options: [2, 4, 6, 8],
    },
  ],
  as: [
    {
      id: 1,
      prompt: 'তলত কেইখিলা সেউজীয়া চাহ পাত দেখা গৈছে গণনা কৰক:',
      itemsDisplay: '🌱  🌱  🌱  🌱',
      correctAnswer: 4,
      options: [3, 4, 5, 6],
    },
    {
      id: 2,
      prompt: 'আপুনি ৰাতিপুৱা ২টা আৰু সন্ধিয়া ১টা ঔষধ খায়। দিনটোত মুঠ কেইটা ঔষধ হʼল?',
      correctAnswer: 3,
      options: [2, 3, 4, 5],
    },
    {
      id: 3,
      prompt: 'যদি আপোনাৰ ওচৰত ৫টা কৰ্দ্দৈ আছে আৰু ২টা ওচৰ-চুবুৰীয়াক দিয়ে, তেন্তে কেইটা বাকী থাকিব?',
      correctAnswer: 3,
      options: [2, 3, 4, 1],
    },
    {
      id: 4,
      prompt: '২টা বিহু ঢোলৰ বাবে মুঠ কেইডাল ঢোলৰ মাৰি দেখা গৈছে (প্ৰতিটোত ২ডাল):',
      itemsDisplay: '🥢 🥢   🥢 🥢',
      correctAnswer: 4,
      options: [2, 4, 6, 8],
    },
  ],
  bn: [
    {
      id: 1,
      prompt: 'নিচে প্রদর্শিত তাজা চা পাতার সংখ্যা গণনা করুন:',
      itemsDisplay: '🌱  🌱  🌱  🌱',
      correctAnswer: 4,
      options: [3, 4, 5, 6],
    },
    {
      id: 2,
      prompt: 'আপনি সকালে ২টি এবং সন্ধ্যায় ১টি ওষুধ খান। সারাদিনে মোট কয়টি ওষুধ হয়?',
      correctAnswer: 3,
      options: [2, 3, 4, 5],
    },
    {
      id: 3,
      prompt: 'আপনার কাছে ৫টি কামরাঙা ছিল এবং ২টি প্রতিবেশীকে দিলেন, তাহলে কয়টি বাকি রইল?',
      correctAnswer: 3,
      options: [2, 3, 4, 1],
    },
    {
      id: 4,
      prompt: '২টি বিহু ঢোলের জন্য ব্যবহৃত কাঠির সংখ্যা গণনা করুন:',
      itemsDisplay: '🥢 🥢   🥢 🥢',
      correctAnswer: 4,
      options: [2, 4, 6, 8],
    },
  ],
  mn: [
    {
      id: 1,
      prompt: 'মখাদা লৈরিবা চা মনাকো মশীং থীবিয়ু:',
      itemsDisplay: '🌱  🌱  🌱  🌱',
      correctAnswer: 4,
      options: [3, 4, 5, 6],
    },
    {
      id: 2,
      prompt: 'অদোম্না অয়ুক্তা হিদাক ২ অমসুং নুমিদাংদা ১ চাবা মতমদা অপুনবা হিদাক কয়া ওইবগে?',
      correctAnswer: 3,
      options: [2, 3, 4, 5],
    },
    {
      id: 3,
      prompt: 'হৈথোই ৫ লৈরগা ২ য়ুম্লোন্নবদা পীরবদি কয়া লেমহৌবগে?',
      correctAnswer: 3,
      options: [2, 3, 4, 1],
    },
    {
      id: 4,
      prompt: 'ঢোল ২গীদমক শিজিন্নবা ঢোল চেকশিং মশীং থীবিয়ু:',
      itemsDisplay: '🥢 🥢   🥢 🥢',
      correctAnswer: 4,
      options: [2, 4, 6, 8],
    },
  ],
  mz: [
    {
      id: 1,
      prompt: 'A hnuaia thingpui hnah zat hi chhiar rawh le:',
      itemsDisplay: '🌱  🌱  🌱  🌱',
      correctAnswer: 4,
      options: [3, 4, 5, 6],
    },
    {
      id: 2,
      prompt: 'Zingah damdawi 2 leh tlaiah 1 i ei a. Ni khatah damdawi engzat nge i ei?',
      correctAnswer: 3,
      options: [2, 3, 4, 5],
    },
    {
      id: 3,
      prompt: 'Thei 5 nei la, 2 thenawmte pe ta la, engzat nge la awm ang?',
      correctAnswer: 3,
      options: [2, 3, 4, 1],
    },
    {
      id: 4,
      prompt: 'Khuang 2 vuakna tiang zawng zawng chhiar rawh:',
      itemsDisplay: '🥢 🥢   🥢 🥢',
      correctAnswer: 4,
      options: [2, 4, 6, 8],
    },
  ],
};

export const getMathQuestionsData = (lang: SupportedLanguage): LocalizedMathQuestion[] => {
  return MATH_QUESTIONS_MAP[lang] || MATH_QUESTIONS_MAP.en;
};

// ----------------------------------------------------
// 4. OBJECT RECOGNITION QUIZ
// ----------------------------------------------------
const OBJECT_QUESTIONS_MAP: Record<SupportedLanguage, LocalizedObjectQuestion[]> = {
  en: [
    {
      id: 1,
      prompt: 'Which item is the famous traditional Assam Bamboo Basket (Japi / Khang)?',
      correctAnswer: 'Bamboo Basket',
      options: [
        { label: 'A', emoji: '🎋', name: 'Bamboo Basket' },
        { label: 'B', emoji: '🏺', name: 'Clay Pot' },
        { label: 'C', emoji: '🪑', name: 'Wooden Chair' },
      ],
      hint: 'Look for the woven green and yellow bamboo material!',
    },
    {
      id: 2,
      prompt: 'Which fruit is the famous North Eastern Kordoi / Starfruit?',
      correctAnswer: 'Starfruit',
      options: [
        { label: 'A', emoji: '🍎', name: 'Red Apple' },
        { label: 'B', emoji: '⭐', name: 'Starfruit' },
        { label: 'C', emoji: '🍌', name: 'Banana' },
      ],
      hint: 'It has star-shaped ridged slices!',
    },
    {
      id: 3,
      prompt: 'Which musical instrument is played during Bihu celebrations?',
      correctAnswer: 'Bihu Dhol',
      options: [
        { label: 'A', emoji: '🥁', name: 'Bihu Dhol' },
        { label: 'B', emoji: '🎸', name: 'Guitar' },
        { label: 'C', emoji: '🎺', name: 'Trumpet' },
      ],
      hint: 'It is a double-sided wooden drum played with sticks!',
    },
  ],
  hi: [
    {
      id: 1,
      prompt: 'पूर्वोत्तर की प्रसिद्ध पारंपरिक बांस की टोकरी (जापी / खांग) कौन सी है?',
      correctAnswer: 'बांस की टोकरी',
      options: [
        { label: 'A', emoji: '🎋', name: 'बांस की टोकरी' },
        { label: 'B', emoji: '🏺', name: 'मिट्टी का बर्तन' },
        { label: 'C', emoji: '🪑', name: 'लकड़ी की कुर्सी' },
      ],
      hint: 'बुने हुए पीले और हरे बांस के पैटर्न को देखें!',
    },
    {
      id: 2,
      prompt: 'पूर्वोत्तर का प्रसिद्ध फल कमरख (स्टारफ्रूट) कौन सा है?',
      correctAnswer: 'कमरख (स्टारफ्रूट)',
      options: [
        { label: 'A', emoji: '🍎', name: 'लाल सेब' },
        { label: 'B', emoji: '⭐', name: 'कमरख (स्टारफ्रूट)' },
        { label: 'C', emoji: '🍌', name: 'केला' },
      ],
      hint: 'काटने पर इसका आकार सितारे जैसा होता है!',
    },
    {
      id: 3,
      prompt: 'बिहू उत्सव के दौरान कौन सा पारंपरिक वाद्य यंत्र बजाया जाता है?',
      correctAnswer: 'बिहू ढोल',
      options: [
        { label: 'A', emoji: '🥁', name: 'बिहू ढोल' },
        { label: 'B', emoji: '🎸', name: 'गिटार' },
        { label: 'C', emoji: '🎺', name: 'तुरही' },
      ],
      hint: 'यह डंडियों से बजाया जाने वाला दो तरफा लकड़ी का ढोल है!',
    },
  ],
  as: [
    {
      id: 1,
      prompt: 'অসমৰ প্ৰসিদ্ধ পৰম্পৰাগত বাঁহ-বেতৰ জাপি বা খৰাহী কোনটো?',
      correctAnswer: 'বাঁহৰ জাপি',
      options: [
        { label: 'A', emoji: '🎋', name: 'বাঁহৰ জাপি' },
        { label: 'B', emoji: '🏺', name: 'মাটিৰ কলহ' },
        { label: 'C', emoji: '🪑', name: 'কাঠৰ মেজ' },
      ],
      hint: 'বাঁহ আৰু বেতেৰে সুন্দৰকৈ গঁথা বস্তুটো মন কৰক!',
    },
    {
      id: 2,
      prompt: 'উত্তৰ-পূবৰ প্ৰসিদ্ধ সোৱাদযুক্ত টেঙা ফল কৰ্দ্দৈ কোনটো?',
      correctAnswer: 'কৰ্দ্দৈ টেঙা',
      options: [
        { label: 'A', emoji: '🍎', name: 'ৰঙা আপেল' },
        { label: 'B', emoji: '⭐', name: 'কৰ্দ্দৈ টেঙা' },
        { label: 'C', emoji: '🍌', name: 'পকা কল' },
      ],
      hint: 'কাটিলে তৰাৰ দৰে আকৃতি দেখা পোৱা যায়!',
    },
    {
      id: 3,
      prompt: 'ৰঙালী বিহুৰ সময়ত বজোৱা মূখ্য বাদ্যযন্ত্ৰ কোনটো?',
      correctAnswer: 'বিহুৰ ঢোল',
      options: [
        { label: 'A', emoji: '🥁', name: 'বিহুৰ ঢোল' },
        { label: 'B', emoji: '🎸', name: 'গীটাৰ' },
        { label: 'C', emoji: '🎺', name: 'পেঁপা বা পেঁপাতী' },
      ],
      hint: 'কাঠ আৰু চামৰাৰে তৈয়াৰী, মাৰিৰে বজোৱা বাদ্য!',
    },
  ],
  bn: [
    {
      id: 1,
      prompt: 'উত্তর-পূর্বের ঐতিহ্যবাহী বাঁশের জাপি বা ঝুড়ি কোনটি?',
      correctAnswer: 'বাঁশের ঝুড়ি / জাপি',
      options: [
        { label: 'A', emoji: '🎋', name: 'বাঁশের ঝুড়ি / জাপি' },
        { label: 'B', emoji: '🏺', name: 'মাটির পাত্র' },
        { label: 'C', emoji: '🪑', name: 'কাঠের চেয়ার' },
      ],
      hint: 'বাঁশ ও বেতের বুননটি লক্ষ্য করুন!',
    },
    {
      id: 2,
      prompt: 'কোন ফলটি উত্তর-পূর্বের পরিচিত কামরাঙা (স্টারফ্রুট)?',
      correctAnswer: 'কামরাঙা',
      options: [
        { label: 'A', emoji: '🍎', name: 'আপেল' },
        { label: 'B', emoji: '⭐', name: 'কামরাঙা' },
        { label: 'C', emoji: '🍌', name: 'কলা' },
      ],
      hint: 'কাটলে তারার মতো আকৃতি ফুটে ওঠে!',
    },
    {
      id: 3,
      prompt: 'বিহু উৎসবে কোন ঐতিহ্যবাহী বাদ্যযন্ত্র বাজানো হয়?',
      correctAnswer: 'বিহু ঢোল',
      options: [
        { label: 'A', emoji: '🥁', name: 'বিহু ঢোল' },
        { label: 'B', emoji: '🎸', name: 'গিটার' },
        { label: 'C', emoji: '🎺', name: 'বাঁশি' },
      ],
      hint: 'কাঠের তৈরি দুই মুখের ঢোল যা কাঠি দিয়ে বাজানো হয়!',
    },
  ],
  mn: [
    {
      id: 1,
      prompt: 'অৱাং নোংপোক্কী চৎনবী ৱাগী শান্নপোৎ নত্রগা লু কদাইবা নোনো?',
      correctAnswer: 'ৱাগী লু',
      options: [
        { label: 'A', emoji: '🎋', name: 'ৱাগী লু' },
        { label: 'B', emoji: '🏺', name: 'লৈবাক্কী পুন' },
        { label: 'C', emoji: '🪑', name: 'উগী ফম' },
      ],
      hint: 'ৱানা শাখিবা পোৎলম অদু য়েংবিয়ু!',
    },
    {
      id: 2,
      prompt: 'অৱাং নোংপোক্কী হৈথোই অসি কদাইবা নোনো?',
      correctAnswer: 'হৈথোই (স্টারফ্রুট)',
      options: [
        { label: 'A', emoji: '🍎', name: 'অঙাংবা সেও' },
        { label: 'B', emoji: '⭐', name: 'হৈথোই (স্টারফ্রুট)' },
        { label: 'C', emoji: '🍌', name: 'লাফোই' },
      ],
      hint: 'থৌবা মতমদা থৱানমিচাক মানবা শক্তম ওই!',
    },
    {
      id: 3,
      prompt: 'বিহুগী মতমদা খোংবা বাদ্যযন্ত্র কদাইবা নোনো?',
      correctAnswer: 'বিহু ঢোল',
      options: [
        { label: 'A', emoji: '🥁', name: 'বিহু ঢোল' },
        { label: 'B', emoji: '🎸', name: 'গীটার' },
        { label: 'C', emoji: '🎺', name: 'তুরেহী' },
      ],
      hint: 'উনা শাবা অনী মপাংগা খোংবা ঢোল!',
    },
  ],
  mz: [
    {
      id: 1,
      prompt: 'Khawi ber hi nge Mau Hmanga siam Japi / Bawm chu?',
      correctAnswer: 'Mau Bawm',
      options: [
        { label: 'A', emoji: '🎋', name: 'Mau Bawm' },
        { label: 'B', emoji: '🏺', name: 'Hlum Bel' },
        { label: 'C', emoji: '🪑', name: 'Thing Thuthleng' },
      ],
      hint: 'Mau leh phai hmanga phiar en rawh!',
    },
    {
      id: 2,
      prompt: 'Khawi thei hi nge Starfruit / Kordoi an tih chu?',
      correctAnswer: 'Starfruit Thei',
      options: [
        { label: 'A', emoji: '🍎', name: 'Apple Sen' },
        { label: 'B', emoji: '⭐', name: 'Starfruit Thei' },
        { label: 'C', emoji: '🍌', name: 'Bawngkawn Balhla' },
      ],
      hint: 'A phel chuan arsi a ang!',
    },
    {
      id: 3,
      prompt: 'Bihu kut laia an tum ber khuang khawi nge?',
      correctAnswer: 'Bihu Khuang',
      options: [
        { label: 'A', emoji: '🥁', name: 'Bihu Khuang' },
        { label: 'B', emoji: '🎸', name: 'Guitar' },
        { label: 'C', emoji: '🎺', name: 'Tawtawrawt' },
      ],
      hint: 'Thingphel leh vun hmanga siam khuang a ni!',
    },
  ],
};

export const getObjectQuestionsData = (lang: SupportedLanguage): LocalizedObjectQuestion[] => {
  return OBJECT_QUESTIONS_MAP[lang] || OBJECT_QUESTIONS_MAP.en;
};

// ----------------------------------------------------
// 5. ROUTINE RECALL STEPS
// ----------------------------------------------------
const ROUTINE_STEPS_MAP: Record<SupportedLanguage, LocalizedRoutineStep[]> = {
  en: [
    { id: '1', order: 1, title: 'Morning Walk & Warm Tea', emoji: '🌅', timeSlot: '7:30 AM' },
    { id: '2', order: 2, title: 'Cognitive Games & Memory Time', emoji: '🧠', timeSlot: '9:00 AM' },
    { id: '3', order: 3, title: 'Evening Assam Tea & Garden Stroll', emoji: '🍵', timeSlot: '3:30 PM' },
    { id: '4', order: 4, title: 'Family Dinner & Rest', emoji: '👨‍👩‍👧', timeSlot: '6:30 PM' },
  ],
  hi: [
    { id: '1', order: 1, title: 'सुबह की सैर और गर्म चाय', emoji: '🌅', timeSlot: '7:30 AM' },
    { id: '2', order: 2, title: 'संज्ञानात्मक खेल और स्मृति समय', emoji: '🧠', timeSlot: '9:00 AM' },
    { id: '3', order: 3, title: 'शाम की असम चाय और बगीचे में टहलना', emoji: '🍵', timeSlot: '3:30 PM' },
    { id: '4', order: 4, title: 'परिवार के साथ रात का भोजन और विश्राम', emoji: '👨‍👩‍👧', timeSlot: '6:30 PM' },
  ],
  as: [
    { id: '1', order: 1, title: 'ৰাতিপুৱাৰ খোজ কঢ়া আৰু গৰম চাহ', emoji: '🌅', timeSlot: '7:30 AM' },
    { id: '2', order: 2, title: 'স্মৃতি পৰীক্ষা আৰু মনৰ ব্যায়াম', emoji: '🧠', timeSlot: '9:00 AM' },
    { id: '3', order: 3, title: 'আবেলিৰ অসম চাহ আৰু ফুলনি ফুৰা', emoji: '🍵', timeSlot: '3:30 PM' },
    { id: '4', order: 4, title: 'পৰিয়ালৰ লগত নৈশ আহাৰ আৰু জিৰণি', emoji: '👨‍👩‍👧', timeSlot: '6:30 PM' },
  ],
  bn: [
    { id: '1', order: 1, title: 'সকালের হাঁটা ও গরম চা পান', emoji: '🌅', timeSlot: '7:30 AM' },
    { id: '2', order: 2, title: 'স্মৃতিচর্চা ও বুদ্ধির খেলা', emoji: '🧠', timeSlot: '9:00 AM' },
    { id: '3', order: 3, title: 'বিকেলের আসাম চা ও বাগান ভ্রমণ', emoji: '🍵', timeSlot: '3:30 PM' },
    { id: '4', order: 4, title: 'পরিবারের সাথে রাতের খাবার ও বিশ্রাম', emoji: '👨‍👩‍👧', timeSlot: '6:30 PM' },
  ],
  mn: [
    { id: '1', order: 1, title: 'অয়ুক্কী খোঙ হাম্বা অমসুং চা থকপা', emoji: '🌅', timeSlot: '7:30 AM' },
    { id: '2', order: 2, title: 'নীংশিং এক্সরসাইজ শান্নবা মতম', emoji: '🧠', timeSlot: '9:00 AM' },
    { id: '3', order: 3, title: 'নুমিদাংৱাইগী চা অমসুং লৈকোই কোইবা', emoji: '🍵', timeSlot: '3:30 PM' },
    { id: '4', order: 4, title: 'ইমুংগী চানা-থকপা অমসুং পোথাবা', emoji: '👨‍👩‍👧', timeSlot: '6:30 PM' },
  ],
  mz: [
    { id: '1', order: 1, title: 'Zing boruak tha hip leh thingpui in', emoji: '🌅', timeSlot: '7:30 AM' },
    { id: '2', order: 2, title: 'Hriatna tihchak nan infiamna hun', emoji: '🧠', timeSlot: '9:00 AM' },
    { id: '3', order: 3, title: 'Tlai thingpui leh huan enkawl', emoji: '🍵', timeSlot: '3:30 PM' },
    { id: '4', order: 4, title: 'Zanriah chhungkuain ei leh chawlh', emoji: '👨‍👩‍👧', timeSlot: '6:30 PM' },
  ],
};

export const getRoutineStepsData = (lang: SupportedLanguage): LocalizedRoutineStep[] => {
  return ROUTINE_STEPS_MAP[lang] || ROUTINE_STEPS_MAP.en;
};

// ----------------------------------------------------
// 6. WORD ASSOCIATION PROMPTS
// ----------------------------------------------------
const WORD_PROMPTS_MAP: Record<SupportedLanguage, LocalizedWordPrompt[]> = {
  en: [
    {
      id: 1,
      prefix: 'Morning Assam Tea and...',
      correctWord: 'Warm Water',
      options: ['Warm Water', 'Jeep Safari', 'Ice Cream'],
      hint: 'A comforting morning drink before breakfast!',
    },
    {
      id: 2,
      prefix: 'Spring Bihu Festival and...',
      correctWord: 'Dhol Dance',
      options: ['Dhol Dance', 'Snowfall', 'Football'],
      hint: 'Rhythmic music played with bamboo sticks and drums!',
    },
    {
      id: 3,
      prefix: 'Kaziranga National Park and...',
      correctWord: 'One-Horned Rhino',
      options: ['One-Horned Rhino', 'Polar Bear', 'Desert Cactus'],
      hint: 'The iconic wildlife animal of Assam forest!',
    },
  ],
  hi: [
    {
      id: 1,
      prefix: 'सुबह की ताज़ा असम चाय और...',
      correctWord: 'हल्का गर्म पानी',
      options: ['हल्का गर्म पानी', 'सफारी जीप', 'आइसक्रीम'],
      hint: 'नाश्ते से पहले ताजगी भरा पेय!',
    },
    {
      id: 2,
      prefix: 'बसंत बिहू उत्सव और...',
      correctWord: 'ढोल नृत्य',
      options: ['ढोल नृत्य', 'बर्फबारी', 'फुटबॉल'],
      hint: 'पारंपरिक ढोल और बांस की थाप पर नृत्य!',
    },
    {
      id: 3,
      prefix: 'काजीरंगा राष्ट्रीय उद्यान और...',
      correctWord: 'एक सींग वाला गैंडा',
      options: ['एक सींग वाला गैंडा', 'सफेद भालू', 'रेगिस्तानी नागफनी'],
      hint: 'असम के जंगलों का गौरवशाली वन्यजीव!',
    },
  ],
  as: [
    {
      id: 1,
      prefix: 'ৰাতিপুৱাৰ সুগন্ধি চাহ আৰু...',
      correctWord: 'উভৈনদী কুহুমীয়া পানী',
      options: ['উভৈনদী কুহুমীয়া পানী', 'জীপ চাফাৰী', 'আইচক্ৰীম'],
      hint: 'ৰাতিপুৱাৰ শৰীৰ জুৰোৱা পানীয়!',
    },
    {
      id: 2,
      prefix: 'বসন্তৰ ৰঙালী বিহু আৰু...',
      correctWord: 'ঢোলৰ চাপৰি নাচ',
      options: ['ঢোলৰ চাপৰি নাচ', 'তুষাৰপাত', 'ফুটবল'],
      hint: 'ঢোল-পেঁপাৰ সুৰত লহৰ তোলা নাচ!',
    },
    {
      id: 3,
      prefix: 'কাজিৰঙা ৰাষ্ট্ৰীয় উদ্যান আৰু...',
      correctWord: 'এশিঙীয়া গঁড়',
      options: ['এশিঙীয়া গঁড়', 'বৰফৰ ভালুক', 'মৰুভূমিৰ কেকটাছ'],
      hint: 'অসমৰ অৰণ্যৰ গৌৰৱস্বৰূপ বন্যপ্ৰাণী!',
    },
  ],
  bn: [
    {
      id: 1,
      prefix: 'সকালের আসামের চা এবং...',
      correctWord: 'ঈষদুষ্ণ জল',
      options: ['ঈষদুষ্ণ জল', 'জিপ সাফারি', 'আইসক্রিম'],
      hint: 'সকালের শান্তিময় পানীয়!',
    },
    {
      id: 2,
      prefix: 'বসন্তের বিহু উৎসব এবং...',
      correctWord: 'ঢোলের তালে নাচ',
      options: ['ঢোলের তালে নাচ', 'তুষারপাত', 'ফুটবল'],
      hint: 'ঢোল ও বাঁশির সুরে ঐতিহ্যবাহী নৃত্য!',
    },
    {
      id: 3,
      prefix: 'কাজিরাঙ্গা জাতীয় উদ্যান এবং...',
      correctWord: 'একশৃঙ্গ গণ্ডার',
      options: ['একশৃঙ্গ গণ্ডার', 'মেরু ভাল্লুক', 'মরুভূমির ক্যাকটাস'],
      hint: 'আসামের বনের বিখ্যাত বন্যপ্রাণী!',
    },
  ],
  mn: [
    {
      id: 1,
      prefix: 'অয়ুক্কী চা অমসুং...',
      correctWord: 'ঈশিং চাবা',
      options: ['ঈশিং চাবা', 'জীপ চাফারী', 'আইসক্রীম'],
      hint: 'অয়ুক্তা হকচাংদা কান্নবা পানীয়!',
    },
    {
      id: 2,
      prefix: 'বিহু কুহ্মৈ অমসুং...',
      correctWord: 'ঢোলগী জগোই',
      options: ['ঢোলগী জগোই', 'উন তাবা', 'ফুটবোল'],
      hint: 'ঢোলগী মখোলদা শাবা জগোই!',
    },
    {
      id: 3,
      prefix: 'কাজিৰঙা উদ্যান অমসুং...',
      correctWord: 'সমুক (ৰাইনো)',
      options: ['সমুক (ৰাইনো)', 'পোলার বেয়ার', 'মরুভূমি কা ক্যাকটাস'],
      hint: 'অসামগী নীংথিরবা শা!',
    },
  ],
  mz: [
    {
      id: 1,
      prefix: 'Zing thingpui leh...',
      correctWord: 'Tui Lum',
      options: ['Tui Lum', 'Jeep Chhuah', 'Ais-krim'],
      hint: 'Zing kar tana in tur tha!',
    },
    {
      id: 2,
      prefix: 'Bihu Kut leh...',
      correctWord: 'Khuang Lam',
      options: ['Khuang Lam', 'Vur Tla', 'Football'],
      hint: 'Khuang ri nena lam!',
    },
    {
      id: 3,
      prefix: 'Kaziranga Hmun leh...',
      correctWord: 'Sazuk Ki Pakhat Nei',
      options: ['Sazuk Ki Pakhat Nei', 'Vur Bear', 'Phai Phul'],
      hint: 'North East ramsa lar tak!',
    },
  ],
};

export const getWordPromptsData = (lang: SupportedLanguage): LocalizedWordPrompt[] => {
  return WORD_PROMPTS_MAP[lang] || WORD_PROMPTS_MAP.en;
};
