'use client';

import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginContent() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const expired = searchParams.get('expired');

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const redirectAfterLogin = () => {
    const { user } = useAuthStore.getState();
    if (user?.role === 'ADMIN') router.push('/admin');
    else if (user?.role === 'ORGANIZER') router.push('/organizador');
    else router.push('/participante');
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      toast.success('Bem-vindo de volta!');
      redirectAfterLogin();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer login. Verifique suas credenciais.');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden gradient-hero">
        <div className="absolute inset-0">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full opacity-10"
              style={{
                width: `${200 + i * 100}px`,
                height: `${200 + i * 100}px`,
                left: `${20 + i * 20}%`,
                top: `${10 + i * 15}%`,
                background: i % 2 === 0 ? '#4CAF50' : '#F9A825',
                filter: 'blur(40px)',
              }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
              transition={{ duration: 6 + i, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center mb-6 mx-auto">
              <GraduationCap className="w-10 h-10 text-yellow-400" />
            </div>
            <h1 className="text-4xl font-black mb-3">UFRA Eventos</h1>
            <p className="text-white/70 text-lg mb-8 max-w-sm">
              Sua plataforma de eventos acadêmicos universitários
            </p>

            <div className="space-y-4 text-left max-w-xs mx-auto">
              {[
                '✅ Inscrição em eventos com 1 clique',
                '🎓 Certificados PDF automáticos',
                '📱 QR Code para check-in',
                '🔬 Submissão de artigos científicos',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-white/80">
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-black text-xl">UFRA <span className="text-primary">Eventos</span></span>
          </div>

          {expired && (
            <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-sm">
              ⚠️ Sua sessão expirou. Faça login novamente.
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-3xl font-black mb-2">Bem-vindo de volta!</h2>
            <p className="text-muted-foreground">
              Não tem conta?{' '}
              <Link href="/cadastro" className="text-primary font-semibold hover:underline">
                Cadastre-se gratuitamente
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="pl-10 h-12"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-destructive text-sm">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Link href="/recuperar-senha" className="text-sm text-primary hover:underline">
                  Esqueci minha senha
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-12"
                  {...register('password')}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.password && (
                <p className="text-destructive text-sm">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              id="btn-submit-login"
              className="w-full h-12 text-base font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar na Conta
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs text-muted-foreground bg-background px-4">
              Credenciais de demonstração
            </div>
          </div>

          {/* Demo credentials */}
          <div className="grid grid-cols-1 gap-2">
            {[
              { role: 'Admin', email: 'admin@ufra.edu.br', password: 'Admin@123' },
              { role: 'Organizador', email: 'organizador@ufra.edu.br', password: 'Org@12345' },
              { role: 'Participante', email: 'joao.silva@discente.ufra.edu.br', password: 'Part@12345' },
            ].map((cred) => (
              <button
                key={cred.role}
                type="button"
                onClick={async () => {
                  try {
                    await login(cred.email, cred.password);
                    redirectAfterLogin();
                  } catch {
                    toast.error('Erro ao usar demo. O servidor está ligado?');
                  }
                }}
                className="text-left px-4 py-3 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-sm"
              >
                <span className="font-semibold text-primary">{cred.role}: </span>
                <span className="text-muted-foreground">{cred.email}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
