import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/feed"); // Redirige a /feed si el usuario está autenticado
  }

  return (
    <div>
      <h1>Bienvenido a Dicha App</h1>
      <p>Por favor, inicia sesión para continuar.</p>
    </div>
  );
}