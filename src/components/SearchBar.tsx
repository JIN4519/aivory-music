import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { enhanceSearchQuery } from '../utils/koreanSearch';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [input, setInput] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      const query = enhanceSearchQuery(input.trim());
      onSearch(query);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    // 실시간 검색
    if (value.trim()) {
      const query = enhanceSearchQuery(value.trim());
      onSearch(query);
    } else {
      onSearch('');
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
      <div className="relative flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a1a5b6]" />
          <Input
            type="text"
            placeholder="검색어를 입력하세요"
            value={input}
            onChange={handleInputChange}
            className="pl-12 pr-4 h-14 text-base bg-[#030411] border-none text-white placeholder:text-[#a1a5b6] rounded-full focus-visible:ring-2 focus-visible:ring-[#7342ff]"
          />
        </div>
        <Button
          type="submit"
          size="lg"
          className="h-14 px-8 bg-gradient-to-r from-[#7342ff] to-[#db65d1] hover:from-[#6235e6] hover:to-[#c554be] rounded-full text-white"
        >
          검색
        </Button>
      </div>
    </form>
  );
}
