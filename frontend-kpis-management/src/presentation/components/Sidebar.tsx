import { NavLink, useNavigate } from 'react-router-dom';
import { FaChartPie, FaUserTie, FaUsers, FaGift, FaHeart, FaSignOutAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAuth } from '../../infrastructure/hooks/useAuth';

const menuItems = [
  {
    label: 'Dashboard',
    to: '/',
    icon: FaChartPie,
    description: 'Visualizar data',
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
    label: 'Sitema de recompensas',
    to: '/tasks',
    icon: FaGift,
    description: 'Proximamente...',
    disabled: true,
  },
  {
    label: 'Eventos',
    to: '/events',
    icon: FaHeart,
    description: 'Proximamente...',
    disabled: true,
  },
];

export const Sidebar = () => {
  const user = {
    name: 'Gina Diaz',
    avatar: 'https://ui-avatars.com/api/?name=Gina+Diaz&background=0D8ABC&color=fff',
  };

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="h-screen w-72 bg-black text-white flex flex-col shadow-2xl fixed"
    >
      {/* Header con perfil */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img 
              src={user.avatar} 
              alt="PUMA Logo" 
              className="w-12 h-12 rounded-xl ring-2 ring-white/10 hover:ring-white/20 transition-all duration-300 bg-white p-1 object-contain"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-black"></div>
          </div>
          <div>
            <span className="text-xs text-white/60">Bienvenido,</span>
            <div className="font-bold text-base text-white">{user.name}</div>
          </div>
        </div>
      </div>

      {/* Menú de navegación */}
      <nav className="flex-1 py-6 px-3 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
              ${isActive 
                ? 'bg-white/5 text-white shadow-lg shadow-black/50' 
                : 'hover:bg-white/5 text-white/70 hover:text-white'
              }
              ${item.disabled ? 'opacity-50 pointer-events-none' : ''}`
            }
            end
          >
            {({ isActive }) => (
              <>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-2 rounded-lg ${isActive ? 'bg-white/10' : 'bg-white/5'}`}
                >
                  <item.icon size={20} className="shrink-0" />
                </motion.div>
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{item.label}</span>
                  <span className={`text-xs transition-colors duration-300 ${
                    isActive ? 'text-white/80' : 'text-white/50 group-hover:text-white/70'
                  }`}>
                    {item.description}
                  </span>
                </div>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 w-1 h-8 bg-emerald-500 rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer con logout */}
      <div className="p-6 border-t border-white/5">
        <motion.button
          onClick={handleLogout}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-3 text-white/70 hover:text-red-400 transition-colors text-sm font-medium group"
        >
          <div className="p-2 rounded-lg bg-white/5 group-hover:bg-red-500/20 transition-colors">
            <FaSignOutAlt size={18} />
          </div>
          <div className="flex flex-col">
            <span>Logout</span>
            <span className="text-xs text-white/50 group-hover:text-red-300/60">
              Cerrar sesión
            </span>
          </div>
        </motion.button>
      </div>
    </motion.aside>
  );
}; 