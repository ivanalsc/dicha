import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function middleware(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Redirige a /feed si el usuario está autenticado y trata de acceder a la página de inicio
  if (user && req.url.endsWith("/")) {
    return NextResponse.redirect(new URL("/feed", req.url));
  }

  // Redirige a la página de inicio si el usuario no está autenticado y trata de acceder a /feed
  if (!user && req.url.endsWith("/feed")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}