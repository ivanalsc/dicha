import { motion } from 'framer-motion';
import { Button } from './ui/button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    children: React.ReactNode;
  }

export const Modal = ({ isOpen, onClose, onSubmit, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 z-50">
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Editar álbum</h2>
          <Button onClick={onClose} variant="ghost">X</Button>
        </div>
        <form onSubmit={onSubmit}>
          {children}
          <div className="flex justify-end mt-4">
            <Button type="submit" variant="default">Guardar cambios</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
