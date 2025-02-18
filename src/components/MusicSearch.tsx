import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Song } from '@/app/album/[id]/page';

interface MusicSearchProps {
  setSelectedSong: React.Dispatch<React.SetStateAction<Song | null>>;
}

const searchMusicBrainz = async (query: string) => {
  try {
    const response = await fetch(
      `https://musicbrainz.org/ws/2/recording?query=recording:${query}&fmt=json`
    );
    const data = await response.json();

    if (data?.recordings) {
      return data.recordings.map((item: any) => ({
        title: item.title,
        artist: item['artist-credit']
          .map((credit: any) => credit.name)
          .join(', '),
        album: item.releases?.[0]?.title || 'Unknown album',
      }));
    }

    return [];
  } catch (error) {
    console.error('Error fetching from MusicBrainz:', error);
    return [];
  }
};

const MusicSearch: React.FC<MusicSearchProps> = ({ setSelectedSong }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [songSelected, setSongSelected] = useState<Song | null>(null);

  const handleSelectSong = (song: Song) => {
    setSelectedSong(song); // Actualiza el estado con la canción seleccionada
    setSongSelected(song); // Guarda la canción seleccionada
    setResults([]); // Oculta los resultados una vez seleccionada la canción
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (!query) return;

      setLoading(true);
      const searchResults = await searchMusicBrainz(query);
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
          {loading && <div className="mt-4">Buscando...</div>}

          {results.length > 0 && (
            <div className="mt-6">
              {results.map((result, index) => (
                <Card
                  key={index}
                  className="my-4 cursor-pointer"
                  onClick={() => handleSelectSong(result)}
                >
                  <div className="flex items-center space-x-4">
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
        <div>
          <h2 className="text-xl font-semibold">Canción seleccionada</h2>
          <div className="mt-4">
            <h3 className="text-lg font-semibold">{songSelected.title}</h3>
            <p className="text-sm text-gray-600">Por {songSelected.artist}</p>
            <p className="text-sm text-gray-600">{songSelected.album}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicSearch;
