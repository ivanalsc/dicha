// Header.tsx
"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import AuthModal from "./AuthModal";
import { useState } from "react";
import LogoutButton from "./LogOutButton";
import { useUser } from "@/context/UserContext"; // Usamos el hook del contexto

export default function Header() {
  const { user } = useUser(); // Accedemos al `user` desde el contexto
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="flex justify-between p-4 border-b">
      <Link href="/" className="text-xl font-bold">Dicha</Link>
      {user ? (
        <div>
          <Link href="/perfil" className="text-sm">
            Hola, {user.email}
          </Link>
          <LogoutButton />
        </div>
      ) : (
        <div>
          <Button onClick={() => setIsOpen(!isOpen)} className="text-sm">Iniciar sesión</Button>
          <AuthModal open={isOpen} onClose={() => setIsOpen(false)} />
        </div>
      )}
    </header>
  );
}
