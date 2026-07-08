'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Edit2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { ProfileImage } from './profile-image';
import { ProfileInfo } from './profile-info';
import { EditProfileModal } from './edit-profile-modal';
import { ChangePasswordCard } from './change-password-card';
import { DeleteAccountCard } from './delete-account-card';

interface User {
  id?: string;
  email?: string;
  name?: string | null;
  image?: string | null;
  provider?: string;
}

interface ProfileContentProps {
  user?: User;
}

export function ProfileContent({ user }: ProfileContentProps) {
  const t = useTranslations('profile');
  const { update } = useSession();
  const [isEditingOpen, setIsEditingOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>(user || {});

  const handleEditOpen = () => {
    setIsEditingOpen(true);
  };

  const handleEditClose = () => {
    setIsEditingOpen(false);
  };

  const handleSaveProfile = async (updatedData: { name?: string; email?: string; image?: string }) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      const result = await response.json();
      console.log('Respuesta del servidor:', result, 'Status:', response.status);

      if (!response.ok) {
        console.error('Error del servidor:', result);
        
        // Error específico para email duplicado
        if (response.status === 409) {
          const errorMessage = result?.error || 'Este correo electrónico ya está siendo utilizado';
          const error = new Error(errorMessage);
          (error as any).fieldError = { email: errorMessage };
          throw error;
        }
        
        const errorMessage = result?.error || 'Error al actualizar el perfil';
        throw new Error(errorMessage);
      }

      // Actualizar el estado local con los datos nuevos
      if (result.success && result.user) {
        setCurrentUser(result.user);
        
        // Actualizar la sesión de NextAuth
        await update({
          ...result.user,
        });
        
        setIsEditingOpen(false);
      }
    } catch (error) {
      console.error('Error al guardar perfil:', error);
      
      // Propagar el error con la información del campo para que el modal lo maneje
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Error al actualizar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <>
      <div className="mx-auto max-w-5xl space-y-10">
        {/* Header */}
        <header className="tk-rise">
          <p className="font-mono text-[10px] tracking-[0.4em] text-ash">
            TIKIT / {new Date().getFullYear()} — FICHA DE CLIENTE
          </p>
          <h1 className="tk-display mt-3 text-[clamp(2.4rem,7vw,5.5rem)]">
            {t('title')}
            <span className="text-thermal">.</span>
          </h1>
          <p className="mt-3 max-w-xl font-mono text-sm text-ink-2">{t('subtitle')}</p>
        </header>

        {/* Profile Card */}
        <div className="tk-rise tk-card overflow-hidden" style={{ animationDelay: '0.1s' }}>
          <div className="flex flex-col md:flex-row">
            {/* Left Column - Image */}
            <div className="flex shrink-0 items-center justify-center border-b-2 border-ink bg-paper-2 p-8 md:w-1/3 md:border-b-0 md:border-r-2">
              <ProfileImage image={currentUser.image} name={currentUser.name} />
            </div>

            {/* Right Column - Info */}
            <div className="relative grow p-8 md:w-2/3">
              {/* Edit Button */}
              <button
                onClick={handleEditOpen}
                className="group absolute right-4 top-4 cursor-pointer border-2 border-ink bg-receipt p-2 transition-all duration-200 hover:bg-ink hover:shadow-[4px_4px_0_0_var(--color-thermal)]"
                title="Editar perfil"
                aria-label="Editar perfil"
              >
                <Edit2 className="h-4 w-4 text-ink transition-colors group-hover:text-paper" />
              </button>

              {/* Profile Info */}
              <ProfileInfo user={currentUser} />
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="tk-rise" style={{ animationDelay: '0.2s' }}>
          <ChangePasswordCard />
        </div>

        {/* Delete Account Card */}
        <div className="tk-rise" style={{ animationDelay: '0.3s' }}>
          <DeleteAccountCard />
        </div>
      </div>

      {/* Edit Modal */}
      <EditProfileModal
        isOpen={isEditingOpen}
        onClose={handleEditClose}
        onSave={handleSaveProfile}
        user={currentUser}
        isLoading={isLoading}
      />
    </>
  );
}
