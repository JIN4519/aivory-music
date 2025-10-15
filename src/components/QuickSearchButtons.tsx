import { Button } from './ui/button';
import { Sparkles } from 'lucide-react';

interface QuickSearchButtonsProps {
  onSearch: (query: string) => void;
}

const QUICK_SEARCHES = [
  { label: 'BTS', query: 'BTS', type: 'artist' },
  { label: '아이유', query: 'IU', type: 'artist' },
  { label: '블랙핑크', query: 'BLACKPINK', type: 'artist' },
  { label: 'Dynamite', query: 'BTS Dynamite', type: 'track' },
  { label: '좋은날', query: 'IU Good Day', type: 'track' },
  { label: 'APT', query: 'ROSÉ Bruno Mars APT', type: 'track' },
];

export function QuickSearchButtons({ onSearch }: QuickSearchButtonsProps) {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
      <h3 className="text-center mb-4 text-gray-700">빠른 검색</h3>
      <div className="flex flex-wrap justify-center gap-3">
        {QUICK_SEARCHES.map((item) => (
          <Button
            key={item.query}
            variant="outline"
            onClick={() => onSearch(item.query)}
            className={`bg-white transition-all ${
              item.type === 'track' 
                ? 'hover:bg-pink-50 border-pink-200 hover:border-pink-300' 
                : 'hover:bg-purple-50 border-purple-200 hover:border-purple-300'
            }`}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {item.label}
            <span className="ml-2 text-xs">
              {item.type === 'track' ? '🎵' : '👤'}
            </span>
          </Button>
        ))}
      </div>
      <p className="text-center text-xs text-gray-500 mt-3">
        👤 아티스트 | 🎵 노래
      </p>
    </div>
  );
}
