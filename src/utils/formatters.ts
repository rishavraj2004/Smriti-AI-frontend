export const getGreetingTime = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

export const getFormattedDate = (): string => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  return new Date().toLocaleDateString('en-US', options);
};

export const getLanguageLabel = (code: string): string => {
  switch (code) {
    case 'as': return 'অসমীয়া (Assamese)';
    case 'hi': return 'हिन्दी (Hindi)';
    case 'bn': return 'বাংলা (Bengali)';
    case 'mn': return 'মৈতৈলোন্ (Manipuri)';
    case 'mz': return 'Mizo';
    default: return 'English';
  }
};
