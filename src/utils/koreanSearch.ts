// 한글을 로마자로 변환하는 유틸리티
const CHOSUNG = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const JUNGSUNG = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
const JONGSUNG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

const ROMANIZATION_MAP: { [key: string]: string } = {
  // 초성
  'ㄱ': 'g', 'ㄲ': 'kk', 'ㄴ': 'n', 'ㄷ': 'd', 'ㄸ': 'tt',
  'ㄹ': 'r', 'ㅁ': 'm', 'ㅂ': 'b', 'ㅃ': 'pp', 'ㅅ': 's',
  'ㅆ': 'ss', 'ㅇ': '', 'ㅈ': 'j', 'ㅉ': 'jj', 'ㅊ': 'ch',
  'ㅋ': 'k', 'ㅌ': 't', 'ㅍ': 'p', 'ㅎ': 'h',
  
  // 중성
  'ㅏ': 'a', 'ㅐ': 'ae', 'ㅑ': 'ya', 'ㅒ': 'yae',
  'ㅓ': 'eo', 'ㅔ': 'e', 'ㅕ': 'yeo', 'ㅖ': 'ye',
  'ㅗ': 'o', 'ㅘ': 'wa', 'ㅙ': 'wae', 'ㅚ': 'oe',
  'ㅛ': 'yo', 'ㅜ': 'u', 'ㅝ': 'wo', 'ㅞ': 'we',
  'ㅟ': 'wi', 'ㅠ': 'yu', 'ㅡ': 'eu', 'ㅢ': 'ui', 'ㅣ': 'i',
};

const JONGSUNG_ROMANIZATION: { [key: string]: string } = {
  '': '', 'ㄱ': 'k', 'ㄲ': 'k', 'ㄳ': 'k', 'ㄴ': 'n',
  'ㄵ': 'n', 'ㄶ': 'n', 'ㄷ': 't', 'ㄹ': 'l', 'ㄺ': 'k',
  'ㄻ': 'm', 'ㄼ': 'l', 'ㄽ': 'l', 'ㄾ': 'l', 'ㄿ': 'p',
  'ㅀ': 'l', 'ㅁ': 'm', 'ㅂ': 'p', 'ㅄ': 'p', 'ㅅ': 't',
  'ㅆ': 't', 'ㅇ': 'ng', 'ㅈ': 't', 'ㅊ': 't', 'ㅋ': 'k',
  'ㅌ': 't', 'ㅍ': 'p', 'ㅎ': 't',
};

// 유명 한국 아티스트 이름 매핑
const ARTIST_NAME_MAP: { [key: string]: string[] } = {
  '방탄소년단': ['BTS', 'Bangtan Sonyeondan'],
  'BTS': ['BTS', 'Bangtan'],
  '비티에스': ['BTS'],
  '블랙핑크': ['BLACKPINK', 'Black Pink'],
  '블핑': ['BLACKPINK'],
  '트와이스': ['TWICE'],
  '아이브': ['IVE'],
  '뉴진스': ['NewJeans', 'New Jeans'],
  '에스파': ['aespa'],
  '르세라핌': ['LE SSERAFIM', 'Le Sserafim'],
  '세븐틴': ['SEVENTEEN'],
  '엑소': ['EXO'],
  '레드벨벳': ['Red Velvet'],
  '있지': ['ITZY'],
  '스테이씨': ['STAYC'],
  '엔시티': ['NCT'],
  '스트레이키즈': ['Stray Kids'],
  '투모로우바이투게더': ['TXT', 'Tomorrow X Together'],
  '투바투': ['TXT'],
  '아이유': ['IU', 'Lee Ji-eun'],
  '지드래곤': ['G-Dragon', 'GD', 'Kwon Ji-yong'],
  '태양': ['Taeyang', 'SOL'],
  '빅뱅': ['BIGBANG', 'Big Bang'],
  '샤이니': ['SHINee'],
  '소녀시대': ['Girls\' Generation', 'SNSD'],
  '슈퍼주니어': ['Super Junior'],
  '동방신기': ['TVXQ', 'Tohoshinki'],
  '싸이': ['PSY', 'Psy'],
  '비': ['Rain', 'Jung Ji-hoon'],
  '보아': ['BoA'],
  'god': ['god', 'g.o.d'],
  '지오디': ['god', 'g.o.d'],
  '빅마마': ['Big Mama'],
  '성시경': ['Sung Si-kyung'],
  '이승기': ['Lee Seung-gi'],
  '임영웅': ['Lim Young-woong'],
  '아이돌': ['idol'],
  '세븐': ['SE7EN', 'Seven'],
};

function koreanToRoman(text: string): string {
  let result = '';
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const code = char.charCodeAt(0);
    
    // 한글 유니코드 범위: 0xAC00 ~ 0xD7A3
    if (code >= 0xAC00 && code <= 0xD7A3) {
      const syllableIndex = code - 0xAC00;
      
      const chosungIndex = Math.floor(syllableIndex / 588);
      const jungsungIndex = Math.floor((syllableIndex % 588) / 28);
      const jongsungIndex = syllableIndex % 28;
      
      const chosung = CHOSUNG[chosungIndex];
      const jungsung = JUNGSUNG[jungsungIndex];
      const jongsung = JONGSUNG[jongsungIndex];
      
      result += (ROMANIZATION_MAP[chosung] || chosung);
      result += (ROMANIZATION_MAP[jungsung] || jungsung);
      result += (JONGSUNG_ROMANIZATION[jongsung] || '');
    } else {
      // 한글이 아닌 경우 그대로 추가
      result += char;
    }
  }
  
  return result;
}

export function enhanceSearchQuery(query: string): string {
  const trimmedQuery = query.trim();
  
  // 이미 영어인 경우 그대로 반환
  if (!/[\u3131-\u314e\u314f-\u3163\uac00-\ud7a3]/g.test(trimmedQuery)) {
    return trimmedQuery;
  }
  
  // 매핑 테이블에서 찾기
  const normalizedQuery = trimmedQuery.toLowerCase();
  for (const [korean, english] of Object.entries(ARTIST_NAME_MAP)) {
    if (normalizedQuery.includes(korean.toLowerCase())) {
      // 여러 영어 이름이 있으면 첫 번째 것을 사용
      return english[0];
    }
  }
  
  // 로마자 변환
  const romanized = koreanToRoman(trimmedQuery);
  
  // 한글과 로마자 둘 다 검색
  return `${trimmedQuery} OR ${romanized}`;
}

export function getSearchSuggestions(query: string): string[] {
  const trimmedQuery = query.trim().toLowerCase();
  const suggestions: string[] = [];
  
  // 매핑 테이블에서 모든 매칭 찾기
  for (const [korean, englishNames] of Object.entries(ARTIST_NAME_MAP)) {
    if (korean.toLowerCase().includes(trimmedQuery) || 
        englishNames.some(en => en.toLowerCase().includes(trimmedQuery))) {
      suggestions.push(korean);
      suggestions.push(...englishNames);
    }
  }
  
  return [...new Set(suggestions)].slice(0, 5);
}
