'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Calendar, Users, Award, BookOpen, 
  TrendingUp, ArrowRight, Clock, 
  BarChart3, FileText, CheckCircle,
  AlertCircle, Plus, Eye
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';
import api from '@/lib/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statuses = {
  PUBLISHED: { label: 'Publicado', color: '#4CAF50' },
  DRAFT: { label: 'Rascunho', color: '#F9A825' },
  ONGOING: { label: 'Em andamento', color: '#2196F3' },
  FINISHED: { label: 'Finalizado', color: '#9E9E9E' },
  CANCELLED: { label: 'Cancelado', color: '#F44336' },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function StatCard({ 
  title, value, subtitle, icon: Icon, trend, color = 'text-primary', isLoading 
}: {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ElementType;
  trend?: number;
  color?: string;
  isLoading?: boolean;
}) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
              {isLoading ? (
                <Skeleton className="h-9 w-24 mb-1" />
              ) : (
                <p className="text-3xl font-black">{typeof value === 'number' ? value.toLocaleString('pt-BR') : value}</p>
              )}
              {subtitle && (
                <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
              )}
              {trend !== undefined && (
                <p className={`text-xs mt-2 font-medium ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% este mês
                </p>
              )}
            </div>
            <div className={`p-3 rounded-xl bg-primary/10`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function AdminDashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/admin');
      return data.data;
    },
    refetchInterval: 60000, // Atualizar a cada 1 minuto
  });

  const overview = data?.overview || {};
  const charts = data?.charts || {};
  const recentEvents = data?.recentEvents || [];
  const recentRegistrations = data?.recentRegistrations || [];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Visão geral da plataforma UFRA Eventos
          </p>
        </div>
        <Link href="/admin/eventos/novo">
          <Button id="btn-admin-novo-evento" className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Evento
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <StatCard title="Total de Eventos" value={overview.totalEvents || 0} icon={Calendar} trend={12} isLoading={isLoading} />
        <StatCard title="Usuários Cadastrados" value={overview.totalUsers || 0} icon={Users} trend={8} color="text-blue-500" isLoading={isLoading} />
        <StatCard title="Inscrições Confirmadas" value={overview.totalRegistrations || 0} icon={CheckCircle} trend={15} color="text-green-500" isLoading={isLoading} />
        <StatCard title="Certificados Emitidos" value={overview.totalCertificates || 0} icon={Award} trend={5} color="text-yellow-500" isLoading={isLoading} />
      </motion.div>

      {/* Secondary Stats */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <StatCard 
          title="Eventos Próximos" 
          value={overview.upcomingEvents || 0} 
          subtitle="Com inscrições abertas"
          icon={Clock} 
          color="text-purple-500"
          isLoading={isLoading} 
        />
        <StatCard 
          title="Submissões" 
          value={overview.totalSubmissions || 0} 
          subtitle="Artigos científicos"
          icon={FileText} 
          color="text-cyan-500"
          isLoading={isLoading} 
        />
        <StatCard 
          title="Criados este mês" 
          value={overview.eventsThisMonth || 0} 
          subtitle={`${overview.registrationsThisMonth || 0} inscrições este mês`}
          icon={TrendingUp} 
          color="text-orange-500"
          isLoading={isLoading} 
        />
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Inscrições – Últimos 7 Dias
            </CardTitle>
            <CardDescription>Volume diário de novas inscrições na plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={charts.registrationsLast7Days || []}>
                  <defs>
                    <linearGradient id="colorInscricoes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1B5E20" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#1B5E20" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.08} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '13px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="inscricoes"
                    stroke="#1B5E20"
                    strokeWidth={2.5}
                    fill="url(#colorInscricoes)"
                    name="Inscrições"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Eventos por Status</CardTitle>
            <CardDescription>Distribuição atual dos eventos</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={(charts.eventsByStatus || []).map((e: any) => ({
                      name: statuses[e.status as keyof typeof statuses]?.label || e.status,
                      value: e.count,
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {(charts.eventsByStatus || []).map((entry: any, index: number) => (
                      <Cell
                        key={entry.status}
                        fill={statuses[entry.status as keyof typeof statuses]?.color || '#ccc'}
                      />
                    ))}
                  </Pie>
                  <Legend formatter={(value) => <span style={{ fontSize: 12 }}>{value}</span>} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Eventos Recentes</CardTitle>
              <CardDescription>Últimos eventos cadastrados</CardDescription>
            </div>
            <Link href="/admin/eventos">
              <Button variant="ghost" size="sm" className="gap-1">
                Ver todos <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading
              ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)
              : recentEvents.map((event: any) => (
                <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div 
                    className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-lg"
                    style={{ backgroundColor: (event.category?.color || '#1B5E20') + '20' }}
                  >
                    {event.category?.icon || '📅'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {event._count.registrations} inscritos · Por {event.organizer.name}
                    </p>
                  </div>
                  <Badge className="text-xs shrink-0" variant="outline">
                    {event.status}
                  </Badge>
                </div>
              ))
            }
          </CardContent>
        </Card>

        {/* Recent Registrations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Inscrições Recentes</CardTitle>
              <CardDescription>Últimos participantes inscritos</CardDescription>
            </div>
            <Link href="/admin/usuarios">
              <Button variant="ghost" size="sm" className="gap-1">
                Ver todos <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading
              ? [...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
              : recentRegistrations.map((reg: any) => (
                <div key={reg.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                    {reg.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{reg.user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{reg.event.title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(reg.createdAt), 'dd/MM', { locale: ptBR })}
                  </p>
                </div>
              ))
            }
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
