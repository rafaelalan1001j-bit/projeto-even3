'use client';

import { Award, Download, Plus, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminCertificatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Certificados</h1>
          <p className="text-muted-foreground mt-1">Modelos e emissão de certificados</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Settings className="w-4 h-4" />
            Configurações
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Modelo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Modelos de Certificados</CardTitle>
                <CardDescription>Gerencie os templates de certificados dos eventos</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl border-muted">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold">Nenhum modelo criado</h3>
              <p className="text-muted-foreground max-w-sm mt-2 mb-6">
                Crie um modelo de certificado base para ser utilizado em seus eventos.
              </p>
              <Button>Criar Meu Primeiro Modelo</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estatísticas</CardTitle>
            <CardDescription>Visão geral de emissões</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-muted/50 flex items-center gap-4">
              <div className="p-3 bg-yellow-500/10 text-yellow-600 rounded-lg">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Emitidos</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-muted/50 flex items-center gap-4">
              <div className="p-3 bg-green-500/10 text-green-600 rounded-lg">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Downloads</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
