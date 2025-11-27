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
  salesColor = 'text-emerald-600',
  goalColor = 'text-emerald-600',
  stateActiveColor = 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200',
  stateInactiveColor = 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  bgColor = 'bg-gray-100',
  className = '',
  currencySymbol = '$',
  labelColor = 'text-gray-600',
  separatorColor = 'from-transparent via-gray-300 to-transparent',
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
      className={`rounded-2xl px-5 py-5 shadow-lg border border-gray-200/50 flex flex-col gap-3 items-center w-full ${bgColor} ${className} transition-all duration-300 hover:shadow-xl`}
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
              className="text-lg font-extrabold text-indigo-600 transition-colors"
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