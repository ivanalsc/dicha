'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

export default function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setLoading(false);
    if (error) alert(error.message);
    else alert('Revisa tu email para iniciar sesión.');
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) alert(error.message);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#f9f5f0] text-gray-900 rounded-2xl shadow-lg w-full max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Iniciar sesión</DialogTitle>
        </DialogHeader>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Input
            type="email"
            placeholder="Ingresa tu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2"
          />
          <Button onClick={handleSignIn} className="mt-4 w-full" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar enlace'}
          </Button>
          <div className="mt-4 text-center text-sm text-gray-600">O</div>
          <Button onClick={handleGoogleSignIn} className="mt-4 w-full bg-blue-600 text-white">
            Iniciar con Google
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
