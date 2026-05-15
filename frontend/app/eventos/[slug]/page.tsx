'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, MapPin, Clock, Users, ArrowLeft, CheckCircle, FileText, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import Link from 'next/link';

export default function EventoDetalhesPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', slug],
    queryFn: async () => {
      const response = await api.get(`/events/${slug}`);
      return response.data.data;
    },
  });

  const { data: registrations } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: async () => {
      const { data } = await api.get('/registrations/my');
      return data.data;
    },
    enabled: isAuthenticated,
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      return await api.post('/registrations', { eventId: event?.id });
    },
    onSuccess: () => {
      toast.success('Inscrição realizada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['my-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['event', slug] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao realizar inscrição.');
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-20 container mx-auto px-4">
          <Skeleton className="h-[400px] w-full rounded-3xl mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-32 w-full mt-8" />
            </div>
            <div>
              <Skeleton className="h-[300px] w-full rounded-2xl" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Evento não encontrado</h1>
            <Button onClick={() => router.push('/eventos')}>Voltar para Eventos</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isRegistered = registrations?.some((reg: any) => reg.eventId === event.id);
  const isSoldOut = event.availableSpots !== null && event.availableSpots <= 0;
  const isOngoing = event.status === 'ONGOING';
  const isFinished = event.status === 'FINISHED';
  
  const canRegister = event.status === 'PUBLISHED' && !isRegistered && !isSoldOut;

  const handleRegister = () => {
    if (!isAuthenticated) {
      toast.error('Você precisa fazer login para se inscrever.');
      router.push(`/login?redirect=/eventos/${slug}`);
      return;
    }
    registerMutation.mutate();
  };

  const gradientClass = "from-green-900 to-green-700";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4">
          
          <Button variant="ghost" className="mb-6 -ml-4" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>

          {/* Banner Section */}
          <div className={`relative w-full h-[300px] md:h-[400px] rounded-3xl overflow-hidden mb-12 bg-gradient-to-br ${gradientClass} shadow-lg`}>
            {event.banner ? (
              <img 
                src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001'}${event.banner}`} 
                alt={event.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center opacity-20" style={{
                backgroundImage: 'radial-gradient(circle, white 2px, transparent 2px)',
                backgroundSize: '30px 30px',
              }} />
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            
            <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full">
              <div className="flex flex-wrap gap-3 mb-4">
                {event.category && (
                  <Badge style={{ backgroundColor: event.category.color }} className="text-white border-0">
                    {event.category.icon} {event.category.name}
                  </Badge>
                )}
                <Badge variant={event.status === 'PUBLISHED' ? 'default' : 'secondary'} className="bg-primary/20 text-white backdrop-blur-md border border-white/20">
                  {event.status === 'PUBLISHED' ? 'Inscrições Abertas' : event.status}
                </Badge>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white leading-tight max-w-4xl">
                {event.title}
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-10">
              
              <section>
                <h2 className="text-2xl font-bold mb-4">Sobre o Evento</h2>
                <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {event.description || event.shortDescription || 'Nenhuma descrição fornecida.'}
                </div>
              </section>

              {event.acceptsSubmissions && (
                <section className="bg-primary/5 border border-primary/20 rounded-2xl p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold mb-2 text-foreground">Submissão de Trabalhos</h2>
                      <p className="text-muted-foreground mb-4">
                        Este evento aceita submissões de artigos e resumos científicos.
                        {event.submissionDeadline && ` O prazo encerra em ${format(new Date(event.submissionDeadline), "dd/MM/yyyy")}.`}
                      </p>
                      
                      {event.submissionGuidelines && (
                        <div className="mb-4 text-sm text-muted-foreground bg-background/50 p-4 rounded-lg border border-border">
                          <strong>Diretrizes:</strong><br/>
                          {event.submissionGuidelines}
                        </div>
                      )}

                      {isRegistered ? (
                        <Link href="/participante">
                          <Button className="mt-2">Fazer Submissão</Button>
                        </Link>
                      ) : (
                        <p className="text-sm font-medium text-amber-600 dark:text-amber-500">
                          * Você precisa se inscrever no evento primeiro para poder submeter trabalhos.
                        </p>
                      )}
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="sticky top-24 border-primary/20 shadow-lg">
                <CardContent className="p-6">
                  
                  {/* Action Button */}
                  <div className="mb-8 text-center">
                    {isRegistered ? (
                      <div className="bg-green-500/10 border border-green-500/20 text-green-600 rounded-xl p-4 flex flex-col items-center gap-2">
                        <CheckCircle className="w-8 h-8" />
                        <span className="font-bold">Inscrição Confirmada</span>
                        <Link href="/participante">
                          <Button variant="outline" size="sm" className="mt-2 w-full">Acessar Painel</Button>
                        </Link>
                      </div>
                    ) : isFinished ? (
                      <Button className="w-full h-14 text-lg font-bold" disabled variant="secondary">
                        Evento Encerrado
                      </Button>
                    ) : isSoldOut ? (
                      <Button className="w-full h-14 text-lg font-bold bg-red-500 hover:bg-red-600 text-white" disabled>
                        Vagas Esgotadas
                      </Button>
                    ) : canRegister ? (
                      <Button 
                        className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
                        onClick={handleRegister}
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? 'Processando...' : 'Inscrever-se Agora'}
                      </Button>
                    ) : (
                      <Button className="w-full h-14 text-lg font-bold" disabled variant="secondary">
                        Inscrições Fechadas
                      </Button>
                    )}
                  </div>

                  <div className="space-y-5">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground font-medium">Data</p>
                        <p className="font-semibold text-foreground">
                          {format(new Date(event.startDate), "dd 'de' MMM", { locale: ptBR })} 
                          {event.endDate && event.endDate !== event.startDate ? ` a ${format(new Date(event.endDate), "dd 'de' MMM, yyyy", { locale: ptBR })}` : `, ${format(new Date(event.startDate), "yyyy")}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground font-medium">Carga Horária</p>
                        <p className="font-semibold text-foreground">{event.workload} horas extracurriculares</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground font-medium">Local</p>
                        <p className="font-semibold text-foreground">{event.isOnline ? 'Online' : event.location}</p>
                        {event.address && <p className="text-xs text-muted-foreground mt-0.5">{event.address}</p>}
                      </div>
                    </div>

                    {event.maxParticipants && (
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground font-medium">Vagas Restantes</p>
                          <p className={`font-semibold ${isSoldOut ? 'text-red-500' : 'text-foreground'}`}>
                            {isSoldOut ? 'Esgotado' : `${event.availableSpots} de ${event.maxParticipants}`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {event.organizer && (
                    <div className="mt-8 pt-6 border-t border-border">
                      <p className="text-sm text-muted-foreground mb-3 font-medium">Organizado por</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold">
                          {event.organizer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{event.organizer.name}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 pt-6 border-t border-border flex justify-center">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                      <Share2 className="w-4 h-4 mr-2" />
                      Compartilhar Evento
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
