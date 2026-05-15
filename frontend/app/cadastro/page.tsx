'use client';

import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GraduationCap, Mail, Lock, Eye, EyeOff, User, Phone, Book, Building, ArrowRight, Loader2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

const registerSchema = z.object({
  name: z.string().min(3, 'Nome completo é obrigatório'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  cpf: z.string().optional(),
  matricula: z.string().optional(),
  phone: z.string().optional(),
  course: z.string().optional(),
  institution: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

function CadastroContent() {
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerAction, isLoading } = useAuthStore();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const redirectAfterRegister = () => {
    router.push('/participante');
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerAction(data);
      toast.success('Conta criada com sucesso!');
      redirectAfterRegister();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar conta. Tente novamente.');
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
            <h1 className="text-4xl font-black mb-3">Junte-se a nós!</h1>
            <p className="text-white/70 text-lg mb-8 max-w-sm">
              Crie sua conta na UFRA Eventos para participar das melhores experiências acadêmicas.
            </p>

            <div className="space-y-4 text-left max-w-xs mx-auto">
              {[
                '✅ Acesso a dezenas de eventos',
                '🎓 Certificados digitais com QR Code',
                '🔬 Submissão de trabalhos simplificada',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-white/80">
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md max-h-screen overflow-y-auto py-8 no-scrollbar"
        >
          {/* Mobile Logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-black text-xl">UFRA <span className="text-primary">Eventos</span></span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black mb-2">Criar Conta</h2>
            <p className="text-muted-foreground">
              Já tem uma conta?{' '}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Faça login
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo <span className="text-destructive">*</span></Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Seu nome completo"
                  className="pl-10 h-12"
                  {...register('name')}
                />
              </div>
              {errors.name && (
                <p className="text-destructive text-sm">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail <span className="text-destructive">*</span></Label>
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
              <Label htmlFor="password">Senha <span className="text-destructive">*</span></Label>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* CPF */}
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF (Opcional)</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="cpf"
                    placeholder="000.000.000-00"
                    className="pl-10 h-12"
                    {...register('cpf')}
                  />
                </div>
              </div>

              {/* Matrícula */}
              <div className="space-y-2">
                <Label htmlFor="matricula">Matrícula (Opcional)</Label>
                <div className="relative">
                  <Book className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="matricula"
                    placeholder="Ex: 202300123"
                    className="pl-10 h-12"
                    {...register('matricula')}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Curso */}
              <div className="space-y-2">
                <Label htmlFor="course">Curso (Opcional)</Label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="course"
                    placeholder="Seu curso"
                    className="pl-10 h-12"
                    {...register('course')}
                  />
                </div>
              </div>

              {/* Instituição */}
              <div className="space-y-2">
                <Label htmlFor="institution">Instituição (Opcional)</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="institution"
                    placeholder="Sua instituição"
                    className="pl-10 h-12"
                    defaultValue="UFRA Campus Paragominas"
                    {...register('institution')}
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              id="btn-submit-register"
              className="w-full h-12 text-base font-semibold mt-4"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                <>
                  Criar Conta
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

        </motion.div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    }>
      <CadastroContent />
    </Suspense>
  );
}
