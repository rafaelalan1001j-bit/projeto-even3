'use client';

import { FileText, CheckCircle2, XCircle, Clock, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminSubmissionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Submissões</h1>
          <p className="text-muted-foreground mt-1">Gerencie os trabalhos científicos e artigos submetidos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 text-green-500 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Aprovados</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-red-500/10 text-red-500 rounded-xl">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Rejeitados</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
          <div className="flex gap-4">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por título ou autor..." className="pl-9" />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" /> Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-12 text-center text-muted-foreground flex flex-col items-center">
          <FileText className="w-12 h-12 mb-4 opacity-20" />
          <p>Nenhuma submissão recebida até o momento.</p>
        </CardContent>
      </Card>
    </div>
  );
}
