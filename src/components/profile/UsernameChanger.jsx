import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Mail, CheckCircle, Loader2 } from 'lucide-react';

export default function UsernameChanger({ user, username, onUpdate }) {
  const [mode, setMode] = useState('view'); // view | edit | verify
  const [newUsername, setNewUsername] = useState('');
  const [code, setCode] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateUsername = async (un) => {
    if (!un || un.length < 3) {
      setUsernameError('Au minimum 3 caractères');
      return false;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(un)) {
      setUsernameError('Lettres, chiffres, - et _ uniquement');
      return false;
    }
    if (un === username) {
      setUsernameError('Doit être différent du username actuel');
      return false;
    }
    // Check availability
    try {
      const result = await base44.functions.invoke('checkUsernameAvailable', { username: un });
      if (!result.data.available) {
        setUsernameError('Ce username est déjà pris');
        return false;
      }
    } catch {
      setUsernameError('Erreur de vérification');
      return false;
    }
    setUsernameError('');
    return true;
  };

  const handleStartChange = async () => {
    const isValid = await validateUsername(newUsername);
    if (!isValid) return;

    setLoading(true);
    try {
      // Envoyer code de vérification
      await base44.functions.invoke('sendVerificationCode', { email: user.email });
      setCodeSent(true);
      setMode('verify');
      toast.success('Code envoyé à votre email');
    } catch (err) {
      toast.error('Erreur lors de l\'envoi du code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndChange = async () => {
    if (!code || code.length < 4) {
      toast.error('Code invalide');
      return;
    }

    setLoading(true);
    try {
      // Vérifier le code
      const verifyResult = await base44.functions.invoke('verifyEmailCode', {
        email: user.email,
        code,
      });

      if (!verifyResult.data?.verified) {
        toast.error('Code invalide ou expiré');
        setLoading(false);
        return;
      }

      // Mettre à jour le username
      await base44.auth.updateMe({ username: newUsername });
      // Update local state
      onUpdate?.(newUsername);
      
      toast.success('Username changé avec succès !');
      setMode('view');
      setNewUsername('');
      setCode('');
      setCodeSent(false);
    } catch (err) {
      toast.error('Erreur lors du changement de username');
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'view') {
    return (
      <div>
        <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Username</label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
            <Input value={username} disabled className="bg-secondary border-border font-inter pl-7" />
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setMode('edit');
              setNewUsername(username);
            }}
          >
            Changer
          </Button>
        </div>
        <p className="font-inter text-xs text-muted-foreground mt-1">Unique, visible sur votre profil</p>
      </div>
    );
  }

  if (mode === 'edit') {
    return (
      <div>
        <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Nouveau username</label>
        <div className="space-y-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
            <Input
              value={newUsername}
              onChange={(e) => {
                setNewUsername(e.target.value);
                setUsernameError('');
              }}
              placeholder="newusername"
              className="bg-secondary border-border font-inter pl-7"
            />
          </div>
          {usernameError && <p className="font-inter text-xs text-red-500">{usernameError}</p>}
          <div className="flex gap-2">
            <Button
              onClick={handleStartChange}
              disabled={loading || !newUsername}
              className="flex-1 gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Envoyer code
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setMode('view');
                setNewUsername('');
                setUsernameError('');
              }}
            >
              Annuler
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Vérification d'email requise</label>
      <div className="space-y-3 p-4 bg-secondary/50 rounded-lg border border-border">
        <div className="flex items-start gap-2">
          <Mail className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
          <p className="font-inter text-sm text-foreground">
            Un code de vérification a été envoyé à <strong>{user.email}</strong>
          </p>
        </div>
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="XXXXXX"
          maxLength={6}
          className="bg-background border-border font-mono text-center text-lg tracking-widest"
        />
        <div className="flex gap-2">
          <Button
            onClick={handleVerifyAndChange}
            disabled={loading || code.length < 4}
            className="flex-1 gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <CheckCircle className="w-4 h-4" />
            Vérifier et changer
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setMode('view');
              setCode('');
              setCodeSent(false);
            }}
          >
            Annuler
          </Button>
        </div>
      </div>
    </div>
  );
}