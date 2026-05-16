'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Tag, Plus, Edit2, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminCategoriesPage() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data.data;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Categorias</h1>
          <p className="text-muted-foreground mt-1">Gerencie as categorias de eventos e submissões</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Nova Categoria
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-10 w-10 rounded-lg mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))
        ) : categories?.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl border-muted">
            <Tag className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Nenhuma categoria cadastrada.</p>
          </div>
        ) : (
          categories?.map((category: any) => (
            <Card key={category.id} className="hover:shadow-md transition-shadow group relative overflow-hidden">
              <div 
                className="absolute top-0 left-0 w-1 h-full" 
                style={{ backgroundColor: category.color || '#1B5E20' }}
              />
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    style={{ backgroundColor: `${category.color || '#1B5E20'}20` }}
                  >
                    {category.icon || '📌'}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <h3 className="font-bold text-lg">{category.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {category.description || 'Sem descrição'}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
