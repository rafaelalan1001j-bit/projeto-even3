'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Users, Award, BookOpen, Plus, ArrowRight, Eye, Edit } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statuses = {
  PUBLISHED: { label: 'Inscrições Abertas', color: 'bg-green-500/10 text-green-500' },
  DRAFT: { label: 'Rascunho', color: 'bg-yellow-500/10 text-yellow-500' },
  ONGOING: { label: 'Em andamento', color: 'bg-blue-500/10 text-blue-500' },
  FINISHED: { label: 'Encerrado', color: 'bg-muted text-muted-foreground' },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-500/10 text-red-500' },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function StatCard({ title, value, icon: Icon, color = 'text-primary', isLoading }: any) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="hover:shadow-md transition-shadow h-full">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
              {isLoading ? (
                <Skeleton className="h-9 w-24 mb-1" />
              ) : (
                <p className="text-3xl font-black">{value}</p>
              )}
            </div>
            <div className={`p-3 rounded-xl bg-primary/10 shrink-0`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function OrganizadorDashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push('/login');
    } else if (user && user.role !== 'ORGANIZER' && user.role !== 'ADMIN') {
      router.push('/participante');
    }
  }, [isAuthenticated, user, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['organizer-stats'],
    queryFn: async () => {
      const response = await api.get('/dashboard/organizer');
      return response.data.data;
    },
    enabled: isAuthenticated && (user?.role === 'ORGANIZER' || user?.role === 'ADMIN'),
  });

  if (!isAuthenticated || (user?.role !== 'ORGANIZER' && user?.role !== 'ADMIN')) {
    return null; // Will redirect via useEffect
  }

  const overview = data?.overview || {};
  const myEvents = data?.myEvents || [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <h1 className="text-3xl md:text-4xl font-black mb-2">Painel do Organizador</h1>
              <p className="text-muted-foreground">
                Gerencie seus eventos, participantes, certificados e trabalhos científicos.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/admin/eventos/novo">
                <Button className="gap-2 shadow-md">
                  <Plus className="w-4 h-4" />
                  Criar Novo Evento
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <StatCard 
              title="Meus Eventos" 
              value={overview.totalEvents || 0} 
              icon={Calendar} 
              isLoading={isLoading} 
            />
            <StatCard 
              title="Total de Inscritos" 
              value={overview.totalRegistrations || 0} 
              icon={Users} 
              color="text-blue-500" 
              isLoading={isLoading} 
            />
            <StatCard 
              title="Artigos Submetidos" 
              value={overview.totalSubmissions || 0} 
              icon={BookOpen} 
              color="text-purple-500" 
              isLoading={isLoading} 
            />
            <StatCard 
              title="Certificados Emitidos" 
              value={overview.totalCertificates || 0} 
              icon={Award} 
              color="text-yellow-500" 
              isLoading={isLoading} 
            />
          </motion.div>

          {/* Eventos List */}
          <Card>
            <CardHeader>
              <CardTitle>Meus Eventos Recentes</CardTitle>
              <CardDescription>Eventos que você organizou ou está organizando.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  [...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
                ) : myEvents.length === 0 ? (
                  <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
                    <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="font-semibold text-lg">Nenhum evento encontrado</p>
                    <p className="text-muted-foreground text-sm mb-4">Você ainda não criou nenhum evento na plataforma.</p>
                    <Link href="/admin/eventos/novo">
                      <Button variant="outline">Criar meu primeiro evento</Button>
                    </Link>
                  </div>
                ) : (
                  myEvents.map((event: any) => {
                    const statusInfo = statuses[event.status as keyof typeof statuses] || statuses.DRAFT;
                    
                    return (
                      <div key={event.id} className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-xl"
                          style={{ backgroundColor: (event.category?.color || '#1B5E20') + '20' }}
                        >
                          {event.category?.icon || '📅'}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base truncate">{event.title}</h3>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                            <span>📅 {format(new Date(event.startDate), "dd/MM/yyyy")}</span>
                            <span>📍 {event.isOnline ? 'Online' : 'Presencial'}</span>
                            <span>👥 {event._count.registrations} inscritos</span>
                            {event.acceptsSubmissions && <span>📄 {event._count.submissions} submissões</span>}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 md:ml-auto">
                          <Badge className={`${statusInfo.color} border-0 shadow-none`}>
                            {statusInfo.label}
                          </Badge>
                          
                          <Link href={`/admin/eventos/${event.id}`}>
                            <Button size="sm" variant="outline" className="gap-2">
                              <Edit className="w-3.5 h-3.5" />
                              <span className="hidden md:inline">Gerenciar</span>
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </main>

      <Footer />
    </div>
  );
}
