'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Calendar, Users, Award, FileText,
  BarChart3, Settings, LogOut, GraduationCap, ChevronLeft,
  ChevronRight, Bell, Menu, X, UserCog, Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { toast } from 'sonner';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/eventos', label: 'Eventos', icon: Calendar },
  { href: '/admin/usuarios', label: 'Usuários', icon: Users },
  { href: '/admin/certificados', label: 'Certificados', icon: Award },
  { href: '/admin/submissoes', label: 'Submissões', icon: FileText },
  { href: '/admin/categorias', label: 'Categorias', icon: Tag },
  { href: '/admin/relatorios', label: 'Relatórios', icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      toast.error('Acesso restrito. Faça login como administrador.');
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'ADMIN') return null;

  const handleLogout = () => {
    logout();
    toast.success('Sessão encerrada.');
    router.push('/');
  };

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const initials = user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  const SidebarContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 p-4 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 rounded-xl bg-yellow-400 flex items-center justify-center shrink-0">
          <GraduationCap className="w-5 h-5 text-green-900" />
        </div>
        {!collapsed && (
          <div>
            <p className="font-black text-sm text-sidebar-foreground">UFRA Eventos</p>
            <p className="text-xs text-sidebar-foreground/60">Painel Admin</p>
          </div>
        )}
      </div>

      <Separator className="bg-sidebar-border mx-2" />

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  active
                    ? 'bg-yellow-400/15 text-yellow-400'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className={`w-5 h-5 shrink-0 ${active ? 'text-yellow-400' : ''}`} />
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
                {active && !collapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-yellow-400" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <Separator className="bg-sidebar-border mx-2" />

      {/* User */}
      <div className={`p-3 ${collapsed ? 'items-center flex flex-col gap-2' : ''}`}>
        <div className={`flex items-center gap-3 p-2 rounded-xl ${!collapsed ? 'hover:bg-sidebar-accent' : ''} transition-colors`}>
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarImage src={user.avatar || ''} />
            <AvatarFallback className="bg-yellow-400 text-green-900 text-xs font-black">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-sidebar-foreground truncate">{user.name}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">{user.email}</p>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size={collapsed ? 'icon' : 'sm'}
          className={`text-sidebar-foreground/60 hover:text-red-400 hover:bg-red-400/10 ${!collapsed ? 'w-full justify-start' : ''}`}
          onClick={handleLogout}
          id="btn-admin-logout"
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span className="ml-2 text-xs">Sair</span>}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 240 : 68 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="hidden md:flex flex-col bg-sidebar border-r border-sidebar-border shrink-0 overflow-hidden"
      >
        <SidebarContent collapsed={!sidebarOpen} />
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ duration: 0.25 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-60 bg-sidebar border-r border-sidebar-border md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 border-b border-border bg-background/95 backdrop-blur flex items-center px-4 gap-3 shrink-0">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            id="btn-mobile-sidebar"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Desktop collapse button */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            id="btn-toggle-sidebar"
          >
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>

          {/* Breadcrumb placeholder */}
          <div className="flex-1" />

          {/* Actions */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            id="btn-admin-theme"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          <Button variant="ghost" size="icon" className="relative" id="btn-admin-notifications">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-yellow-400 rounded-full" />
          </Button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
