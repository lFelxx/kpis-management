import React from 'react';
import { motion } from 'framer-motion';

interface AdviserInfoBoxProps {
  sales: number;
  goal: number;
  active: boolean;
  upt?: string;
  salesColor?: string;
  goalColor?: string;
  stateActiveColor?: string;
  stateInactiveColor?: string;
  bgColor?: string;
  className?: string;
  currencySymbol?: string;
  labelColor?: string;
  separatorColor?: string;
}

const AdviserInfoBox: React.FC<AdviserInfoBoxProps> = ({
  sales,
  goal,
  active,
  upt,
  salesColor = 'text-chart-1',
  goalColor = 'text-chart-2',
  stateActiveColor = 'bg-chart-1/20 text-chart-1 hover:bg-chart-1/30',
  stateInactiveColor = 'bg-muted text-muted-foreground hover:bg-muted/80',
  bgColor = 'bg-card',
  className = '',
  currencySymbol = '$',
  labelColor = 'text-muted-foreground',
  separatorColor = 'from-transparent via-border to-transparent',
}) => {
  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
      },
    }),
  };

  return (
    <div
      className={`rounded-2xl px-5 py-5 shadow-md border border-border flex flex-col gap-3 items-center w-full ${bgColor} ${className} transition-all duration-300 hover:shadow-lg`}
    >
      <motion.div 
        custom={0}
        initial="hidden"
        animate="visible"
        variants={itemVariants}
        className="flex justify-between items-center w-full group"
      >
        <span className={`text-sm ${labelColor} font-semibold`}>Ventas</span>
        <motion.span 
          whileHover={{ scale: 1.05 }}
          className={`text-lg font-extrabold ${salesColor} transition-colors`}
        >
          {currencySymbol}{(sales ?? 0).toLocaleString()}
        </motion.span>
      </motion.div>

      <div className={`w-full h-px bg-gradient-to-r ${separatorColor} opacity-50`} />

      <motion.div 
        custom={1}
        initial="hidden"
        animate="visible"
        variants={itemVariants}
        className="flex justify-between items-center w-full group"
      >
        <span className={`text-sm ${labelColor} font-semibold`}>Meta</span>
        <motion.span 
          whileHover={{ scale: 1.05 }}
          className={`text-lg font-extrabold ${goalColor} transition-colors`}
        >
          {currencySymbol}{(goal ?? 0).toLocaleString()}
        </motion.span>
      </motion.div>

      <div className={`w-full h-px bg-gradient-to-r ${separatorColor} opacity-50`} />

      <motion.div 
        custom={2}
        initial="hidden"
        animate="visible"
        variants={itemVariants}
        className="flex justify-between items-center w-full"
      >
        <span className={`text-sm ${labelColor} font-semibold`}>Estado</span>
        <motion.span
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-300 shadow-sm ${
            active ? stateActiveColor : stateInactiveColor
          }`}
        >
          {active ? 'Activo' : 'Inactivo'}
        </motion.span>
      </motion.div>

      {upt !== undefined && (
        <>
          <div className={`w-full h-px bg-gradient-to-r ${separatorColor} opacity-50`} />
          <motion.div 
            custom={3}
            initial="hidden"
            animate="visible"
            variants={itemVariants}
            className="flex justify-between items-center w-full group"
          >
            <span className={`text-sm ${labelColor} font-semibold`}>UPT</span>
            <motion.span 
              whileHover={{ scale: 1.05 }}
              className="text-lg font-extrabold text-accent-foreground transition-colors"
            >
              {upt || ''}
            </motion.span>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default AdviserInfoBox;