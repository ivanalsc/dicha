// app/my-albums/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface Album {
  id: number;
  title: string;
  location: string;
  description: string;
  is_public: boolean;
}

export default function MyAlbums() {
  const [albums, setAlbums] = useState<Album[]>([]);
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

      const { data, error } = await supabase
        .from('albums')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        alert(error.message);
      } else {
        setAlbums(data || []);
      }

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
