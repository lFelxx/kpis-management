import { NavLink, useNavigate } from 'react-router-dom';
import { FaChartPie, FaUserTie, FaUsers, FaGift, FaHeart, FaSignOutAlt, FaMoon, FaSun } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAuth } from '../../infrastructure/hooks/useAuth';
import { useTheme } from '../../infrastructure/hooks/useTheme';

const menuItems = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: FaChartPie,
    description: 'Dashboard',
  },
  {
    label: 'Asesores',
    to: '/advisers',
    icon: FaUserTie,
    description: 'Listado de asesores',
  },
  {
    label: 'Equipo',
    to: '/advisory-team',
    icon: FaUsers,
    description: 'Miembros del equipo',
  },
  {
    label: 'Recompensas',
    to: '/tasks',
    icon: FaGift,
    description: 'Recompensas',
    disabled: true,
  },
  {
    label: 'Administración',
    to: '/events',
    icon: FaHeart,
    description: 'Administración',
    disabled: true,
  },
];

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const userName = user?.username || 'Usuario';
  const userAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=10b981&color=fff&bold=true`;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <motion.aside
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "circOut" }}
      className="h-screen w-72 bg-white/80 dark:bg-black/40 backdrop-blur-3xl text-slate-900 dark:text-white flex flex-col fixed border-r border-slate-200 dark:border-white/5 z-50 overflow-hidden font-sans shadow-xl dark:shadow-none"
    >
      {/* Background Ornaments */}
      <div className="absolute -top-20 -left-20 w-40 h-40 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute top-1/2 -right-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Brand Header */}
      <div className="p-8 pb-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex flex-col gap-1 cursor-default text-left"
        >
          <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-cyan-700 dark:from-emerald-400 dark:to-cyan-500 tracking-tighter">
            KPIs Management
          </span>
          <div className="h-[2px] w-12 bg-gradient-to-r from-emerald-500 to-transparent rounded-full" />
        </motion.div>
      </div>

      {/* User Status Card */}
      <div className="px-6 py-6">
        <div className="bg-slate-900/5 dark:bg-white/5 rounded-[1.5rem] p-4 border border-slate-900/5 dark:border-white/5 flex items-center gap-4 group hover:bg-slate-900/10 dark:hover:bg-white/10 transition-colors duration-500">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-1 bg-gradient-to-r from-emerald-500/50 to-cyan-500/50 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
            />
            <img
              src={userAvatar}
              alt={userName}
              className="relative w-11 h-11 rounded-xl bg-slate-100 dark:bg-black border border-slate-200 dark:border-white/10 object-contain p-0.5"
            />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-black" />
          </div>
          <div className="flex flex-col overflow-hidden text-left translate-x-1">
            <span className="text-[10px] text-slate-950/40 dark:text-white/40 font-black uppercase tracking-widest leading-tight">Admin</span>
            <span className="font-bold text-sm truncate leading-tight mt-0.5">{userName}</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              `group relative flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-500
              ${isActive
                ? 'bg-emerald-500/10 dark:bg-white/10 text-emerald-700 dark:text-white shadow-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)]'
                : 'text-slate-950/40 dark:text-white/40 hover:text-emerald-700 dark:hover:text-white hover:bg-emerald-500/5 dark:hover:bg-white/5'
              }
              ${item.disabled ? 'opacity-30 grayscale pointer-events-none' : ''}`
            }
            end
          >
            {({ isActive }) => (
              <>
                <div className={`transition-all duration-500 ${isActive ? 'text-emerald-600 dark:text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'group-hover:text-emerald-600 dark:group-hover:text-white'}`}>
                  <item.icon size={20} />
                </div>
                <div className="flex flex-col text-left">
                  <span className={`font-bold text-sm tracking-tight transition-colors duration-300 ${isActive ? 'text-emerald-800 dark:text-white' : ''}`}>
                    {item.label}
                  </span>
                  <span className={`text-[9px] font-black tracking-[0.15em] transition-all duration-500 ${isActive ? 'text-emerald-600/80 dark:text-emerald-400/80' : 'text-slate-950/20 dark:text-white/20 group-hover:text-slate-950/40 dark:group-hover:text-white/40'
                    }`}>
                    {item.description}
                  </span>
                </div>

                {isActive && (
                  <motion.div
                    layoutId="sidebarActive"
                    className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent rounded-2xl border-l-[3px] border-emerald-600 dark:border-emerald-500"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Compact Utility Footer */}
      <div className="p-6 mb-2 mt-auto">
        <div className="bg-slate-900/5 dark:bg-white/5 rounded-3xl p-2 border border-slate-900/5 dark:border-white/5 flex gap-2">
          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 py-3 flex items-center justify-center rounded-2xl bg-white/50 dark:bg-white/5 shadow-sm dark:shadow-none hover:bg-white dark:hover:bg-white/10 transition-colors text-slate-900/60 dark:text-white/60 hover:text-emerald-600 dark:hover:text-white cursor-pointer"
            title={theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
          >
            {theme === 'dark' ? <FaSun size={16} /> : <FaMoon size={16} />}
          </motion.button>

          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 py-3 flex items-center justify-center rounded-2xl bg-white/50 dark:bg-white/5 shadow-sm dark:shadow-none hover:bg-red-500/10 dark:hover:bg-red-500/20 transition-all text-slate-900/60 dark:text-white/60 hover:text-red-500 dark:hover:text-red-400 cursor-pointer"
            title="Cerrar sesión"
          >
            <FaSignOutAlt size={16} />
          </motion.button>
        </div>
      </div>
    </motion.aside>
  );
};