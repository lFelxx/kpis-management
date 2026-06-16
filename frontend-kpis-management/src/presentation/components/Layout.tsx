import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { OnboardingWizard } from "./OnboardingWizard";
import { useSidebarStore } from "../stores/ui/sidebar.store";
import { useIsMobile } from "../hooks/useIsMobile";
import { useOnboardingStore } from "../stores/ui/onboarding.store";
import { FiMenu } from "react-icons/fi";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isCollapsed, isMobileOpen, openMobile, closeMobile } = useSidebarStore();
  const { visible: onboardingVisible, dismiss: dismissOnboarding } = useOnboardingStore();
  const isMobile = useIsMobile();
  const { pathname } = useLocation();

  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      {/* Backdrop para cerrar sidebar en mobile */}
      <AnimatePresence>
        {isMobile && isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeMobile}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <motion.main
        className="flex-1 min-w-0"
        animate={{ marginLeft: isMobile ? 0 : (isCollapsed ? 68 : 288) }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Top bar solo en mobile */}
        {isMobile && (
          <div
            className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 backdrop-blur-md"
            style={{
              background: 'var(--s-sidebar)',
              borderBottom: '1px solid var(--b-line)',
            }}
          >
            <button
              onClick={openMobile}
              aria-label="Abrir menú"
              className="p-1.5 rounded-lg transition-colors cursor-pointer"
              style={{ color: 'var(--t-muted)' }}
            >
              <FiMenu size={20} />
            </button>
            <span
              className="text-sm font-bold tracking-tight"
              style={{ color: 'var(--t-secondary)' }}
            >
              KPIs Management
            </span>
          </div>
        )}

        {children}
      </motion.main>

      <AnimatePresence>
        {onboardingVisible && (
          <OnboardingWizard onDismiss={dismissOnboarding} />
        )}
      </AnimatePresence>
    </div>
  );
};
