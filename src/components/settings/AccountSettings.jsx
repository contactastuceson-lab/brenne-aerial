import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Upload, Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function AccountSettings({ user }) {
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    display_name: user?.display_name || '',
    bio: user?.bio || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [passwordErrors, setPasswordErrors] = useState({});
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const updateMutation = useMutation({
    mutationFn: async (updates) => {
      await base44.auth.updateMe(updates);
      await base44.functions.invoke('logAuditAction', {
        user_email: user.email,
        action_type: 'profile_updated',
        description: 'Profil mis à jour',
        is_sensitive: false,
      });
    },
    onSuccess: () => {
      toast.success('Profil mis à jour');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    },
  });

  const passwordMutation = useMutation({
    mutationFn: async (passwords) => {
      if (passwords.new_password !== passwords.confirm_password) {
        const err = new Error('Les mots de passe ne correspondent pas');
        throw err;
      }

      if (passwords.new_password.length < 8) {
        const err = new Error('Le mot de passe doit contenir au moins 8 caractères');
        throw err;
      }

      // Verify current password and update
      await base44.auth.changePassword({
        current_password: passwords.current_password,
        new_password: passwords.new_password,
      });

      // Log the password change
      await base44.functions.invoke('logAuditAction', {
        user_email: user.email,
        action_type: 'password_changed',
        description: 'Mot de passe modifié',
        is_sensitive: true,
      });
    },
    onSuccess: () => {
      toast.success('Mot de passe mis à jour');
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      setShowPasswordForm(false);
      setPasswordErrors({});
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de la mise à jour du mot de passe');
      setPasswordErrors({
        submit: error.message,
      });
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const validatePassword = (password) => {
    const errors = {};
    if (password.length < 8) errors.length = true;
    if (!/[A-Z]/.test(password)) errors.uppercase = true;
    if (!/[0-9]/.test(password)) errors.number = true;
    if (!/[^a-zA-Z0-9]/.test(password)) errors.special = true;
    return errors;
  };

  const passwordValidation = validatePassword(passwordForm.new_password);

  const saveProfile = () => {
    updateMutation.mutate(formData);
  };

  const savePassword = () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordErrors({ match: true });
      return;
    }
    passwordMutation.mutate(passwordForm);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Personal Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6"
        style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <User className="w-5 h-5 text-blue-500" />
          </div>
          <h3 className="font-grotesk font-semibold text-base">Informations personnelles</h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-inter text-sm font-medium mb-2">Prénom</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                placeholder="Votre prénom"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background/50 font-inter text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-inter text-sm font-medium mb-2">Nom</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                placeholder="Votre nom"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background/50 font-inter text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block font-inter text-sm font-medium mb-2">Nom d'affichage</label>
            <input
              type="text"
              name="display_name"
              value={formData.display_name}
              onChange={handleInputChange}
              placeholder="Votre nom d'affichage"
              className="w-full px-4 py-2 rounded-lg border border-border bg-background/50 font-inter text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block font-inter text-sm font-medium mb-2">Biographie</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Parlez-vous de vous..."
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background/50 font-inter text-sm focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <Button
            onClick={saveProfile}
            disabled={updateMutation.isPending}
            className="w-full gap-2"
          >
            {updateMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Check className="w-4 h-4" />
                Sauvegarder les informations
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Email Address */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl p-6"
        style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
            <Mail className="w-5 h-5 text-orange-500" />
          </div>
          <h3 className="font-grotesk font-semibold text-base">Adresse email</h3>
        </div>

        <div className="p-4 rounded-lg bg-background/50 border border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-inter text-sm font-medium">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <p className="font-inter text-xs text-muted-foreground">Vérifiée</p>
              </div>
            </div>
          </div>
          <p className="font-inter text-xs text-muted-foreground mt-3">
            Pour changer votre email, veuillez contacter le support
          </p>
        </div>
      </motion.div>

      {/* Password */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl p-6"
        style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center">
            <Lock className="w-5 h-5 text-red-500" />
          </div>
          <h3 className="font-grotesk font-semibold text-base">Mot de passe</h3>
        </div>

        {!showPasswordForm ? (
          <Button
            onClick={() => setShowPasswordForm(true)}
            variant="outline"
            className="w-full gap-2"
          >
            <Lock className="w-4 h-4" />
            Changer le mot de passe
          </Button>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="block font-inter text-sm font-medium mb-2">Mot de passe actuel</label>
              <input
                type="password"
                name="current_password"
                value={passwordForm.current_password}
                onChange={handlePasswordChange}
                placeholder="•••••••••"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background/50 font-inter text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block font-inter text-sm font-medium mb-2">Nouveau mot de passe</label>
              <input
                type="password"
                name="new_password"
                value={passwordForm.new_password}
                onChange={handlePasswordChange}
                placeholder="•••••••••"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background/50 font-inter text-sm focus:outline-none focus:border-primary"
              />

              {passwordForm.new_password && (
                <div className="mt-3 space-y-2">
                  <div className="relative">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        background: Object.keys(passwordValidation).length === 0 ? '#10b981' :
                                  Object.keys(passwordValidation).length <= 2 ? '#f59e0b' : '#ef4444',
                        width: `${((4 - Object.keys(passwordValidation).length) / 4) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      {!passwordValidation.length ? (
                        <Check className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-gray-400" />
                      )}
                      <span>8+ caractères</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {!passwordValidation.uppercase ? (
                        <Check className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-gray-400" />
                      )}
                      <span>Une majuscule</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {!passwordValidation.number ? (
                        <Check className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-gray-400" />
                      )}
                      <span>Un chiffre</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {!passwordValidation.special ? (
                        <Check className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-gray-400" />
                      )}
                      <span>Caractère spécial</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block font-inter text-sm font-medium mb-2">Confirmer le mot de passe</label>
              <input
                type="password"
                name="confirm_password"
                value={passwordForm.confirm_password}
                onChange={handlePasswordChange}
                placeholder="•••••••••"
                className={`w-full px-4 py-2 rounded-lg border bg-background/50 font-inter text-sm focus:outline-none ${
                  passwordErrors.match ? 'border-red-500' : 'border-border focus:border-primary'
                }`}
              />
              {passwordErrors.match && (
                <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas</p>
              )}
            </div>

            {passwordErrors.submit && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="font-inter text-xs text-red-600">{passwordErrors.submit}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={savePassword}
                disabled={passwordMutation.isPending || !passwordForm.current_password || !passwordForm.new_password}
                className="flex-1 gap-2"
              >
                {passwordMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Confirmer
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
                  setPasswordErrors({});
                }}
                variant="outline"
                className="flex-1"
              >
                Annuler
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
