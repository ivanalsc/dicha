import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Loader } from 'lucide-react';

interface Song {
  title: string;
  artist: string;
  album: string;
  imageUrl: string;
}

interface MusicSearchProps {
  setSelectedSong: React.Dispatch<React.SetStateAction<Song | null>>;
  onSaveSong: (song: Song) => Promise<void>;
}

const searchMusic = async (query: string): Promise<Song[]> => {
  try {
    const response = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=10`
    );
    const data = await response.json();

    if (data?.results) {
      return data.results.map((item: any) => ({
        title: item.trackName,
        artist: item.artistName,
        album: item.collectionName,
        // Obtenemos una imagen más grande reemplazando 100x100 por 600x600
        imageUrl: item.artworkUrl100.replace('100x100', '600x600')
      }));
    }

    return [];
  } catch (error) {
    console.error('Error fetching from iTunes:', error);
    return [];
  }
};

const MusicSearch: React.FC<MusicSearchProps> = ({ setSelectedSong, onSaveSong }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [songSelected, setSongSelected] = useState<Song | null>(null);

  const handleSelectSong = async (song: Song) => {
    setSelectedSong(song);
    setSongSelected(song);
    setResults([]);
    try {
      await onSaveSong(song);
    } catch (error) {
      console.error('Error saving song:', error);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (!query) return;

      setLoading(true);
      const searchResults = await searchMusic(query);
      setResults(searchResults);
      setLoading(false);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div className="p-6">
      {!songSelected ? (
        <>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar música..."
            className="mb-4"
          />
          {loading && (
            <div className="flex items-center justify-center mt-4">
              <Loader className="w-6 h-6 animate-spin mr-2" />
              <span>Buscando...</span>
            </div>
          )}

          {results.length > 0 && (
            <div className="mt-6 grid gap-4">
              {results.map((result, index) => (
                <Card
                  key={index}
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleSelectSong(result)}
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={result.imageUrl}
                      alt={`${result.album} cover`}
                      className="w-16 h-16 object-cover rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/api/placeholder/200/200';
                      }}
                    />
                    <div>
                      <h3 className="text-lg font-semibold">{result.title}</h3>
                      <p className="text-sm text-gray-600">Por {result.artist}</p>
                      <p className="text-sm text-gray-600">{result.album}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="bg-white p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Canción seleccionada</h2>
          <div className="flex items-center space-x-4">
            <img
              src={songSelected.imageUrl}
              alt={`${songSelected.album} cover`}
              className="w-24 h-24 object-cover rounded"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/api/placeholder/200/200';
              }}
            />
            <div>
              <h3 className="text-lg font-semibold">{songSelected.title}</h3>
              <p className="text-sm text-gray-600">Por {songSelected.artist}</p>
              <p className="text-sm text-gray-600">{songSelected.album}</p>
            </div>
          </div>
          <Button
            onClick={() => setSongSelected(null)}
            variant="outline"
            className="mt-4"
          >
            Buscar otra canción
          </Button>
        </div>
      )}
    </div>
  );
};

export default MusicSearch;