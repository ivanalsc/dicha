'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import { Label } from "@/components/ui/label";
import { fetchPlaces } from '@/lib/helpers';

export default function AlbumForm() {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [suggestions, setSuggestions] = useState<{ label: string; value: string }[]>([]);
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // Estado para controlar el mensaje de éxito
  const router = useRouter();

  useEffect(() => {
    if (!location) {
      setSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      const places = await fetchPlaces(location);
      setSuggestions(places);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [location]);

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      alert("No se pudo obtener el usuario");
      setLoading(false);
      return;
    }

    // Aquí cambiamos la lógica para actualizar el álbum
    const { error } = await supabase
      .from("albums")
      .upsert([
        {
          title,
          location,
          description,
          is_public: isPublic,
          user_id: user.id,
        },
      ]);

    setLoading(false);
    if (error) alert(error.message);
    else {
      setIsSuccess(true); // Mostrar mensaje de éxito
      setTimeout(() => {
        setIsSuccess(false); // Limpiar el mensaje después de 3 segundos
        router.push("/feed"); // Redirigir después de un tiempo
      }, 3000); // 3000 ms = 3 segundos
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto p-6 bg-[#f9f5f0] shadow-md rounded-xl">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Actualizar álbum</h2>

      {isSuccess && (
        <div className="p-4 mb-4 bg-green-100 text-green-800 rounded-md border border-green-200">
          ¡Álbum actualizado con éxito!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          placeholder="Título del álbum"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Label htmlFor="location">Ubicación</Label>
        <Input id="location" value={location} onChange={handleLocationChange} placeholder="Ej: Buenos Aires" />

        {suggestions.length > 0 && (
          <ul className="bg-white border mt-1 rounded-md shadow">
            {suggestions.map((place, index) => (
              <li
                key={index}
                className="p-2 hover:bg-gray-200 cursor-pointer"
                onClick={() => {
                  setLocation(place.value);
                  setSuggestions([]); // Cierra la lista
                }}
              >
                {place.label}
              </li>
            ))}
          </ul>
        )}

        <Textarea
          placeholder="Describe tu experiencia"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="resize-none"
        />

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Álbum público</span>
          <Switch checked={isPublic} onCheckedChange={setIsPublic} />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Actualizando...' : 'Actualizar álbum'}
        </Button>
      </form>
    </motion.div>
  );
}
