import { useState, useEffect, useRef } from "react";
import Group12 from "./imports/Group12";
import { SearchBar } from "./components/SearchBar";
// Removed SpotifyCategorySection import: discover tab will show Top100 tracks instead of artists
import { SpotifyArtistDetail } from "./components/SpotifyArtistDetail";
import { SpotifyResults } from "./components/SpotifyResults";
import { SpotifyTrackResults } from "./components/SpotifyTrackResults";
import { SpotifyChartSection } from "./components/SpotifyChartSection";
import { KoreanPlaylists } from "./components/KoreanPlaylists";
import { GlobalMusicPlayer, Track } from "./components/GlobalMusicPlayer";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./components/ui/tabs";
import { Music2, ListMusic, TrendingUp } from "lucide-react";
import { SpotifyArtist } from "./utils/spotify";

// 인기 트랙 카테고리 (Top100 기반 쿼리)
const POPULAR_TRACKS = [
  { id: "top100_kpop", name: "Top 100 - K-Pop", query: "kpop top 100" },
  { id: "top100_global", name: "Top 100 - Global", query: "top 100" },
  { id: "trending_korea", name: "오늘의 인기 음악", query: "kpop chart" },
];

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArtist, setSelectedArtist] =
    useState<SpotifyArtist | null>(null);
  const [activeTab, setActiveTab] = useState("discover");
  const [currentPage, setCurrentPage] = useState<"main" | "myqueue">("main");
  // Queue / playlist state
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  // Playback context: null = normal queue mode, otherwise contains a context like { type: 'chart', tracks }
  const [playContext, setPlayContext] = useState<null | { type: 'chart'; tracks: Track[] }>(null);

  // currentTrack is derived from playContext (chart) if active, otherwise from queue + currentIndex
  const currentTrack = (() => {
    if (playContext && currentIndex !== null) {
      const t = playContext.tracks[currentIndex];
      if (t) return t;
    }
    return currentIndex !== null && queue[currentIndex] ? queue[currentIndex] : null;
  })();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setActiveTab("search");
    }
  };

  // Play a track immediately and replace the queue (used by search results / manual adds)
  const playNow = (track: Track) => {
    // clear any playback context when user explicitly plays a single track from search/add
    setPlayContext(null);
    setQueue([track]);
    setCurrentIndex(0);
    // ensure youtube fallback is available if no preview
    enrichTrackWithYouTubeIfNeeded(0);
  };

  // Start playback using an explicit context (e.g. chart Top100) so next/prev move inside that context
  const startContextPlay = (tracks: Track[], startIndex: number) => {
    if (!tracks || tracks.length === 0) return;
    // set a playContext but DO NOT modify the user's queue (do not auto-add 100 tracks)
    setPlayContext({ type: 'chart', tracks });
    setCurrentIndex(startIndex);
    // ensure youtube fallback for the starting item if needed
    enrichTrackWithYouTubeIfNeeded(startIndex);
  };

  // Add all tracks from a chart into the user's queue (append)
  const addChartToQueue = (tracks: Track[]) => {
    if (!tracks || tracks.length === 0) return;
    setQueue((prev) => {
      const newArr = [...prev, ...tracks];
      // highlight start of added block
      setHighlightedIndex(prev.length);
      setTimeout(() => setHighlightedIndex(null), 2000);
      return newArr;
    });
  // When user explicitly adds chart tracks to their queue, clear any active playContext
  setPlayContext(null);
    showToast(`차트 ${tracks.length}곡이 나만의 아이보리에 추가되었습니다.`);
  };

  // Add a track to the end of the queue (does not change currently playing)
  const addToQueue = (track: Track) => {
    console.log('🎵 addToQueue called:', track.name);
    setQueue((prev: Track[]) => {
      const newArr = [...prev, track];
      console.log('📝 Queue updated, length:', newArr.length);
      // highlight the newly added item by index (cleared after timeout)
      setHighlightedIndex(newArr.length - 1);
      // open the panel so user can see it
      setIsQueueOpen(true);
      console.log('🔓 isQueueOpen set to true');
      // scroll the list after a short delay (allow DOM to update)
      setTimeout(() => {
        if (queueListRef.current) {
          // Scroll to the very bottom to show the newly added track
          queueListRef.current.scrollTop = queueListRef.current.scrollHeight;
        }
      }, 200);
      // clear highlight after 2s
      setTimeout(() => setHighlightedIndex(null), 2000);
      return newArr;
    });
    // If nothing is playing, start from the newly added track
    setCurrentIndex((idx: number | null) => (idx === null ? 0 : idx));
    showToast('🎵 음악이 추가되었습니다.', {
      label: '목록으로 이동',
      onClick: () => {
        setIsQueueOpen(true);
        setTimeout(() => {
          if (queueListRef.current) {
            queueListRef.current.scrollTop = queueListRef.current.scrollHeight;
          }
        }, 200);
      }
    });
  };

  const playAt = (index: number) => {
    console.log('playAt called with index:', index, 'queue length:', queue.length);
    const getTrackByIndex = (idx: number) => {
      if (playContext && playContext.type === 'chart') return playContext.tracks[idx];
      return queue[idx];
    };
    const length = playContext && playContext.type === 'chart' ? playContext.tracks.length : queue.length;
    if (index < 0 || index >= length) {
      console.warn('Invalid index:', index);
      return;
    }
    const track = getTrackByIndex(index);
    if (!track) {
      console.warn('No track at index', index);
      return;
    }
  console.log('Playing track:', track.name, 'by', track.artist);
  // If user explicitly plays at an index, clear any playContext so queue navigation is used
  setPlayContext(null);
  setQueue((q) => q); // trigger state to be stable
  setCurrentIndex(index);
    enrichTrackWithYouTubeIfNeeded(index);
    showToast(`"${track.name}" 재생 중...`);
  };

  // If track at index has no previewUrl and no youtubeVideoId, perform a YouTube search
  const enrichTrackWithYouTubeIfNeeded = async (index: number) => {
    try {
      const getTrackByIndex = (idx: number) => {
        if (playContext && playContext.type === 'chart') return playContext.tracks[idx];
        return queue[idx];
      };
      const item = getTrackByIndex(index);
      if (!item) return;
      if (item.previewUrl) return; // Spotify preview available
      if (item.youtubeVideoId) return; // already has youtube id
      // dynamic import to avoid bundling if not used
      const { searchYouTubeVideo } = await import('./utils/youtubeSearch');
      const q = `${item.artist} ${item.name} official`;
      const videoId = await searchYouTubeVideo(q);
      if (videoId) {
        // If we're in chart context, update the context tracks; otherwise update queue
        if (playContext && playContext.type === 'chart') {
          const newTracks = [...playContext.tracks];
          newTracks[index] = { ...newTracks[index], youtubeVideoId: videoId };
          setPlayContext({ ...playContext, tracks: newTracks });
        } else {
          const modQueue = [...queue];
          modQueue[index] = { ...modQueue[index], youtubeVideoId: videoId };
          setQueue(modQueue);
        }
        showToast('YouTube 플레이어로 재생 준비되었습니다.');
      }
    } catch (e) {
      console.error('Enrichment failed', e);
    }
  };

  const playNext = () => {
    if (currentIndex === null) return;
    // If we're in a playContext (chart), keep navigation within the context tracks
    if (playContext && playContext.type === 'chart') {
      const ctxLength = playContext.tracks.length;
      if (currentIndex + 1 < ctxLength) {
        setCurrentIndex(currentIndex + 1);
        enrichTrackWithYouTubeIfNeeded(currentIndex + 1);
      } else {
        // reached end of chart context: clear context and stop
        setPlayContext(null);
        setCurrentIndex(null);
      }
      return;
    }

    // Default queue behavior
    if (currentIndex + 1 < queue.length) {
      setCurrentIndex(currentIndex + 1);
      enrichTrackWithYouTubeIfNeeded(currentIndex + 1);
    } else {
      setCurrentIndex(null);
    }
  };

  const playPrev = () => {
    if (currentIndex === null) return;
    if (playContext && playContext.type === 'chart') {
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
        enrichTrackWithYouTubeIfNeeded(currentIndex - 1);
      }
      return;
    }

    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      enrichTrackWithYouTubeIfNeeded(currentIndex - 1);
    }
  };

  const removeFromQueue = (index: number) => {
    setQueue((prev: Track[]) => prev.filter((_: Track, i: number) => i !== index));
    setCurrentIndex((idx: number | null) => {
      if (idx === null) return null;
      if (index < idx) return idx - 1; // shift left
      if (index === idx) return null; // removed current
      return idx;
    });
  };

  // Clear entire queue and reset playback state
  const clearQueue = () => {
    setQueue([]);
    setCurrentIndex(null);
    setPlayContext(null);
    try {
      localStorage.setItem(CURRENT_QUEUE_KEY, JSON.stringify({ queue: [], currentIndex: null }));
    } catch (e) {
      console.error('Failed to persist cleared queue', e);
    }
    showToast('나만의 아이보리를 비웠습니다.');
  };

  // Queue panel expand state
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  // Saved user queues (multiple slots) persisted
  const SAVED_QUEUES_KEY = 'aivory:savedQueues:v1';
  interface SavedQueue { id: string; name: string; items: Track[] }
  const [savedQueues, setSavedQueues] = useState<SavedQueue[]>([]);
  const [showSavedList, setShowSavedList] = useState(false);

  // Toasts with optional action
  type Toast = { id: string; msg: string; action?: { label: string; onClick: () => void } };
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = (msg: string, action?: { label: string; onClick: () => void }) => {
    const id = String(Date.now()) + Math.random().toString(36).slice(2, 7);
    const toast: Toast = { id, msg, action };
    setToasts((t) => [...t, toast]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5000);
  };

  // load saved queues once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_QUEUES_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as SavedQueue[];
      if (Array.isArray(parsed)) setSavedQueues(parsed);
    } catch (e) {
      console.error('Failed to load saved queues', e);
    }
  }, []);

  // Persist / restore current queue (session) so users can find where it is saved
  const CURRENT_QUEUE_KEY = 'aivory:currentQueue:v1';
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CURRENT_QUEUE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { queue: SavedQueue['items']; currentIndex: number | null };
      if (parsed?.queue) {
        setQueue(parsed.queue as Track[]);
        setCurrentIndex(parsed.currentIndex ?? null);
      }
    } catch (e) {
      console.error('Failed to restore current queue', e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CURRENT_QUEUE_KEY, JSON.stringify({ queue, currentIndex }));
    } catch (e) {
      console.error('Failed to persist current queue', e);
    }
  }, [queue, currentIndex]);

  const persistSavedQueues = (list: SavedQueue[]) => {
    try {
      localStorage.setItem(SAVED_QUEUES_KEY, JSON.stringify(list));
      setSavedQueues(list);
    } catch (e) {
      console.error('Failed to persist saved queues', e);
    }
  };

  const saveCurrentQueueAs = (name?: string) => {
    const newName = name || `나의 큐 ${savedQueues.length + 1}`;
    const slot: SavedQueue = { id: String(Date.now()), name: newName, items: queue };
    const list = [...savedQueues, slot];
    persistSavedQueues(list);
    showToast('큐가 저장되었습니다.');
  };

  const loadSavedQueueById = (id: string) => {
    const slot = savedQueues.find((s: SavedQueue) => s.id === id);
    if (!slot) {
      showToast('저장된 목록을 찾을 수 없습니다.');
      return;
    }
    setQueue(slot.items);
    setCurrentIndex(slot.items.length ? 0 : null);
    setIsQueueOpen(true);
    showToast(`'${slot.name}' 을(를) 불러왔습니다.`);
  };

  const deleteSavedQueueById = (id: string) => {
    const list = savedQueues.filter((s: SavedQueue) => s.id !== id);
    persistSavedQueues(list);
    showToast('저장된 목록을 삭제했습니다.');
  };

  // Compatibility wrappers for the UI buttons (operate on first saved slot if present)
  const savedQueueName = savedQueues[0]?.name ?? '나의 큐';
  const saveQueue = () => saveCurrentQueueAs();
  const loadSavedQueue = () => {
    if (!savedQueues[0]) { showToast('저장된 목록이 없습니다.'); return; }
    loadSavedQueueById(savedQueues[0].id);
  };
  const deleteSavedQueue = () => {
    if (!savedQueues[0]) { showToast('저장된 목록이 없습니다.'); return; }
    deleteSavedQueueById(savedQueues[0].id);
  };

  // Visual feedback for newly added item: store its index and ref to the list container
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const queueListRef = useRef<HTMLDivElement | null>(null);
  const [showSavedListLocal, setShowSavedListLocal] = useState(false);

  // Prompt-based Save As (gives user a chance to name their saved queue)
  const saveQueueAs = () => {
    const defaultName = `나의 큐 ${savedQueues.length + 1}`;
    const name = window.prompt('저장할 큐 이름을 입력하세요', defaultName);
    if (!name) {
      showToast('저장이 취소되었습니다.');
      return;
    }
    saveCurrentQueueAs(name);
  };

  if (selectedArtist) {
    return (
      <>
        <SpotifyArtistDetail
          artist={selectedArtist}
          onBack={() => setSelectedArtist(null)}
          onTrackPlay={playNow}
        />
        <GlobalMusicPlayer 
          track={currentTrack}
          onClose={() => { setCurrentIndex(null); }}
          onNext={playNext}
          onPrev={playPrev}
        />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#0b0d21] pb-32">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-20 bg-[#131739] border-r border-[#060629] flex flex-col items-center py-8">
        <div className="relative mb-12">
          <button
            aria-label="홈으로 이동"
            onClick={() => {
              // reset view: clear search, deselect artist, go to discover tab
              setSearchQuery('');
              setSelectedArtist(null);
              setActiveTab('discover');
              setCurrentPage('main');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7342ff] to-[#db65d1] p-0.5 focus:outline-none focus:ring-2 focus:ring-[#7342ff]"
          >
            <div className="w-full h-full rounded-full bg-[#0b0d21] flex items-center justify-center p-1.5 overflow-hidden">
              <div className="w-8 h-8">
                <Group12 />
              </div>
            </div>
          </button>
        </div>
        
        {/* 나만의 아이보리 버튼 */}
        <button
          onClick={() => setCurrentPage("myqueue")}
          className={`relative w-14 h-14 rounded-xl p-0.5 focus:outline-none hover:scale-110 transition-transform mb-4 ${
            currentPage === "myqueue" 
              ? "bg-gradient-to-br from-[#7342ff] to-[#db65d1]" 
              : "bg-[#1a1f4a]"
          }`}
          title="나만의 아이보리"
        >
          <div className={`w-full h-full rounded-xl flex flex-col items-center justify-center gap-1 ${
            currentPage === "myqueue" ? "bg-[#131739]" : "bg-transparent"
          }`}>
            <ListMusic className="w-5 h-5 text-white" />
            <span className="text-white text-[10px] font-bold">{queue.length}</span>
          </div>
        </button>
      </div>

      {/* Main Content */}
      <div className="ml-20 mr-16">
        {/* 나만의 아이보리 페이지 */}
        {currentPage === "myqueue" && (
          <div className="min-h-screen p-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <ListMusic className="w-8 h-8 text-[#7342ff]" />
                  <h1 className="text-3xl font-bold text-white">나만의 아이보리</h1>
                  <span className="text-lg text-[#a5a6b9]">({queue.length}개의 곡)</span>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <button 
                  className="px-4 py-2 bg-gradient-to-r from-[#7342ff] to-[#db65d1] rounded-lg text-white hover:from-[#6235e6] hover:to-[#c554be] font-medium flex items-center gap-2"
                  onClick={() => playPrev()}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                  </svg>
                  이전 곡
                </button>
                <button 
                  className="px-4 py-2 bg-gradient-to-r from-[#7342ff] to-[#db65d1] rounded-lg text-white hover:from-[#6235e6] hover:to-[#c554be] font-medium flex items-center gap-2"
                  onClick={() => playNext()}
                >
                  다음 곡
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                  </svg>
                </button>
                <button
                  className="px-4 py-2 bg-red-600 rounded-lg text-white hover:bg-red-700 font-medium flex items-center gap-2"
                  onClick={() => clearQueue()}
                  title="나만의 아이보리 전체 삭제"
                >
                  모두 삭제
                </button>
              </div>

              {queue.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#7342ff]/20 to-[#db65d1]/20 flex items-center justify-center">
                    <ListMusic className="w-12 h-12 text-[#7342ff]" />
                  </div>
                  <h2 className="text-2xl text-white font-bold mb-3">아직 음악이 없습니다</h2>
                  <p className="text-[#747798] mb-6">음악을 검색해서 "음악 추가"를 눌러보세요</p>
                  <button
                    onClick={() => setCurrentPage('main')}
                    className="px-6 py-3 bg-gradient-to-r from-[#7342ff] to-[#db65d1] rounded-lg text-white hover:from-[#6235e6] hover:to-[#c554be] font-medium"
                  >
                    음악 검색하러 가기
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {queue.map((t, i) => (
                    <div 
                      key={t.id + '-' + i} 
                      className={`group relative rounded-xl transition-all p-4 ${
                        currentIndex === i 
                          ? 'bg-gradient-to-r from-[#7342ff]/30 to-[#db65d1]/30 border-2 border-[#7342ff] shadow-lg' 
                          : 'bg-[#131739]/80 hover:bg-[#1a1f4a] border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-[#a5a6b9] font-bold text-lg w-8">#{i + 1}</div>
                        {t.imageUrl && (
                          <img 
                            src={t.imageUrl} 
                            alt={t.name}
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white text-lg font-bold truncate mb-1">{t.name}</h3>
                          <p className="text-[#a5a6b9] truncate">{t.artist}</p>
                          {currentIndex === i && (
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex gap-1">
                                <span className="w-1 h-4 bg-[#7342ff] rounded-full animate-pulse"></span>
                                <span className="w-1 h-4 bg-[#7342ff] rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></span>
                                <span className="w-1 h-4 bg-[#7342ff] rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></span>
                              </div>
                              <span className="text-sm text-[#7342ff] font-bold">재생 중</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            className="px-4 py-2 bg-gradient-to-r from-[#7342ff] to-[#db65d1] text-white rounded-lg hover:from-[#6235e6] hover:to-[#c554be] font-medium transition-all flex items-center gap-2"
                            onClick={() => playAt(i)}
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                            재생
                          </button>
                          <button 
                            className="p-2 text-[#a5a6b9] hover:text-red-400 transition-colors"
                            onClick={() => removeFromQueue(i)}
                            title="삭제"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 메인 페이지 (기존 내용) */}
        {currentPage === "main" && (
          <>
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0b0d21]/80 border-b border-[#060629]">
          <div className="container mx-auto px-8 py-6">
            <div className="flex items-center justify-between mb-6 justify-center">
              <h1 className="text-2xl text-white font-bold">
                AIVORY의 음악 세계에 오신 것을 환영합니다! 빠른 검색으로 음악을 찾아보세요!🎵
              </h1>
            </div>

            <SearchBar onSearch={handleSearch} />
          </div>
        </header>

        {/* Content */}
        <main className="container mx-auto px-8 py-8">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-8 bg-[#131739] border border-[#060629]">
              <TabsTrigger
                value="discover"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#7342ff] data-[state=active]:to-[#db65d1] data-[state=active]:text-white"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                오늘의 인기
              </TabsTrigger>
              <TabsTrigger
                value="search"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#7342ff] data-[state=active]:to-[#db65d1] data-[state=active]:text-white"
              >
                <Music2 className="w-4 h-4 mr-2" />
                검색
              </TabsTrigger>
              <TabsTrigger
                value="playlists"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#7342ff] data-[state=active]:to-[#db65d1] data-[state=active]:text-white"
              >
                <ListMusic className="w-4 h-4 mr-2" />
                플레이리스트
              </TabsTrigger>
            </TabsList>

            <TabsContent value="discover">
              <div className="space-y-12">
                {POPULAR_TRACKS.map((category) => (
                  <div key={category.id}>
                    <div className="flex items-center justify-left mb-6">
                      <h2 className="text-white text-2xl tracking-tight">
                        {category.name}
                      </h2>
                    </div>
                    {/* Render official chart/playlist tracks for each category */}
                    <SpotifyChartSection
                      title={category.name}
                      query={category.query}
                      onPlay={playNow}
                      onAddToQueue={addToQueue}
                      onStartContextPlay={startContextPlay}
                      onAddChartToQueue={addChartToQueue}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="search">
              {searchQuery ? (
                <div className="space-y-8">
                  <SpotifyTrackResults query={searchQuery} onTrackPlay={playNow} onAddToQueue={addToQueue} />
                  <SpotifyResults
                    query={searchQuery}
                    onArtistClick={setSelectedArtist}
                  />
                </div>
              ) : (
                <div className="text-center py-16 bg-[#131739] rounded-2xl border border-[#060629]">
                  <Music2 className="w-16 h-16 mx-auto text-[#747798] mb-4" />
                  <p className="text-[#747798] mb-2">
                    아티스트나 노래를 검색해보세요
                  </p>
                  <p className="text-sm text-[#747798]/60">
                    한글로 "아이유 좋은날", "BTS Dynamite" 등
                    검색 가능
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="playlists">
              <KoreanPlaylists />
            </TabsContent>
          </Tabs>
        </main>

        {/* Footer */}
        <footer className="bg-[#131739] border-t border-[#060629] py-12 mt-16">
          <div className="container mx-auto px-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7342ff] to-[#db65d1] p-0.5 flex-shrink-0">
                <div className="w-full h-full rounded-full bg-[#131739] flex items-center justify-center p-1 overflow-hidden">
                  <div className="w-7 h-7">
                    <Group12 />
                  </div>
                </div>
              </div>
              <span className="text-white">
                AIVORY 음악을 느끼다!
              </span>
            </div>
            <p className="text-[#747798] text-sm">
              Powered by Spotify API, YouTube Data API
              <br />
              <span className="text-[#9ca3af]">© 2025 AIVORY. All rights reserved from Jin</span>
              <br />
              <span className="text-[#9ca3af]">교육용 학생 포트폴리오로 상업목적이 없음을 알려드립니다.</span>
            </p>
          </div>
        </footer>
          </>
        )}
      </div>

      <GlobalMusicPlayer 
        track={currentTrack}
        onClose={() => { setCurrentIndex(null); }}
        onNext={playNext}
        onPrev={playPrev}
      />
      {/* Toasts - bottom-left */}
      <div className="fixed left-4 bottom-4 z-[60] flex flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className="bg-gradient-to-r from-[#111827] to-[#1a1f4a] text-white px-4 py-3 rounded-lg shadow-2xl border-2 border-[#7342ff] flex items-center gap-3 animate-slide-up">
            <div className="text-sm font-medium flex-1">{t.msg}</div>
            <div className="flex items-center gap-2">
              {t.action && (
                <button 
                  className="text-sm px-3 py-1 bg-gradient-to-r from-[#7342ff] to-[#db65d1] rounded hover:from-[#6235e6] hover:to-[#c554be] font-medium"
                  onClick={() => {
                    t.action!.onClick();
                    setToasts((s) => s.filter(x => x.id !== t.id));
                  }}
                >
                  {t.action.label}
                </button>
              )}
              <button className="text-xs text-[#9ca3af] hover:text-white" onClick={() => setToasts((s) => s.filter(x => x.id !== t.id))}>✕</button>
            </div>
          </div>
        ))}
      </div>
      </div>
    </>
  );
}