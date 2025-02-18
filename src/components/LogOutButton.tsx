import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Dialog,  DialogClose, DialogFooter, DialogHeader, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { DialogContent, DialogTitle } from "@radix-ui/react-dialog";


const LogoutButton = () => {
    const [open, setOpen] = useState(false);
    const router = useRouter(); // Ahora usamos el router de next/navigation
  
    const handleLogout = async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error al cerrar sesión:", error.message);
      } else {
        
        router.push("/"); 
      }
    };
  
    return (
      <>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary">Cerrar sesión</Button>
          </DialogTrigger>
  
          <DialogContent>
            <DialogHeader>
              <DialogTitle>¿Seguro que querés cerrar sesión?</DialogTitle>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={handleLogout}>Cerrar sesión</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  };
  
  export default LogoutButton;
