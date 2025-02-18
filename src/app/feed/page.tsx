import AlbumForm from "@/components/AlbumForm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Feed() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/"); // Redirige a la página de inicio si el usuario no está autenticado
  }

  return (
    <div>
      <h1>Feed</h1>
      <p>Bienvenido al feed, {user.email}!</p>
      <AlbumForm />
    </div>
  );
}