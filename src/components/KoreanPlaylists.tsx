import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import {
  ExternalLink,
  Music2,
  Users,
  Play,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import {
  getKoreanPlaylists,
  getCategoryPlaylists,
  SpotifyPlaylist,
} from "../utils/spotify";

const CATEGORIES = [
  { id: "all", name: "전체", query: "kpop korean" },
  { id: "kpop", name: "K-Pop", query: "kpop" },
  { id: "khiphop", name: "K-Hip Hop", query: "korean hip hop" },
  { id: "krnb", name: "K-R&B", query: "korean rnb" },
  { id: "kindie", name: "K-Indie", query: "korean indie" },
];

export function KoreanPlaylists() {
  const [selectedCategory, setSelectedCategory] =
    useState("all");
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaylists = async () => {
      setLoading(true);

      let results = [];
      if (selectedCategory === "all") {
        results = await getKoreanPlaylists();
      } else {
        const category = CATEGORIES.find(
          (c) => c.id === selectedCategory,
        );
        if (category) {
          results = await getCategoryPlaylists(category.query);
        }
      }

      // null 값 필터링 및 중복 제거
      const uniquePlaylists = results
        .filter((playlist) => playlist && playlist.id)
        .filter(
          (playlist, index, self) =>
            index ===
            self.findIndex((p) => p && p.id === playlist.id),
        );

      setPlaylists(uniquePlaylists);
      setLoading(false);
    };

    fetchPlaylists();
  }, [selectedCategory]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
          <Music2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-sm text-white">
            AIVORY 음악을 즐기다!
          </h2>
          <p className="text-sm text-gray-600">
            Spotify와 Youtube에서 큐레이션한 한국음악을 만나보세요!
          </p>
        </div>
      </div>

      <Tabs
        value={selectedCategory}
        onValueChange={setSelectedCategory}
        className="w-full mb-6"
      >
        <TabsList className="grid w-full grid-cols-5">
          {CATEGORIES.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="w-full aspect-square" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : playlists.length === 0 ? (
        <Card className="bg-gray-50">
          <CardContent className="p-8 text-center">
            <Music2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">
              플레이리스트를 찾을 수 없습니다.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {playlists.map((playlist, index) => (
            <Card
              key={`${playlist.id}-${index}`}
              className="hover:shadow-xl transition-all overflow-hidden group"
            >
              <div className="relative w-full aspect-square bg-gradient-to-br from-green-100 to-emerald-100">
                {playlist.images && playlist.images[0] ? (
                  <img
                    src={playlist.images[0].url}
                    alt={playlist.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music2 className="w-16 h-16 text-green-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <div className="w-full flex gap-2">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      asChild
                    >
                      <a
                        href={playlist.external_urls.spotify}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Spotify
                      </a>
                    </Button>
                    <Button
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      asChild
                    >
                      <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(playlist.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        YouTube
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-base line-clamp-2">
                  {playlist.name}
                </CardTitle>
                <CardDescription className="text-xs line-clamp-2">
                  {playlist.description ||
                    `by ${playlist.owner.display_name}`}
                </CardDescription>
                <div className="flex items-center gap-1 text-xs text-gray-600 mt-2">
                  <Music2 className="w-3 h-3" />
                  <span>{playlist.tracks.total} 곡</span>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}