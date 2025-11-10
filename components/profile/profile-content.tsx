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
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">{t('title')}</h1>
          <p className="text-slate-600 mt-2">{t('subtitle')}</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Left Column - Image */}
            <div className="shrink-0 md:w-1/3 p-8 bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center md:border-r md:border-slate-200">
              <ProfileImage image={currentUser.image} name={currentUser.name} />
            </div>

            {/* Divider Line */}
            <div className="hidden md:block w-px bg-slate-200" />

            {/* Right Column - Info */}
            <div className="grow md:w-2/3 p-8 relative">
              {/* Edit Button */}
              <button
                onClick={handleEditOpen}
                className="absolute right-2 bottom-3 p-2 rounded-lg hover:bg-slate-100 transition-colors group cursor-pointer"
                title="Editar perfil"
                aria-label="Editar perfil"
              >
                <Edit2 className="w-5 h-5 text-slate-600 group-hover:text-slate-900 transition-colors" />
              </button>

              {/* Profile Info */}
              <ProfileInfo user={currentUser} />
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <ChangePasswordCard />

        {/* Delete Account Card */}
        <DeleteAccountCard />
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
