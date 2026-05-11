'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Calendar, Award, Users, BookOpen, ArrowRight, 
  MapPin, Clock, Star, CheckCircle, ChevronRight,
  GraduationCap, Zap, Shield, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { EventCard } from '@/components/events/EventCard';
import { StatsCounter } from '@/components/common/StatsCounter';

// Dados mock para demonstração visual
const featuredEvents = [
  {
    id: '1',
    title: 'IX Semana Acadêmica de Agronomia',
    slug: 'semana-academica-agronomia-2024',
    shortDescription: 'O maior evento acadêmico de Agronomia da UFRA Campus Paragominas.',
    startDate: '2024-10-14T08:00:00',
    endDate: '2024-10-18T18:00:00',
    location: 'UFRA Campus Paragominas',
    workload: 40,
    status: 'PUBLISHED',
    maxParticipants: 500,
    _count: { registrations: 348 },
    category: { name: 'Semana Acadêmica', color: '#1B5E20', icon: '🎓' },
    organizer: { name: 'Prof. Carlos Silva' },
    banner: null,
  },
  {
    id: '2',
    title: 'I Congresso de Ciências Agrárias da Amazônia',
    slug: 'i-congresso-ciencias-agrarias-amazonia',
    shortDescription: 'Congresso científico regional com foco no desenvolvimento sustentável.',
    startDate: '2024-11-20T08:00:00',
    endDate: '2024-11-23T18:00:00',
    location: 'Auditório Principal – UFRA',
    workload: 30,
    status: 'PUBLISHED',
    maxParticipants: 300,
    _count: { registrations: 212 },
    category: { name: 'Congresso', color: '#1565C0', icon: '🏛️' },
    organizer: { name: 'Prof. Carlos Silva' },
    banner: null,
  },
  {
    id: '3',
    title: 'Workshop de Drones e Agricultura de Precisão',
    slug: 'workshop-drones-agricultura-precisao',
    shortDescription: 'Workshop prático sobre uso de drones e tecnologias de precisão na agricultura.',
    startDate: '2024-09-07T08:00:00',
    endDate: '2024-09-07T17:00:00',
    location: 'Laboratório de Geotecnologias – UFRA',
    workload: 8,
    status: 'FINISHED',
    maxParticipants: 30,
    _count: { registrations: 30 },
    category: { name: 'Workshop', color: '#F9A825', icon: '🛠️' },
    organizer: { name: 'Prof. Carlos Silva' },
    banner: null,
  },
];

const stats = [
  { label: 'Eventos Realizados', value: 142, suffix: '+', icon: Calendar },
  { label: 'Participantes', value: 8500, suffix: '+', icon: Users },
  { label: 'Certificados Emitidos', value: 6300, suffix: '+', icon: Award },
  { label: 'Trabalhos Submetidos', value: 890, suffix: '+', icon: BookOpen },
];

const features = [
  {
    icon: Calendar,
    title: 'Gestão de Eventos',
    description: 'Crie e gerencie eventos acadêmicos com facilidade. Controle vagas, datas e programação.',
    color: 'text-green-500',
    bg: 'bg-green-500/10',
  },
  {
    icon: Award,
    title: 'Certificados Automáticos',
    description: 'Geração automática de certificados em PDF com QR Code de validação único.',
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
  },
  {
    icon: Users,
    title: 'Check-in por QR Code',
    description: 'Controle de presença moderno com leitura de QR Code. Rápido e sem papel.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    icon: BookOpen,
    title: 'Submissão Científica',
    description: 'Módulo completo para submissão e avaliação de artigos e trabalhos científicos.',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
  {
    icon: Shield,
    title: 'Segurança Total',
    description: 'Autenticação JWT, criptografia de dados e proteção completa para seus dados.',
    color: 'text-red-500',
    bg: 'bg-red-500/10',
  },
  {
    icon: Globe,
    title: 'Acesso em Qualquer Lugar',
    description: 'Plataforma 100% online, responsiva e acessível de qualquer dispositivo.',
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
  },
];

const categories = [
  { name: 'Semana Acadêmica', icon: '🎓', count: 12 },
  { name: 'Congressos', icon: '🏛️', count: 8 },
  { name: 'Workshops', icon: '🛠️', count: 23 },
  { name: 'Minicursos', icon: '📚', count: 35 },
  { name: 'Palestras', icon: '🎤', count: 47 },
  { name: 'Simpósios', icon: '🔬', count: 6 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* ========================================
          HERO SECTION
      ======================================== */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 gradient-hero" />
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full opacity-10"
              style={{
                width: `${Math.random() * 400 + 100}px`,
                height: `${Math.random() * 400 + 100}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: i % 2 === 0 ? '#1B5E20' : '#F9A825',
                filter: 'blur(60px)',
              }}
              animate={{
                x: [0, 30, 0],
                y: [0, -30, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        <div className="relative z-10 container mx-auto px-4 py-32">
          <div className="max-w-4xl mx-auto text-center text-white">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge 
                className="mb-6 px-4 py-2 text-sm font-medium border border-yellow-400/30 bg-yellow-400/10 text-yellow-300"
              >
                <Zap className="w-3 h-3 mr-2 inline" />
                Plataforma Oficial UFRA Campus Paragominas
              </Badge>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight"
            >
              Eventos{' '}
              <span className="text-gradient-ufra" style={{
                background: 'linear-gradient(135deg, #F9A825, #FFD54F)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Acadêmicos
              </span>
              <br />
              em Um Só Lugar
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-xl md:text-2xl text-white/75 mb-10 leading-relaxed max-w-2xl mx-auto"
            >
              Inscreva-se em eventos, obtenha certificados digitais, submeta trabalhos 
              e acompanhe sua vida acadêmica — tudo na plataforma oficial da UFRA.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/eventos">
                <Button 
                  size="lg" 
                  id="btn-explorar-eventos"
                  className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-300 text-green-900 font-bold text-lg px-8 py-6 rounded-xl shadow-2xl shadow-yellow-400/30 hover:shadow-yellow-400/50 transition-all duration-300 hover:scale-105"
                >
                  Explorar Eventos
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/cadastro">
                <Button 
                  size="lg"
                  variant="outline"
                  id="btn-criar-conta"
                  className="w-full sm:w-auto border-2 border-white/30 bg-white/10 text-white hover:bg-white/20 font-semibold text-lg px-8 py-6 rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105"
                >
                  Criar Conta Gratuita
                  <GraduationCap className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="mt-12 flex flex-wrap justify-center gap-6 text-white/60 text-sm"
            >
              {['✓ Gratuito para alunos UFRA', '✓ Certificados com QR Code', '✓ Inscrição em segundos'].map((item) => (
                <span key={item} className="flex items-center gap-1">
                  <span>{item}</span>
                </span>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-white/60 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ========================================
          STATS SECTION
      ======================================== */}
      <section className="py-20 bg-card/50 border-y border-border">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className="text-center"
              >
                <div className="flex justify-center mb-3">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <StatsCounter value={stat.value} suffix={stat.suffix} />
                <p className="text-muted-foreground text-sm mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========================================
          FEATURED EVENTS
      ======================================== */}
      <section className="py-24 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            Em Destaque
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Eventos em Destaque
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Confira os eventos mais esperados do semestre na UFRA Campus Paragominas.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {featuredEvents.map((event) => (
            <motion.div key={event.id} variants={itemVariants}>
              <EventCard event={event as any} />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Link href="/eventos">
            <Button variant="outline" size="lg" className="group" id="btn-ver-todos-eventos">
              Ver Todos os Eventos
              <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* ========================================
          CATEGORIES
      ======================================== */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Explore por Categoria
            </h2>
            <p className="text-muted-foreground">
              Encontre eventos do seu interesse acadêmico.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {categories.map((cat) => (
              <motion.div key={cat.name} variants={itemVariants}>
                <Link href={`/eventos?category=${cat.name.toLowerCase()}`}>
                  <div className="card-hover p-5 rounded-2xl bg-card border border-border text-center group cursor-pointer">
                    <span className="text-3xl mb-3 block">{cat.icon}</span>
                    <h3 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">{cat.count} eventos</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========================================
          FEATURES SECTION
      ======================================== */}
      <section className="py-24 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            Por Que Usar?
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Tudo que você precisa em{' '}
            <span className="text-primary">um só lugar</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Uma plataforma completa para toda a vida acadêmica da UFRA, 
            do evento ao certificado.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="p-6 rounded-2xl bg-card border border-border card-hover group"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ========================================
          CTA SECTION
      ======================================== */}
      <section className="py-24 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="container mx-auto max-w-4xl"
        >
          <div className="relative overflow-hidden rounded-3xl gradient-ufra p-12 text-center text-white">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

            <div className="relative z-10">
              <GraduationCap className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
              <h2 className="text-4xl md:text-5xl font-black mb-4">
                Comece Agora, É Gratuito
              </h2>
              <p className="text-xl text-white/80 mb-8 max-w-xl mx-auto">
                Faça parte da comunidade acadêmica digital da UFRA. 
                Inscreva-se em eventos e obtenha seus certificados.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/cadastro">
                  <Button 
                    size="lg"
                    id="btn-cadastro-cta"
                    className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-300 text-green-900 font-bold text-lg px-8 py-6 rounded-xl shadow-lg hover:scale-105 transition-all"
                  >
                    Criar Conta Agora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/certificados">
                  <Button 
                    size="lg"
                    variant="outline"
                    id="btn-validar-certificado"
                    className="w-full sm:w-auto border-2 border-white/40 bg-white/10 text-white hover:bg-white/20 font-semibold text-lg px-8 py-6 rounded-xl backdrop-blur-sm transition-all hover:scale-105"
                  >
                    Validar Certificado
                    <CheckCircle className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
