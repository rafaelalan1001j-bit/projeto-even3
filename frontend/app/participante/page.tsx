'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Calendar, Award, FileText, User, 
  QrCode, Clock, CheckCircle, XCircle,
  ArrowRight, Download
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { useAuthStore } from '@/store/authStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '@/lib/api';
import { toast } from 'sonner';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ParticipantDashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const { data: registrations, isLoading: loadingRegs } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: async () => {
      const { data } = await api.get('/registrations/my');
      return data.data;
    },
    enabled: isAuthenticated,
  });

  const { data: certificates, isLoading: loadingCerts } = useQuery({
    queryKey: ['my-certificates'],
    queryFn: async () => {
      const { data } = await api.get('/certificates/my');
      return data.data;
    },
    enabled: isAuthenticated,
  });

  const { data: submissions, isLoading: loadingSubs } = useQuery({
    queryKey: ['my-submissions'],
    queryFn: async () => {
      const { data } = await api.get('/submissions/my');
      return data.data;
    },
    enabled: isAuthenticated,
  });

  if (!isAuthenticated || !user) return null;

  const confirmedRegs = (registrations || []).filter((r: any) => r.status === 'CONFIRMED');
  const upcomingEvents = confirmedRegs.filter((r: any) => new Date(r.event.startDate) > new Date());
  const attendedEvents = (registrations || []).filter((r: any) => r.attendance);

  const handleDownloadCertificate = async (certId: string, code: string) => {
    try {
      const response = await api.get(`/certificates/download/${certId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificado-${code}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Certificado baixado!');
    } catch (err) {
      toast.error('Erro ao baixar certificado.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-black">
            Olá, {user.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Bem-vindo ao seu painel de atividades acadêmicas.
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {[
            { label: 'Inscrições', value: confirmedRegs.length, icon: Calendar, color: 'text-green-500', bg: 'bg-green-500/10' },
            { label: 'Próximos', value: upcomingEvents.length, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { label: 'Certificados', value: certificates?.length || 0, icon: Award, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
            { label: 'Presença', value: attendedEvents.length, icon: CheckCircle, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          ].map((stat) => (
            <motion.div key={stat.label} variants={itemVariants}>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${stat.bg} shrink-0`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-black">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="inscricoes">
          <TabsList className="mb-6 grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="inscricoes" id="tab-inscricoes">Inscrições</TabsTrigger>
            <TabsTrigger value="certificados" id="tab-certificados">Certificados</TabsTrigger>
            <TabsTrigger value="submissoes" id="tab-submissoes">Submissões</TabsTrigger>
          </TabsList>

          {/* INSCRIÇÕES */}
          <TabsContent value="inscricoes">
            <div className="space-y-3">
              {loadingRegs
                ? [...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
                : registrations?.length === 0
                ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="font-semibold">Nenhuma inscrição ainda</p>
                      <p className="text-muted-foreground text-sm mt-1">Explore os eventos e faça sua inscrição!</p>
                      <Link href="/eventos" className="mt-4 inline-block">
                        <Button className="mt-4" id="btn-explorar-eventos-painel">
                          Explorar Eventos <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
                : registrations?.map((reg: any) => (
                  <motion.div
                    key={reg.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Card className="hover:border-primary/20 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div
                            className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center text-xl"
                            style={{ backgroundColor: (reg.event.category?.color || '#1B5E20') + '20' }}
                          >
                            {reg.event.category?.icon || '📅'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                              <h3 className="font-bold text-base leading-tight">{reg.event.title}</h3>
                              <div className="flex items-center gap-2">
                                {reg.attendance && (
                                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-xs">
                                    ✓ Presença registrada
                                  </Badge>
                                )}
                                <Badge variant={reg.status === 'CONFIRMED' ? 'default' : 'destructive'} className="text-xs">
                                  {reg.status === 'CONFIRMED' ? 'Confirmado' : reg.status}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                              <span>📅 {format(new Date(reg.event.startDate), "dd 'de' MMM yyyy", { locale: ptBR })}</span>
                              <span>📍 {reg.event.location}</span>
                              <span>⏱️ {reg.event.workload}h</span>
                            </div>
                          </div>
                        </div>

                        {/* QR Code hint */}
                        {reg.status === 'CONFIRMED' && !reg.attendance && (
                          <div className="mt-3 p-3 bg-primary/5 rounded-lg border border-primary/10 flex items-center gap-3 text-sm">
                            <QrCode className="w-5 h-5 text-primary shrink-0" />
                            <span className="text-muted-foreground">
                              Apresente seu QR Code no evento para fazer o check-in.
                            </span>
                            <Link href={`/participante/qrcode/${reg.id}`} className="ml-auto">
                              <Button variant="outline" size="sm" id={`btn-qr-${reg.id}`}>Ver QR Code</Button>
                            </Link>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              }
            </div>
          </TabsContent>

          {/* CERTIFICADOS */}
          <TabsContent value="certificados">
            <div className="space-y-3">
              {loadingCerts
                ? [...Array(2)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
                : certificates?.length === 0
                ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Award className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="font-semibold">Nenhum certificado ainda</p>
                      <p className="text-muted-foreground text-sm mt-1">
                        Participe de eventos e faça check-in para receber certificados.
                      </p>
                    </CardContent>
                  </Card>
                )
                : certificates?.map((cert: any) => (
                  <Card key={cert.id} className="hover:border-yellow-500/20 transition-colors">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0">
                        <Award className="w-6 h-6 text-yellow-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm leading-tight">{cert.eventTitle}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {cert.workload}h · Emitido em {format(new Date(cert.issuedAt), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                        <p className="text-xs text-primary font-mono mt-0.5">{cert.code}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        id={`btn-download-cert-${cert.id}`}
                        onClick={() => handleDownloadCertificate(cert.id, cert.code)}
                        className="gap-2 shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" />
                        PDF
                      </Button>
                    </CardContent>
                  </Card>
                ))
              }
            </div>
          </TabsContent>

          {/* SUBMISSÕES */}
          <TabsContent value="submissoes">
            <div className="space-y-3">
              {loadingSubs
                ? [...Array(2)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
                : submissions?.length === 0
                ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="font-semibold">Nenhuma submissão ainda</p>
                      <p className="text-muted-foreground text-sm mt-1">
                        Submeta artigos científicos nos eventos que aceitam trabalhos.
                      </p>
                    </CardContent>
                  </Card>
                )
                : submissions?.map((sub: any) => {
                  const statusMap: Record<string, { label: string; class: string }> = {
                    PENDING: { label: 'Aguardando avaliação', class: 'bg-yellow-500/10 text-yellow-500' },
                    UNDER_REVIEW: { label: 'Em avaliação', class: 'bg-blue-500/10 text-blue-500' },
                    APPROVED: { label: '✓ Aprovado', class: 'bg-green-500/10 text-green-500' },
                    REJECTED: { label: '✗ Reprovado', class: 'bg-red-500/10 text-red-500' },
                    REVISION_REQUESTED: { label: '⟳ Revisão solicitada', class: 'bg-orange-500/10 text-orange-500' },
                  };
                  const status = statusMap[sub.status] || statusMap.PENDING;

                  return (
                    <Card key={sub.id} className="hover:border-primary/20 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
                          <h3 className="font-bold text-sm leading-tight flex-1">{sub.title}</h3>
                          <Badge className={`text-xs ${status.class}`}>{status.label}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {sub.event.title} · Submetido em {format(new Date(sub.submittedAt), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                        {sub.reviewerNotes && (
                          <div className="mt-2 p-2.5 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                            <strong>Parecer do avaliador:</strong> {sub.reviewerNotes}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              }
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
