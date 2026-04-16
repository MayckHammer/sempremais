import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { setPreferredUserRole, signOut } from '@/lib/auth';
import { SidebarProvider, SidebarTrigger, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from '@/components/ui/sidebar';
import { NavLink } from '@/components/NavLink';
import { LayoutDashboard, Users, Wrench, Handshake, ClipboardList, DollarSign, Coins, Settings, LogOut, Crown, Headphones, Calculator } from 'lucide-react';
import logoSempre from '@/assets/logo-sempre.png';
import { Button } from '@/components/ui/button';
import AdminNotificationCenter from '@/components/AdminNotificationCenter';

const navItems = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard, end: true },
  { title: 'Clientes', url: '/admin/clients', icon: Users },
  { title: 'Prestadores', url: '/admin/providers', icon: Wrench },
  { title: 'Parceiros', url: '/admin/partners', icon: Handshake },
  { title: 'Solicitações', url: '/admin/requests', icon: ClipboardList },
  { title: 'Preços', url: '/admin/pricing', icon: DollarSign },
  { title: 'Planos', url: '/admin/plans', icon: Crown },
  { title: 'Carteira SBs', url: '/admin/wallets', icon: Coins },
  { title: 'Calculadora SB$', url: '/admin/calculator', icon: Calculator },
  { title: 'Suporte', url: '/admin/support', icon: Headphones },
  { title: 'Configurações', url: '/admin/settings', icon: Settings },
];

function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="bg-sidebar text-sidebar-foreground">
        {/* Brand */}
        <div className="p-4 flex items-center gap-2 border-b border-sidebar-border/30">
          <img src={logoSempre} alt="Sempre+" className="h-7 object-contain shrink-0" style={{ filter: 'brightness(0) invert(1)' }} />
          {!collapsed && (
            <span className="font-display font-bold text-[10px] text-sidebar-foreground/70 tracking-widest uppercase">
              Admin
            </span>
          )}
        </div>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.end}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-sm font-body"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Logout */}
        <div className="mt-auto p-3 border-t border-sidebar-border/30">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent text-sm font-body h-10"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Sair</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

export default function AdminLayout() {
  const { user, loading, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate('/admin/login'); return; }
    if (!user.roles.includes('admin')) { navigate('/'); return; }
    if (user.role !== 'admin') {
      setPreferredUserRole('admin');
      void refreshUser();
    }
  }, [user, loading, navigate, refreshUser]);

  if (loading || !user?.roles.includes('admin')) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 rounded-xl shimmer" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-3 border-b border-border px-4 bg-card shrink-0">
            <SidebarTrigger className="text-muted-foreground" />
            <span className="text-sm font-display font-bold text-foreground flex-1">
              {navItems.find(n => location.pathname === n.url || (n.url !== '/admin' && location.pathname.startsWith(n.url)))?.title || 'Dashboard'}
            </span>
            <AdminNotificationCenter />
          </header>
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
