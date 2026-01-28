// Indian Languages Data Structure
// All 22 Scheduled Indian Languages + Major Dialects

export interface IndianLanguage {
  code: string;
  name: string;
  nativeName: string;
  script: string;
  scriptDirection: 'ltr' | 'rtl';
  family: string;
  region: string;
  speakers: string;
  dialects: string[];
  examples: {
    hello: string;
    thankYou: string;
  };
}

export interface LanguageGroup {
  name: string;
  languages: IndianLanguage[];
}

// Complete Indian Languages Data
export const indianLanguages: LanguageGroup[] = [
  {
    name: 'Indo-Aryan (North & Central)',
    languages: [
      {
        code: 'hi',
        name: 'Hindi',
        nativeName: 'हिन्दी',
        script: 'Devanagari',
        scriptDirection: 'ltr',
        family: 'Indo-Aryan',
        region: 'North India',
        speakers: '600M+',
        dialects: ['Brajbhasha', 'Awadhi', 'Bhojpuri', 'Rajasthani', 'Bundeli'],
        examples: {
          hello: 'नमस्ते',
          thankYou: 'धन्यवाद'
        }
      },
      {
        code: 'bn',
        name: 'Bengali',
        nativeName: 'বাংলা',
        script: 'Bengali',
        scriptDirection: 'ltr',
        family: 'Indo-Aryan',
        region: 'East India',
        speakers: '300M+',
        dialects: ['Chittagonian', 'Sylheti', 'Rarhi', 'Vanga', 'Bangal'],
        examples: {
          hello: 'নমস্কার',
          thankYou: 'ধন্যবাদ'
        }
      },
      {
        code: 'pa',
        name: 'Punjabi',
        nativeName: 'ਪੰਜਾਬੀ',
        script: 'Gurmukhi',
        scriptDirection: 'ltr',
        family: 'Indo-Aryan',
        region: 'North India',
        speakers: '120M+',
        dialects: ['Majhi', 'Doabi', 'Malwai', 'Powadhi', 'Pwadhi'],
        examples: {
          hello: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ',
          thankYou: 'ਧੰਨਵਾਦ'
        }
      },
      {
        code: 'mr',
        name: 'Marathi',
        nativeName: 'मराठी',
        script: 'Devanagari',
        scriptDirection: 'ltr',
        family: 'Indo-Aryan',
        region: 'West India',
        speakers: '90M+',
        dialects: ['Varhadi', 'Zadi Boli', 'Khandeshi', 'Malvani', 'Konkani'],
        examples: {
          hello: 'नमस्कार',
          thankYou: 'धन्यवाद'
        }
      },
      {
        code: 'gu',
        name: 'Gujarati',
        nativeName: 'ગુજરાતી',
        script: 'Gujarati',
        scriptDirection: 'ltr',
        family: 'Indo-Aryan',
        region: 'West India',
        speakers: '60M+',
        dialects: ['Kathiawari', 'Kutchi', 'Sorathi', 'Charotari', 'Gamadiya'],
        examples: {
          hello: 'નમસ્તે',
          thankYou: 'આભાર'
        }
      },
      {
        code: 'ur',
        name: 'Urdu',
        nativeName: 'اردو',
        script: 'Perso-Arabic',
        scriptDirection: 'rtl',
        family: 'Indo-Aryan',
        region: 'North India',
        speakers: '70M+',
        dialects: ['Dakhni', 'Rekhta', 'Modern Standard', 'Deccani'],
        examples: {
          hello: 'السلام علیکم',
          thankYou: 'شکریہ'
        }
      },
      {
        code: 'as',
        name: 'Assamese',
        nativeName: 'অসমীয়া',
        script: 'Assamese',
        scriptDirection: 'ltr',
        family: 'Indo-Aryan',
        region: 'Northeast India',
        speakers: '25M+',
        dialects: ['Kamrupi', 'Goalpariya', 'Eastern Assamese', 'Central Assamese'],
        examples: {
          hello: 'নমস্কাৰ',
          thankYou: 'ধন্যবাদ'
        }
      },
      {
        code: 'or',
        name: 'Odia',
        nativeName: 'ଓଡ଼ିଆ',
        script: 'Odia',
        scriptDirection: 'ltr',
        family: 'Indo-Aryan',
        region: 'East India',
        speakers: '45M+',
        dialects: ['Sambalpuri', 'Kosli', 'Baleswari', 'Ganjami', 'Desia'],
        examples: {
          hello: 'ନମସ୍କାର',
          thankYou: 'ଧନ୍ୟବାଦ'
        }
      },
      {
        code: 'mai',
        name: 'Maithili',
        nativeName: 'मैथिली',
        script: 'Devanagari',
        scriptDirection: 'ltr',
        family: 'Indo-Aryan',
        region: 'East India',
        speakers: '35M+',
        dialects: ['Sadri', 'Bajjika', 'Angika', 'Thethi'],
        examples: {
          hello: 'प्रणाम',
          thankYou: 'धन्यवाद'
        }
      },
      {
        code: 'ne',
        name: 'Nepali',
        nativeName: 'नेपाली',
        script: 'Devanagari',
        scriptDirection: 'ltr',
        family: 'Indo-Aryan',
        region: 'Himalayan Region',
        speakers: '40M+',
        dialects: ['Bhojpuri (Nepal)', 'Sherpa', 'Tamang', 'Gurung'],
        examples: {
          hello: 'नमस्ते',
          thankYou: 'धन्यवाद'
        }
      },
      {
        code: 'sd',
        name: 'Sindhi',
        nativeName: 'سنڌي',
        script: 'Perso-Arabic',
        scriptDirection: 'rtl',
        family: 'Indo-Aryan',
        region: 'North India',
        speakers: '30M+',
        dialects: ['Saraiki', 'Vicholi', 'Lasi', 'Thareli', 'Kachhi'],
        examples: {
          hello: 'السلام علیکم',
          thankYou: 'مهرباني'
        }
      },
      {
        code: 'ks',
        name: 'Kashmiri',
        nativeName: 'کٲشُر',
        script: 'Perso-Arabic',
        scriptDirection: 'rtl',
        family: 'Indo-Aryan',
        region: 'Kashmir',
        speakers: '7M+',
        dialects: ['Kishtwari', 'Poguli', 'Rambani', 'Siraji'],
        examples: {
          hello: 'Assalam-o-Alaikum',
          thankYou: 'Shukriya'
        }
      },
      {
        code: 'doi',
        name: 'Dogri',
        nativeName: 'डोगरी',
        script: 'Devanagari',
        scriptDirection: 'ltr',
        family: 'Indo-Aryan',
        region: 'North India',
        speakers: '5M+',
        dialects: ['Kangri', 'Bhadarwahi', 'Bhoti', 'Bilaspuri'],
        examples: {
          hello: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ',
          thankYou: 'धन्यवाद'
        }
      },
      {
        code: 'sa',
        name: 'Sanskrit',
        nativeName: 'संस्कृतम्',
        script: 'Devanagari',
        scriptDirection: 'ltr',
        family: 'Indo-Aryan',
        region: 'Classical',
        speakers: '25K+',
        dialects: ['Vedic', 'Classical', 'Epic', 'Paninian'],
        examples: {
          hello: 'नमस्ते',
          thankYou: 'कृतज्ञता'
        }
      }
    ]
  },
  {
    name: 'Dravidian (South)',
    languages: [
      {
        code: 'ta',
        name: 'Tamil',
        nativeName: 'தமிழ்',
        script: 'Tamil',
        scriptDirection: 'ltr',
        family: 'Dravidian',
        region: 'South India',
        speakers: '80M+',
        dialects: ['Madurai Tamil', 'Kongu Tamil', 'Chennai Tamil', 'Nellai Tamil'],
        examples: {
          hello: 'வணக்கம்',
          thankYou: 'நன்றி'
        }
      },
      {
        code: 'te',
        name: 'Telugu',
        nativeName: 'తెలుగు',
        script: 'Telugu',
        scriptDirection: 'ltr',
        family: 'Dravidian',
        region: 'South India',
        speakers: '85M+',
        dialects: ['Telangana Telugu', 'Coastal Andhra', 'Rayalaseema', 'Nellore'],
        examples: {
          hello: 'నమస్కారం',
          thankYou: 'ధన్యవాదాలు'
        }
      },
      {
        code: 'kn',
        name: 'Kannada',
        nativeName: 'ಕನ್ನಡ',
        script: 'Kannada',
        scriptDirection: 'ltr',
        family: 'Dravidian',
        region: 'South India',
        speakers: '65M+',
        dialects: ['Mysore Kannada', 'Hubli Kannada', 'Dharwad Kannada', 'North Karnataka'],
        examples: {
          hello: 'ನಮಸ್ಕಾರ',
          thankYou: 'ಧನ್ಯವಾದ'
        }
      },
      {
        code: 'ml',
        name: 'Malayalam',
        nativeName: 'മലയാളം',
        script: 'Malayalam',
        scriptDirection: 'ltr',
        family: 'Dravidian',
        region: 'South India',
        speakers: '40M+',
        dialects: ['Travancore', 'Malabar', 'Kochi', 'Central Kerala'],
        examples: {
          hello: 'നമസ്കാരം',
          thankYou: 'നന്ദി'
        }
      }
    ]
  },
  {
    name: 'Austroasiatic & Tibeto-Burman',
    languages: [
      {
        code: 'bn',
        name: 'Santali',
        nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ',
        script: 'Ol Chiki',
        scriptDirection: 'ltr',
        family: 'Austroasiatic',
        region: 'East India',
        speakers: '7M+',
        dialects: ['Kamari-Santali', 'Lohari-Santali', 'Mahali', 'Turi'],
        examples: {
          hello: 'जोहार',
          thankYou: 'धन्यवाद'
        }
      },
      {
        code: 'mni',
        name: 'Manipuri',
        nativeName: 'ꯃꯤꯇꯩꯂꯣꯟ',
        script: 'Meitei Mayek',
        scriptDirection: 'ltr',
        family: 'Tibeto-Burman',
        region: 'Northeast India',
        speakers: '3M+',
        dialects: ['Meitei', 'Pangal', 'Loi', 'Kakching'],
        examples: {
          hello: 'হৰবাড়ি',
          thankYou: 'ধন্যবাদ'
        }
      },
      {
        code: 'bho',
        name: 'Bodo',
        nativeName: 'बर\'',
        script: 'Devanagari',
        scriptDirection: 'ltr',
        family: 'Tibeto-Burman',
        region: 'Northeast India',
        speakers: '2M+',
        dialects: ['Western Bodo', 'Eastern Bodo', 'Mech', 'Dimasa'],
        examples: {
          hello: 'खाम्बि',
          thankYou: 'बारखाम'
        }
      }
    ]
  }
];

// Flatten all languages for easy access
export const allLanguages = indianLanguages.flatMap(group => group.languages);

// Find language by code
export function findLanguageByCode(code: string): IndianLanguage | undefined {
  return allLanguages.find(lang => lang.code === code);
}

// Search languages
export function searchLanguages(query: string): IndianLanguage[] {
  const lowerQuery = query.toLowerCase();
  return allLanguages.filter(lang =>
    lang.name.toLowerCase().includes(lowerQuery) ||
    lang.nativeName.includes(query) ||
    lang.code.toLowerCase().includes(lowerQuery)
  );
}

// Add English to allLanguages
allLanguages.push({
  code: 'en',
  name: 'English',
  nativeName: 'English',
  script: 'Latin',
  scriptDirection: 'ltr',
  family: 'Indo-European',
  region: 'International',
  speakers: '1.5B+',
  dialects: ['American', 'British', 'Indian', 'Australian'],
  examples: {
    hello: 'Hello',
    thankYou: 'Thank you'
  }
});

// Remove duplicates by creating a Map with unique codes
const uniqueLanguagesMap = new Map();
allLanguages.forEach(lang => {
  if (!uniqueLanguagesMap.has(lang.code)) {
    uniqueLanguagesMap.set(lang.code, lang);
  }
});

// Replace allLanguages with unique version
const _uniqueLanguages = Array.from(uniqueLanguagesMap.values());
Object.assign(allLanguages, _uniqueLanguages);

// Get popular languages
export const popularLanguages = [
  allLanguages.find(l => l.code === 'hi')!,  // Hindi
  allLanguages.find(l => l.code === 'en')!,  // English (international standard)
  allLanguages.find(l => l.code === 'ta')!,  // Tamil
  allLanguages.find(l => l.code === 'te')!,  // Telugu
  allLanguages.find(l => l.code === 'bn')!,  // Bengali
  allLanguages.find(l => l.code === 'mr')!,  // Marathi
].filter(Boolean);
