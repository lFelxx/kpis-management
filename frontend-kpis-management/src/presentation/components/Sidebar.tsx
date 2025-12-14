import { NavLink, useNavigate } from 'react-router-dom';
import { FaChartPie, FaUserTie, FaUsers, FaGift, FaHeart, FaSignOutAlt, FaMoon, FaSun } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAuth } from '../../infrastructure/hooks/useAuth';
import { useTheme } from '../../infrastructure/hooks/useTheme';

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
    label: 'Administracion',
    to: '/events',
    icon: FaHeart,
    description: 'Proximamente...',
    disabled: true,
  },
];

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Generar avatar dinámicamente basado en el usuario
  const userName = user?.username || 'Usuario';
  const userAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0D8ABC&color=fff`;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="h-screen w-72 bg-sidebar text-sidebar-foreground flex flex-col shadow-lg fixed border-r border-sidebar-border"
    >
      {/* Header con perfil */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img 
              src={userAvatar} 
              alt={userName} 
              className="w-12 h-12 rounded-xl ring-2 ring-border hover:ring-primary transition-all duration-300 bg-background p-1 object-contain"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-chart-1 rounded-full border-2 border-sidebar"></div>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Bienvenido,</span>
            <div className="font-bold text-base text-sidebar-foreground">{userName}</div>
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
                ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-md' 
                : 'hover:bg-sidebar-accent/50 text-muted-foreground hover:text-sidebar-foreground'
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
                  className={`p-2 rounded-lg ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                >
                  <item.icon size={20} className="shrink-0" />
                </motion.div>
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{item.label}</span>
                  <span className={`text-xs transition-colors duration-300 ${
                    isActive ? 'text-sidebar-accent-foreground/80' : 'text-muted-foreground group-hover:text-sidebar-foreground/70'
                  }`}>
                    {item.description}
                  </span>
                </div>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 w-1 h-8 bg-primary rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer con logout */}
      <div className="p-6 border-t border-sidebar-border space-y-3">
        {/* Theme Toggle */}
        <motion.button
          onClick={toggleTheme}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium group"
        >
          <div className="p-2 rounded-lg bg-muted group-hover:bg-accent transition-colors">
            {theme === 'dark' ? <FaSun size={18} /> : <FaMoon size={18} />}
          </div>
          <div className="flex flex-col">
            <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}</span>
            <span className="text-xs text-muted-foreground">
              Cambiar tema
            </span>
          </div>
        </motion.button>

        {/* Logout Button */}
        <motion.button
          onClick={handleLogout}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center gap-3 text-muted-foreground hover:text-destructive transition-colors text-sm font-medium group"
        >
          <div className="p-2 rounded-lg bg-muted group-hover:bg-destructive/20 transition-colors">
            <FaSignOutAlt size={18} />
          </div>
          <div className="flex flex-col">
            <span>Logout</span>
            <span className="text-xs text-muted-foreground group-hover:text-destructive/60">
              Cerrar sesión
            </span>
          </div>
        </motion.button>
      </div>
    </motion.aside>
  );
}; 