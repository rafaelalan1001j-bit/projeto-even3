'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calendar, MapPin, Clock, Users, ArrowRight, Bookmark } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    slug: string;
    shortDescription?: string | null;
    banner?: string | null;
    startDate: string;
    endDate: string;
    location: string;
    workload: number;
    status: string;
    maxParticipants?: number | null;
    _count?: { registrations: number };
    category?: { name: string; color: string; icon?: string } | null;
    organizer?: { name: string } | null;
  };
}

const statusConfig: Record<string, { label: string; className: string }> = {
  PUBLISHED: { label: 'Inscrições abertas', className: 'bg-green-500/10 text-green-500 border-green-500/20' },
  ONGOING: { label: 'Em andamento', className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  FINISHED: { label: 'Encerrado', className: 'bg-muted text-muted-foreground' },
  DRAFT: { label: 'Rascunho', className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  CANCELLED: { label: 'Cancelado', className: 'bg-red-500/10 text-red-500 border-red-500/20' },
};

// Placeholder gradient colors for events without banners
const gradients = [
  'from-green-900 to-green-700',
  'from-emerald-900 to-teal-700',
  'from-green-800 to-lime-700',
  'from-teal-900 to-green-700',
];

export function EventCard({ event }: EventCardProps) {
  const status = statusConfig[event.status] || statusConfig.PUBLISHED;
  const registrations = event._count?.registrations || 0;
  const spotsLeft = event.maxParticipants
    ? event.maxParticipants - registrations
    : null;
  const isSoldOut = spotsLeft !== null && spotsLeft <= 0;

  const gradientIndex = event.id.charCodeAt(0) % gradients.length;
  const gradient = gradients[gradientIndex];

  const startDate = new Date(event.startDate);

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="group bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300"
    >
      {/* Banner */}
      <div className={`relative h-44 bg-gradient-to-br ${gradient} overflow-hidden`}>
        {event.banner ? (
          <img
            src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001'}${event.banner}`}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-end p-4">
            {/* Pattern overlay */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />
          </div>
        )}

        {/* Badges overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          {event.category && (
            <Badge
              className="text-xs font-medium border-0 text-white shadow-sm"
              style={{ backgroundColor: event.category.color + 'CC' }}
            >
              {event.category.icon} {event.category.name}
            </Badge>
          )}
          <Badge className={`text-xs ml-auto ${status.className}`}>
            {status.label}
          </Badge>
        </div>

        {/* Date chip */}
        <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5 text-white text-xs font-medium">
          📅 {format(startDate, "dd 'de' MMM 'de' yyyy", { locale: ptBR })}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {event.title}
        </h3>

        {event.shortDescription && (
          <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">
            {event.shortDescription}
          </p>
        )}

        {/* Meta info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>{event.workload}h</span>
            </div>
            {event.maxParticipants && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-3.5 h-3.5 text-primary" />
                <span className={isSoldOut ? 'text-red-500 font-medium' : ''}>
                  {isSoldOut
                    ? 'Esgotado'
                    : `${spotsLeft} vagas restantes`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Organizer */}
        {event.organizer && (
          <div className="text-xs text-muted-foreground mb-4">
            Por <span className="text-foreground font-medium">{event.organizer.name}</span>
          </div>
        )}

        {/* CTA */}
        <Link href={`/eventos/${event.slug}`}>
          <Button
            className="w-full group/btn"
            id={`btn-event-${event.id}`}
            disabled={isSoldOut && event.status !== 'FINISHED'}
            variant={event.status === 'FINISHED' ? 'outline' : 'default'}
          >
            {event.status === 'FINISHED' ? 'Ver detalhes' : isSoldOut ? 'Lista de espera' : 'Inscrever-se'}
            <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
