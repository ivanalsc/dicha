'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';

interface Album {
  id: number;
  title: string;
  location: string;
  description: string;
  is_public: boolean;
}

interface AlbumMedia {
  id: number;
  album_id: number;
  type: string;
  url: string;
  content?: string;
}

export default function MyAlbums() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [albumMedia, setAlbumMedia] = useState<{ [key: number]: AlbumMedia[] }>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchAlbums = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert('No se pudo obtener el usuario');
        setLoading(false);
        return;
      }

      const { data: albumsData, error: albumsError } = await supabase
        .from('albums')
        .select('*')
        .eq('user_id', user.id);

      if (albumsError) {
        alert(albumsError.message);
        setLoading(false);
        return;
      }

      setAlbums(albumsData || []);
      
      const mediaPromises = albumsData.map(async (album) => {
        const { data: mediaData, error: mediaError } = await supabase
          .from('album_media')
          .select('*')
          .eq('album_id', album.id);
        
        if (mediaError) return { [album.id]: [] };
        return { [album.id]: mediaData };
      });

      const mediaResults = await Promise.all(mediaPromises);
      setAlbumMedia(Object.assign({}, ...mediaResults));
      setLoading(false);
    };

    fetchAlbums();
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto p-6 bg-[#f9f5f0] shadow-md rounded-xl">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Mis Álbumes</h2>
      {loading ? (
        <div className="text-center">Cargando...</div>
      ) : (
        <>
          {albums.length === 0 ? (
            <div className="text-center">No tienes álbumes creados.</div>
          ) : (
            <ul className="space-y-4">
              {albums.map((album) => (
                <li key={album.id} className="p-4 bg-white shadow rounded-md">
                  <h3 className="font-semibold text-lg">{album.title}</h3>
                  <p className="text-sm text-gray-600">{album.location}</p>
                  <p className="text-gray-800 mt-2">{album.description}</p>
                  {albumMedia[album.id] && albumMedia[album.id].length > 0 && (
                    <Swiper
                      modules={[Pagination]}
                      pagination={{ clickable: true }}
                      spaceBetween={10}
                      slidesPerView={1}
                      className="mt-4"
                    >
                      {albumMedia[album.id].map((media) => {
                        let parsedContent;
                        try {
                          parsedContent = media.content && media.content.startsWith('{')
                            ? JSON.parse(media.content)
                            : { content: media.content };
                        } catch (error) {
                          console.error('Error parsing JSON:', error);
                          parsedContent = { content: media.content };
                        }
                        return (
                          <SwiperSlide key={media.id} className="flex justify-center">
                            {media.type === 'image' && (
                              <img src={media.url} alt="Album Media" className="w-full h-60 object-cover rounded-md" />
                            )}
                            {media.type === 'music' && (
                              <div className="flex flex-col items-center">
                                <img src={parsedContent.imageUrl || '/placeholder-music.jpg'} alt="Music Cover" className="w-40 h-40 object-cover rounded-md" />
                                <p className="mt-2 text-sm text-gray-700 font-semibold">{parsedContent.title || 'Canción sin título'}</p>
                                <p className="text-xs text-gray-600">{parsedContent.artist || 'Artista desconocido'}</p>
                              </div>
                            )}
                            {media.type === 'text' && (
                              <p className="p-4 bg-gray-100 rounded-md">{parsedContent.content || 'Texto no disponible'}</p>
                            )}
                          </SwiperSlide>
                        );
                      })}
                    </Swiper>
                  )}
                  <div className="mt-2 flex items-center justify-between">
                    <span className={`text-sm ${album.is_public ? 'text-green-600' : 'text-gray-500'}`}>
                      {album.is_public ? 'Público' : 'Privado'}
                    </span>
                    <Button onClick={() => router.push(`/album/${album.id}`)}>Ver álbum</Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </motion.div>
  );
}
