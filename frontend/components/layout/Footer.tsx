import Link from 'next/link';
import { GraduationCap, Mail, MapPin, Phone, Globe, Share2, Rss } from 'lucide-react';

import { Separator } from '@/components/ui/separator';

const footerLinks = {
  plataforma: [
    { label: 'Eventos', href: '/eventos' },
    { label: 'Certificados', href: '/certificados' },
    { label: 'Criar Conta', href: '/cadastro' },
    { label: 'Entrar', href: '/login' },
  ],
  institucional: [
    { label: 'Sobre a UFRA', href: 'https://www.ufra.edu.br', external: true },
    { label: 'Campus Paragominas', href: 'https://www.ufra.edu.br/paragominas', external: true },
    { label: 'Portal do Aluno', href: 'https://sipac.ufra.edu.br', external: true },
  ],
  suporte: [
    { label: 'FAQ', href: '/faq' },
    { label: 'Contato', href: '/contato' },
    { label: 'Política de Privacidade', href: '/privacidade' },
    { label: 'Termos de Uso', href: '/termos' },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <span className="font-black text-xl">UFRA</span>
                <span className="font-bold text-xl text-primary"> Eventos</span>
              </div>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-xs">
              Plataforma oficial de gerenciamento de eventos acadêmicos da 
              Universidade Federal Rural da Amazônia – Campus Paragominas.
            </p>

            {/* Contact */}
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span>Rodovia PA-256, Km 02 – Paragominas, PA</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span>eventos@paragominas.ufra.edu.br</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span>(91) 3729-3510</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3 mt-6">
              {[
                { icon: Globe, href: 'https://www.instagram.com/ufraparagominas', label: 'Instagram' },
                { icon: Share2, href: '#', label: 'Redes Sociais' },
                { icon: Rss, href: '#', label: 'RSS' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:scale-110"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-bold text-sm mb-4 uppercase tracking-wider text-muted-foreground">
              Plataforma
            </h3>
            <ul className="space-y-2">
              {footerLinks.plataforma.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-sm mb-4 uppercase tracking-wider text-muted-foreground">
              Institucional
            </h3>
            <ul className="space-y-2">
              {footerLinks.institucional.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-sm mb-4 uppercase tracking-wider text-muted-foreground">
              Suporte
            </h3>
            <ul className="space-y-2">
              {footerLinks.suporte.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>
            © {currentYear} UFRA Eventos – Campus Paragominas. Todos os direitos reservados.
          </p>
          <p className="flex items-center gap-1">
            Desenvolvido com ❤️ para a comunidade acadêmica da UFRA
          </p>
        </div>
      </div>
    </footer>
  );
}
