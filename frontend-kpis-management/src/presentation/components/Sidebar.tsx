import { NavLink, useNavigate } from 'react-router-dom';
import { FaChartPie, FaUserTie, FaUsers, FaGift, FaHeart, FaSignOutAlt, FaMoon, FaSun, FaFileAlt, FaMoneyBillWave, FaFileCsv, FaQuestionCircle } from 'react-icons/fa';
import { useOnboardingStore } from '../stores/ui/onboarding.store';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useSidebarStore } from '../stores/ui/sidebar.store';
import { useIsMobile } from '../hooks/useIsMobile';
import { FiChevronRight } from 'react-icons/fi';

const EMERALD = '#34d399';

const BRAND_R   = 36;
const BRAND_C   = 2 * Math.PI * BRAND_R;
const BRAND_ARC = BRAND_C * 0.55;

const menuItems = [
  { label: 'Dashboard',      to: '/dashboard',     icon: FaChartPie, description: 'Panel de control' },
  { label: 'Asesores',       to: '/advisers',      icon: FaUserTie,  description: 'Listado de asesores' },
  { label: 'Equipo',         to: '/advisory-team', icon: FaUsers,    description: 'Miembros del equipo' },
  { label: 'Reporte',        to: '/report',        icon: FaFileAlt,       description: 'Reporte del mes' },
  { label: 'Presupuesto',   to: '/budget',        icon: FaMoneyBillWave, description: 'Distribución de metas' },
  { label: 'Ventas CSV',    to: '/sales-report',  icon: FaFileCsv,       description: 'Cargar reporte POS' },
  { label: 'Recompensas',    to: '/tasks',         icon: FaGift,     description: 'Recompensas',    disabled: true },
  { label: 'Administración', to: '/events',        icon: FaHeart,    description: 'Administración', disabled: true },
];

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const showOnboarding = useOnboardingStore((s) => s.show);
  const { isCollapsed, toggle, isMobileOpen, closeMobile } = useSidebarStore();
  const isMobile = useIsMobile();

  const userName   = user?.username || 'Usuario';
  const userAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=10b981&color=fff&bold=true`;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNavClick = () => {
    if (isMobile) closeMobile();
  };

  const sidebarVariants = isMobile
    ? { x: isMobileOpen ? 0 : -288, width: 288 }
    : { x: 0, width: isCollapsed ? 68 : 288 };

  const expanded = isMobile ? true : !isCollapsed;

  return (
    <motion.aside
      animate={sidebarVariants}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className="h-screen flex flex-col fixed z-50 overflow-hidden"
      style={{
        background: 'var(--s-sidebar)',
        borderRight: '1px solid var(--b-line)',
        minWidth: isMobile ? 288 : (isCollapsed ? 68 : 288),
      }}
    >
      {/* Brand */}
      <div className="relative overflow-hidden shrink-0" style={{ padding: expanded ? '24px 24px 12px' : '20px 0 12px' }}>
        <AnimatePresence>
          {expanded && (
            <>
              <svg
                className="absolute top-0 right-0 pointer-events-none opacity-20"
                width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden="true"
              >
                <circle cx="72" cy="0" r={BRAND_R} stroke={EMERALD} strokeWidth="1" fill="none"
                  strokeDasharray={`${BRAND_ARC} ${BRAND_C}`} strokeLinecap="round" />
              </svg>

              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-[9px] font-black tracking-[0.3em] uppercase block mb-1"
                  style={{ color: `${EMERALD}80` }}>
                  Mission Control
                </span>
                <span className="text-xl font-black tracking-tighter bg-clip-text text-transparent block"
                  style={{ backgroundImage: `linear-gradient(135deg, ${EMERALD}, #22d3ee)` }}>
                  KPIs Management
                </span>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {!expanded && (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `${EMERALD}18` }}>
              <FaChartPie size={15} style={{ color: EMERALD }} />
            </div>
          </div>
        )}
      </div>

      {/* User card */}
      <div className="shrink-0" style={{ padding: expanded ? '0 16px 8px' : '0 10px 8px' }}>
        <div
          className="rounded-2xl p-2.5 flex items-center gap-3 group cursor-default transition-colors duration-300"
          style={{ background: 'var(--s-subtle)', border: '1px solid var(--b-subtle)' }}
          title={!expanded ? userName : undefined}
        >
          <div className="relative shrink-0">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              className="absolute -inset-1 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: `linear-gradient(to right, ${EMERALD}50, #22d3ee50)` }}
            />
            <img src={userAvatar} alt={userName}
              className="relative w-9 h-9 rounded-xl object-contain p-0.5"
              style={{ background: 'var(--s-card)', border: '1px solid var(--b-subtle)' }}
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
              style={{ background: EMERALD, borderColor: 'var(--s-sidebar)' }} />
          </div>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.2 }}
                className="flex flex-col overflow-hidden min-w-0"
              >
                <span className="text-[9px] font-black uppercase tracking-[0.2em] leading-tight"
                  style={{ color: 'var(--t-muted)' }}>
                  Admin
                </span>
                <span className="font-bold text-sm truncate leading-tight mt-0.5"
                  style={{ color: 'var(--t-primary)' }}>
                  {userName}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Separador */}
      <div className="mx-3 mb-1 h-px shrink-0" style={{ background: 'var(--sep)' }} />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-hide py-1"
        style={{ padding: expanded ? '4px 12px' : '4px 8px' }}>
        {menuItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end
            onClick={handleNavClick}
            title={!expanded ? item.label : undefined}
            className={({ isActive }) =>
              `nav-item${isActive ? ' active' : ''} group relative flex items-center rounded-xl mb-0.5 transition-colors duration-300
              ${!expanded ? 'justify-center px-0 py-2.5' : 'gap-3.5 px-3.5 py-2.5'}
              ${item.disabled ? 'opacity-25 pointer-events-none' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <>
                    <motion.div
                      layoutId="sidebarActiveGlow"
                      className="absolute inset-0 rounded-xl pointer-events-none"
                      style={{
                        background: `radial-gradient(ellipse 80% 100% at 0% 50%, ${EMERALD}18 0%, transparent 70%)`,
                        border: `1px solid ${EMERALD}20`,
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                    <motion.div
                      layoutId="sidebarActiveLine"
                      className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full"
                      style={{ background: `linear-gradient(to bottom, ${EMERALD}, ${EMERALD}40)` }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  </>
                )}

                <div
                  className="relative z-10 shrink-0 transition-colors duration-300"
                  style={{
                    color: isActive ? EMERALD : undefined,
                    filter: isActive ? 'drop-shadow(0 0 6px rgba(52,211,153,0.5))' : undefined,
                  }}
                >
                  <item.icon size={17} />
                </div>

                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="relative z-10 flex flex-col text-left min-w-0 overflow-hidden"
                    >
                      <span className="font-semibold text-sm leading-tight truncate">
                        {item.label}
                      </span>
                      <span className="text-[9px] font-medium tracking-wide truncate mt-0.5"
                        style={{ color: isActive ? `${EMERALD}70` : 'var(--t-micro)' }}>
                        {item.description}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Separador */}
      <div className="mx-3 mt-1 h-px shrink-0" style={{ background: 'var(--sep)' }} />

      {/* Footer */}
      <div className="shrink-0 p-3 flex flex-col gap-1.5">

        <motion.button
          onClick={isMobile ? closeMobile : toggle}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className="w-full py-1.5 flex items-center justify-center gap-1.5 rounded-xl cursor-pointer transition-colors duration-200"
          style={{
            color: 'var(--t-muted)',
            background: 'var(--s-subtle)',
            border: '1px solid var(--b-subtle)',
          }}
          title={isMobile ? 'Cerrar menú' : (isCollapsed ? 'Expandir' : 'Colapsar')}
        >
          <motion.span
            animate={{ rotate: (!isMobile && isCollapsed) ? 0 : 180 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="flex items-center justify-center"
          >
            <FiChevronRight size={13} />
          </motion.span>
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.15 }}
                className="text-[10px] font-bold tracking-wide overflow-hidden whitespace-nowrap"
              >
                {isMobile ? 'Cerrar' : 'Colapsar'}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Ayuda */}
        <motion.button
          onClick={showOnboarding}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className="w-full py-2 flex items-center justify-center gap-2 rounded-xl cursor-pointer transition-colors duration-200"
          style={{
            color:      `${EMERALD}cc`,
            background: `${EMERALD}0e`,
            border:     `1px solid ${EMERALD}25`,
          }}
          title="Ver guía de uso"
        >
          <FaQuestionCircle size={13} />
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.15 }}
                className="text-[10px] font-black tracking-wide uppercase overflow-hidden whitespace-nowrap"
              >
                Guía de uso
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Tema + Logout */}
        <div
          className="p-1.5 rounded-xl"
          style={{ background: 'var(--s-subtle)', border: '1px solid var(--b-subtle)' }}
        >
          <div className={`flex ${!expanded ? 'flex-col gap-1' : 'flex-row gap-1.5'}`}>
            <motion.button
              onClick={toggleTheme}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="flex-1 py-2 flex items-center justify-center rounded-lg transition-colors duration-200 cursor-pointer"
              style={{ color: 'var(--t-muted)' }}
              title={theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
            >
              {theme === 'dark' ? <FaSun size={14} /> : <FaMoon size={14} />}
            </motion.button>

            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="flex-1 py-2 flex items-center justify-center rounded-lg transition-all duration-300 cursor-pointer hover:text-red-400"
              style={{ color: 'var(--t-muted)' }}
              title="Cerrar sesión"
            >
              <FaSignOutAlt size={14} />
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {expanded && import.meta.env.VITE_APP_VERSION && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex justify-center"
            >
              <span className="px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase"
                style={{ color: `${EMERALD}80`, background: `${EMERALD}10`, border: `1px solid ${EMERALD}20` }}>
                v{import.meta.env.VITE_APP_VERSION}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
};
