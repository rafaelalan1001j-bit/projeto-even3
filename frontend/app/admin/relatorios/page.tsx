'use client';

import { BarChart3, Download, FileSpreadsheet, PieChart, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminReportsPage() {
  const reports = [
    {
      title: 'Inscrições por Evento',
      description: 'Relatório detalhado de participantes, status de pagamento e check-in por evento.',
      icon: FileSpreadsheet,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      title: 'Desempenho Financeiro',
      description: 'Receita total, taxas de plataforma e repasses aos organizadores.',
      icon: TrendingUp,
      color: 'text-green-500',
      bg: 'bg-green-500/10'
    },
    {
      title: 'Métricas de Submissões',
      description: 'Quantidade de trabalhos enviados, aprovados e rejeitados por categoria.',
      icon: PieChart,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    },
    {
      title: 'Eventos Realizados',
      description: 'Histórico completo de eventos, datas, locais e organizadores.',
      icon: CalendarIcon,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground mt-1">Extração de dados e métricas da plataforma</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report, idx) => (
          <Card key={idx} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col sm:flex-row gap-6">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${report.bg} ${report.color}`}>
                <report.icon className="w-7 h-7" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-xl font-bold">{report.title}</h3>
                <p className="text-muted-foreground text-sm">{report.description}</p>
                <div className="pt-4 flex gap-3">
                  <Button variant="outline" className="gap-2 text-xs h-9">
                    <BarChart3 className="w-3.5 h-3.5" /> Visualizar
                  </Button>
                  <Button className="gap-2 text-xs h-9">
                    <Download className="w-3.5 h-3.5" /> Exportar CSV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
