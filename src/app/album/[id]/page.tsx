'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import {  use } from 'react';

interface Album {
  id: number;
  title: string;
  location: string;
  description: string;
  is_public: boolean;
}

export default function AlbumDetail({ params }: { params: Promise<{ id: string }> }) {
  // Desempaquetamos params usando React.use()
  const { id } = use(params); 

  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlbum = async () => {
      const { data, error } = await supabase
        .from('albums')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        alert(error.message);
      } else {
        setAlbum(data);
      }

      setLoading(false);
    };

    fetchAlbum();
  }, [id]);

  if (loading) return <div>Loading...</div>;

  if (!album) return <div>Álbum no encontrado.</div>;

  return (
    <div className="max-w-lg mx-auto p-6 bg-[#f9f5f0] shadow-md rounded-xl">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{album.title}</h2>
      <p className="text-sm text-gray-600">{album.location}</p>
      <p className="mt-4">{album.description}</p>
      <div className="mt-2">
        <span className={`text-sm ${album.is_public ? 'text-green-600' : 'text-gray-500'}`}>
          {album.is_public ? 'Público' : 'Privado'}
        </span>
      </div>
    </div>
  );
}
