import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/lib/api';

interface LoginFormValues {
  email: string;
  password: string;
  tenantSlug?: string;
  remember?: boolean;
}

export const LoginPage = () => {
  const { login, loginStatus } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
      tenantSlug: '',
      remember: true,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      setSubmitting(true);
      await login(values);
      toast.success('Connexion réussie !');
      const redirectTo = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, 'Impossible de se connecter.'));
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/60">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">M4Stage</h1>
          <p className="mt-1 text-sm text-slate-500">Connectez-vous pour gérer vos événements.</p>
        </div>
        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" required {...register('email', { required: true })} />
            {errors.email && <p className="text-xs text-rose-600">Email requis.</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input id="password" type="password" autoComplete="current-password" required {...register('password', { required: true })} />
            {errors.password && <p className="text-xs text-rose-600">Mot de passe requis.</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="tenantSlug">Sous-domaine / slug tenant</Label>
            <Input
              id="tenantSlug"
              placeholder="ex: demo"
              {...register('tenantSlug')}
            />
            <p className="text-xs text-slate-400">Laissez vide si vous êtes administrateur plateforme.</p>
          </div>
          <Button type="submit" className="w-full" disabled={submitting || loginStatus === 'pending'}>
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size="sm" /> Connexion...
              </span>
            ) : (
              'Se connecter'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};
