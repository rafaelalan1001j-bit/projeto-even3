'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, CheckCircle, Search, XCircle, Loader2, Calendar, MapPin, Clock } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';

interface CertificateData {
  id: string;
  code: string;
  issuedAt: string;
  isValid: boolean;
  participantName: string;
  eventTitle: string;
  workload: number;
  eventStartDate: string;
  eventEndDate?: string;
  downloadCount: number;
  user: { name: string; institution: string | null };
  event: { slug: string; location: string };
}

export default function ValidaCertificadoPage() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CertificateData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) return;

    setIsLoading(true);
    setError(null);
    setSearched(true);
    setResult(null);

    try {
      const { data } = await api.get(`/certificates/validate/${code.trim()}`);
      setResult(data.data);
    } catch (err: any) {
      setError(err.message || 'Certificado não encontrado. Verifique o código digitado.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Award className="w-10 h-10 text-yellow-500" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-4">Validação de Certificado</h1>
            <p className="text-muted-foreground text-lg">
              Verifique a autenticidade de um certificado emitido pela plataforma UFRA Eventos.
            </p>
          </div>

          <Card className="shadow-lg border-primary/20 mb-8">
            <CardContent className="p-6 md:p-8">
              <form onSubmit={handleValidate} className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Digite o código do certificado (Ex: d4f8-12ab...)"
                    className="pl-12 h-14 text-lg bg-muted/50 border-border rounded-xl"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="h-14 px-8 text-lg rounded-xl font-bold"
                  disabled={isLoading || !code.trim()}
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Validar Agora'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {searched && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {error ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
                  <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Certificado Inválido ou Não Encontrado</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">{error}</p>
                </div>
              ) : result ? (
                <div className={`border rounded-2xl p-8 text-center relative overflow-hidden ${
                  result.isValid 
                    ? 'bg-green-500/5 border-green-500/20' 
                    : 'bg-orange-500/5 border-orange-500/20'
                }`}>
                  {/* Decorative background logo */}
                  <Award className={`absolute -right-10 -bottom-10 w-64 h-64 opacity-5 ${
                    result.isValid ? 'text-green-500' : 'text-orange-500'
                  }`} />
                  
                  <div className="relative z-10">
                    {result.isValid ? (
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    ) : (
                      <XCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                    )}

                    <h3 className={`text-2xl font-bold mb-2 ${
                      result.isValid ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
                    }`}>
                      {result.isValid ? 'Certificado Autêntico e Válido' : 'Certificado Revogado ou Suspenso'}
                    </h3>
                    
                    <p className="text-muted-foreground mb-8">
                      Este certificado está devidamente registrado na base de dados da UFRA.
                    </p>

                    <div className="bg-card border border-border rounded-xl p-6 text-left space-y-4 shadow-sm max-w-xl mx-auto">
                      
                      <div>
                        <p className="text-sm text-muted-foreground font-medium mb-1">Participante</p>
                        <p className="text-lg font-bold">{result.participantName}</p>
                        {result.user.institution && (
                          <p className="text-sm text-muted-foreground">{result.user.institution}</p>
                        )}
                      </div>

                      <div className="h-px w-full bg-border" />

                      <div>
                        <p className="text-sm text-muted-foreground font-medium mb-1">Evento</p>
                        <p className="text-lg font-bold">
                          <Link href={`/eventos/${result.event.slug}`} className="hover:text-primary transition-colors">
                            {result.eventTitle}
                          </Link>
                        </p>
                        
                        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4 text-primary" />
                            <span>Carga horária: {result.workload}h</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span>
                              {format(new Date(result.eventStartDate), 'dd/MM/yyyy')}
                              {result.eventEndDate && result.eventEndDate !== result.eventStartDate 
                                ? ` a ${format(new Date(result.eventEndDate), 'dd/MM/yyyy')}` 
                                : ''}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="h-px w-full bg-border" />

                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground font-medium mb-1">Data de Emissão</p>
                          <p className="font-semibold">{format(new Date(result.issuedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground font-medium mb-1">Código de Validação</p>
                          <Badge variant="outline" className="font-mono text-sm tracking-widest bg-muted">
                            {result.code}
                          </Badge>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              ) : null}
            </motion.div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
