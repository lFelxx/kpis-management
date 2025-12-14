import React from "react";
import { Adviser } from "../../../../core/domain/Adviser/Adviser";
import { motion } from 'framer-motion';
import { TrophyIcon } from "@heroicons/react/24/solid";
import { Frown } from 'lucide-react';

interface FeaturedAdviserCardProps {
    adviser: Adviser | null;
    type: 'best' | 'worst';
}

const styles = {
    best: {
        cardBg: 'bg-card',
        borderColor: 'border-chart-1',
        iconBg: 'bg-chart-1',
        avatarGradient: 'from-chart-1 to-primary',
        badgeGradient: 'from-chart-3 to-chart-3',
        salesColor: 'text-chart-1',
        progressBg: 'bg-chart-1/20',
        progressBar: 'bg-chart-1',
        statBorder: 'border-chart-1/30',
        statBg: 'bg-chart-1/10',
        label: 'Mejor Asesor',
        labelBg: 'bg-gradient-to-r from-chart-1 to-primary',
        labelIcon: '🏆',
        icon: TrophyIcon,
    },
    worst: {
        cardBg: 'bg-card',
        borderColor: 'border-chart-3',
        iconBg: 'bg-chart-3',
        avatarGradient: 'from-chart-3 to-destructive',
        badgeGradient: 'from-muted to-muted-foreground',
        salesColor: 'text-chart-3',
        progressBg: 'bg-chart-3/20',
        progressBar: 'bg-chart-3',
        statBorder: 'border-chart-3/30',
        statBg: 'bg-chart-3/10',
        label: 'Plan hermano',
        labelBg: 'bg-gradient-to-r from-chart-3 to-destructive',
        labelIcon: '⚡',
        icon: Frown,
    },
};


const FeaturedAdviserCard: React.FC<FeaturedAdviserCardProps> = ({ adviser, type }) => {
    const theme = styles[type];
    const Icon = theme.icon;

    // Para el tipo 'worst', si no hay asesor, no mostrar nada
    if (!adviser && type === 'worst') {
        return null;
    }

    // Calcular el porcentaje de cumplimiento de meta
    const achievement = adviser?.goalValue && adviser.goalValue > 0 && adviser.currentMonthSales !== undefined
        ? (adviser.currentMonthSales / adviser.goalValue) * 100
        : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
            className={`${theme.cardBg} rounded-xl shadow-lg border-2 ${theme.borderColor} p-4 hover:shadow-2xl transition-all duration-300`}
        >
            {/* Badge superior destacado */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 150 }}
                className="mb-4"
            >
                <div className={`${theme.labelBg} rounded-lg p-3 shadow-lg relative overflow-hidden`}>
                    {/* Efecto de brillo */}
                    <motion.div
                        animate={{
                            x: ['-200%', '200%'],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            repeatDelay: 2,
                            ease: "linear"
                        }}
                        className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    />
                    
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <motion.span 
                                animate={type === 'best' ? {
                                    rotate: [0, 15, -15, 0],
                                    scale: [1, 1.2, 1],
                                } : {
                                    scale: [1, 1.1, 1],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="text-2xl"
                            >
                                {theme.labelIcon}
                            </motion.span>
                            <div>
                                <p className="text-white/80 text-[10px] font-medium uppercase tracking-wider">
                                    {type === 'best' ? '¡Felicitaciones!' : 'Área de mejora'}
                                </p>
                                <h3 className="text-white text-lg font-black">
                                    {theme.label}
                                </h3>
                            </div>
                        </div>
                        
                    </div>
                </div>
            </motion.div>

            {/* Header con icono y nombre */}
            <div className="flex items-center gap-3 mb-4">
                {/* Icono circular */}
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                    className={`${theme.iconBg} p-2.5 rounded-lg inline-block shadow-lg`}
                >
                    {type === 'worst' ? (
                        <Icon className="w-6 h-6 text-white" strokeWidth={2} />
                    ) : (
                        <Icon className="w-6 h-6 text-white" />
                    )}
                </motion.div>

                {/* Nombre del asesor */}
                <motion.h2
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl font-bold text-foreground"
                >
                    {adviser?.name || ''} {adviser?.lastName || ''}
                </motion.h2>
            </div>

            {/* Avatar grande con iniciales */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="flex justify-center mb-4"
            >
                <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${theme.avatarGradient} flex items-center justify-center shadow-xl border-3 border-card ring-2 ring-border`}>
                    <span className="text-4xl font-extrabold text-white">
                        {adviser?.name?.charAt(0) || ''}{adviser?.lastName?.charAt(0) || ''}
                    </span>
                </div>
            </motion.div>

            {/* Métrica principal - Ventas */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`${theme.statBg} rounded-lg p-4 mb-3 border-2 ${theme.statBorder}`}
            >
                <p className="text-muted-foreground text-sm font-semibold mb-1">Ventas del Mes</p>
                <p className={`text-3xl font-black ${theme.salesColor} mb-3`}>
                    ${((adviser?.currentMonthSales ?? 0) / 1000).toFixed(0)}K
                </p>
                
                {/* Barra de progreso */}
                <div>
                    <div className="flex justify-end text-xs text-muted-foreground font-bold mb-1.5">
                        <span>{achievement.toFixed(1)}%</span>
                    </div>
                    <div className={`h-3 ${theme.progressBg} rounded-full overflow-hidden`}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(achievement, 100)}%` }}
                            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                            className={`h-full ${theme.progressBar} rounded-full`}
                        />
                    </div>
                </div>
            </motion.div>

            {/* Stat - Meta y Estado */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-2 gap-3"
            >
                {/* Meta */}
                <div className={`${theme.statBg} rounded-lg p-3 border ${theme.statBorder}`}>
                    <p className="text-muted-foreground text-xs font-semibold mb-1">Meta</p>
                    <p className={`text-xl font-bold ${theme.salesColor}`}>
                        ${((adviser?.goalValue ?? 0) / 1000).toFixed(0)}K
                    </p>
                </div>

                {/* Estado */}
                <div className={`${theme.statBg} rounded-lg p-3 border ${theme.statBorder} flex flex-col justify-start items-start`}>
                    <p className="text-muted-foreground text-xs font-semibold mb-1">Estado</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        adviser?.active 
                            ? 'bg-chart-1/20 text-chart-1' 
                            : 'bg-muted text-muted-foreground'
                    }`}>
                        {adviser?.active ? '✓ Activo' : '✗ Inactivo'}
                    </span>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default FeaturedAdviserCard;