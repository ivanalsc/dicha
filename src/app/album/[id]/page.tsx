"use client";

import React, { useEffect, useState } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader } from "lucide-react";
import MusicSearch from "@/components/MusicSearch";

interface Album {
  id: string;
  title: string;
  location: string;
  description: string;
  is_public: boolean;
}

interface Media {
  id: string;
  album_id: string;
  type: "image" | "text" | "music";
  url?: string;
  content?: string;
  created_at: string;
}

export interface Song {
  title: string;
  artist: string;
  album: string;
  imageUrl: string;
}

export default function AlbumDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [album, setAlbum] = useState<Album | null>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [editForm, setEditForm] = useState<Album | null>(null);
  const [newText, setNewText] = useState("");
  const [selectedSong, setSelectedSong] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchAlbumAndMedia();
    }
  }, [id]);

  const fetchAlbumAndMedia = async () => {
    try {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        console.error("No session found");
        return;
      }

      const { data: albumData, error: albumError } = await supabase
        .from("albums")
        .select("*")
        .eq("id", id)
        .eq("user_id", session.user.id)
        .single();

      if (albumError) {
        console.error("Error fetching album:", albumError);
        return;
      }

      const { data: mediaData, error: mediaError } = await supabase
        .from("album_media")
        .select("*")
        .eq("album_id", id)
        .order("created_at", { ascending: false });

      if (mediaError) {
        console.error("Error fetching media:", mediaError);
        return;
      }

      setAlbum(albumData);
      setEditForm(albumData);
      setMedia(mediaData || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editForm) return;

    try {
      const { error } = await supabase
        .from("albums")
        .update({
          title: editForm.title,
          location: editForm.location,
          description: editForm.description,
          is_public: editForm.is_public,
        })
        .eq("id", id);

      if (error) throw error;

      setAlbum(editForm);
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleMediaUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "music"
  ) => {
    const files = event.target.files;
    if (!files) return;

    setUploadingMedia(true);

    try {
      const folderPath = `albums/${id}`;
      const uploadPromises = Array.from(files).map((file) => {
        const filePath = `${folderPath}/${Date.now()}-${file.name}`;

        return supabase.storage
          .from("album_media")
          .upload(filePath, file, { cacheControl: "3600", upsert: false })
          .then(() => {
            const {
              data: { publicUrl },
            } = supabase.storage.from("album_media").getPublicUrl(filePath);
            return { type, url: publicUrl };
          });
      });

      const uploadedFiles = await Promise.all(uploadPromises);

      const mediaData = uploadedFiles.map(({ type, url }) => ({
        album_id: id,
        type,
        url,
      }));

      const { error: dbError } = await supabase
        .from("album_media")
        .insert(mediaData);

      if (dbError) throw dbError;

      await fetchAlbumAndMedia();
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleAddText = async () => {
    if (!newText) return;

    try {
      const { error } = await supabase.from("album_media").insert({
        album_id: id,
        type: "text",
        content: newText,
      });

      if (error) throw error;

      setNewText("");
      await fetchAlbumAndMedia();
    } catch (error) {
      console.error("Error adding text:", error);
    }
  };

  const handleDeleteMedia = async (mediaId: string, mediaUrl: string) => {
    try {
      const urlParts = mediaUrl.split("/album_media/");
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from("album_media").remove([filePath]);
      }

      const { error } = await supabase
        .from("album_media")
        .delete()
        .eq("id", mediaId);

      if (error) throw error;

      await fetchAlbumAndMedia();
      router.refresh();
    } catch (error) {
      console.error("Error deleting media:", error);
    }
  };

  const handleSaveSong = async (song: Song) => {
    try {
      const { error } = await supabase.from("album_media").insert({
        album_id: id,
        type: "music",
        url: song.imageUrl,
        content: JSON.stringify(song),
      });

      if (error) throw error;

      await fetchAlbumAndMedia();
      router.refresh();
    } catch (error) {
      console.error("Error saving song:", error);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader className="w-6 h-6 animate-spin" />
      </div>
    );

  if (!album)
    return (
      <div className="text-center p-6 text-gray-500">Álbum no encontrado</div>
    );

  return (
    <Card className="max-w-2xl mx-auto bg-[#f9f5f0] shadow-md">
      <CardContent className="p-6">
        {!isEditing ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">{album.title}</h2>
              <Button
                onClick={handleEdit}
                variant="outline"
                className="bg-white hover:bg-gray-100"
              >
                Editar
              </Button>
            </div>
            <p className="text-sm text-gray-600">{album.location}</p>
            <p className="mt-4 text-gray-700">{album.description}</p>
            <div className="mt-2">
              <span
                className={`text-sm ${
                  album.is_public ? "text-green-600" : "text-gray-500"
                }`}
              >
                {album.is_public ? "Público" : "Privado"}
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              value={editForm?.title}
              onChange={(e) =>
                setEditForm((prev) =>
                  prev ? { ...prev, title: e.target.value } : null
                )
              }
              placeholder="Título"
              className="bg-white"
            />
            <Input
              value={editForm?.location}
              onChange={(e) =>
                setEditForm((prev) =>
                  prev ? { ...prev, location: e.target.value } : null
                )
              }
              placeholder="Ubicación"
              className="bg-white"
            />
            <Textarea
              value={editForm?.description}
              onChange={(e) =>
                setEditForm((prev) =>
                  prev ? { ...prev, description: e.target.value } : null
                )
              }
              placeholder="Descripción"
              className="bg-white"
            />
            <div className="flex items-center space-x-2">
              <Switch
                checked={editForm?.is_public}
                onCheckedChange={(checked) =>
                  setEditForm((prev) =>
                    prev ? { ...prev, is_public: checked } : null
                  )
                }
              />
              <span>Público</span>
            </div>
          </div>
        )}

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Medios</h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Añadir imagen
                </label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleMediaUpload(e, "image")}
                  className="bg-white"
                  disabled={uploadingMedia}
                />
              </div>
              <MusicSearch 
                setSelectedSong={setSelectedSong} 
                onSaveSong={handleSaveSong}
              />
            </div>

            {uploadingMedia && (
              <div className="flex items-center justify-center py-4">
                <Loader className="w-6 h-6 animate-spin mr-2" />
                <span>Subiendo archivo...</span>
              </div>
            )}

            <Textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Añadir nota..."
              className="mt-4 bg-white"
            />
            <Button onClick={handleAddText} variant="outline" className="mt-2">
              Añadir nota
            </Button>

            <div className="grid grid-cols-2 gap-4 mt-4">
              {media.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded-lg shadow relative group"
                >
                  {item.type === "image" && item.url && (
                    <img
                      src={item.url}
                      alt=""
                      className="w-full h-48 object-cover rounded"
                    />
                  )}
                  {item.type === "music" && (
                    <div>
                      {item.url && (
                        <img
                          src={item.url}
                          alt="Album cover"
                          className="w-full h-48 object-cover rounded"
                        />
                      )}
                      {item.content && (
                        <div className="mt-2">
                          {(() => {
                            const songData = JSON.parse(item.content);
                            return (
                              <>
                                <h4 className="font-semibold">{songData.title}</h4>
                                <p className="text-sm text-gray-600">Por {songData.artist}</p>
                                <p className="text-sm text-gray-600">{songData.album}</p>
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  )}
                  {item.type === "text" && item.content && (
                    <p className="text-sm text-gray-700 mt-2">{item.content}</p>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() =>
                      item.url && handleDeleteMedia(item.id, item.url)
                    }
                  >
                    Eliminar
                  </Button>
                </div>
              ))}
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-2 mt-8 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditForm(album);
                  }}
                  className="bg-white hover:bg-gray-100"
                >
                  Cancelar
                </Button>
                <Button onClick={handleSave}>Guardar</Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}