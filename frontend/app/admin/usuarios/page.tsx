'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Users, Search, Filter, MoreHorizontal, 
  Mail, UserCheck, UserX, UserCog 
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search],
    queryFn: async () => {
      const res = await api.get('/users', { params: { search, limit: 50 } });
      return res.data.data;
    }
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20">Admin</Badge>;
      case 'ORGANIZER':
        return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">Organizador</Badge>;
      default:
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Participante</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Usuários</h1>
          <p className="text-muted-foreground mt-1">Gerencie os usuários cadastrados na plataforma</p>
        </div>
        <Button className="gap-2">
          <UserCog className="w-4 h-4" />
          Convidar Usuário
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou e-mail..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4" />
              Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">Usuário</th>
                  <th className="px-6 py-4 font-medium">Papel</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Cadastro</th>
                  <th className="px-6 py-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-10 w-[200px]" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-[80px]" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-[80px]" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-[100px]" /></td>
                      <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-8 ml-auto" /></td>
                    </tr>
                  ))
                ) : data?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                ) : (
                  data?.map((user: any) => (
                    <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{user.name}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4">
                        {user.isActive ? (
                          <div className="flex items-center gap-1.5 text-green-600 text-xs font-medium">
                            <UserCheck className="w-3.5 h-3.5" /> Ativo
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                            <UserX className="w-3.5 h-3.5" /> Inativo
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {format(new Date(user.createdAt), "dd 'de' MMM, yyyy", { locale: ptBR })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                            <DropdownMenuItem>Editar usuário</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">Bloquear acesso</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
