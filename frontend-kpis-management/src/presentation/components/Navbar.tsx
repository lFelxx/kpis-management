import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/advisers', label: 'Asesores' },
    { path: '/advisory-team', label: 'Equipo Asesor' }
  ];

  return (
    <nav className="bg-card shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo y nombre de la aplicación */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent">
                KPIs Management
              </span>
            </div>
          </div>

          {/* Navegación */}
          <div className="flex items-center space-x-4">
            {navItems.map((item) => (
              <motion.button
                key={item.path}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(item.path)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  isActive(item.path)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                {item.label}
              </motion.button>
            ))}
          </div>

          {/* Perfil/Usuario */}
          <div className="flex items-center">
            <button className="flex items-center space-x-2 text-muted-foreground hover:text-foreground">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-medium">U</span>
              </div>
              <span className="text-sm font-medium">Usuario</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}; 