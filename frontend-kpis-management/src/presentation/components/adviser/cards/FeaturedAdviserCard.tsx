import React from "react";
import { Adviser } from "../../../../core/domain/Adviser/Adviser";
import { motion } from 'framer-motion';
import { TrophyIcon, ArrowTrendingUpIcon, SparklesIcon } from "@heroicons/react/24/solid";
import { Target, Zap, TrendingUp } from 'lucide-react';

interface FeaturedAdviserCardProps {
    adviser: Adviser | null;
    type: 'best' | 'worst';
}

const FeaturedAdviserCard: React.FC<FeaturedAdviserCardProps> = ({ adviser, type }) => {
    // Para el tipo 'worst', si no hay asesor, no mostrar nada
    if (!adviser && type === 'worst') {
        return null;
    }

    const achievement = adviser?.goalValue && adviser.goalValue > 0 && adviser.currentMonthSales !== undefined
        ? (adviser.currentMonthSales / adviser.goalValue) * 100
        : 0;

    const initials = `${adviser?.name?.charAt(0) || ''}${adviser?.lastName?.charAt(0) || ''}`;

    if (type === 'best') {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -8 }}
                className="relative group h-full"
            >
                {/* Radiant Background Aura */}
                <div className="absolute inset-x-0 -top-4 -bottom-4 bg-gradient-to-b from-emerald-500/20 via-cyan-500/10 to-transparent blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="relative overflow-hidden h-full bg-white/40 dark:bg-black/40 backdrop-blur-2xl rounded-[2rem] border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.1)] p-8 flex flex-col items-center text-center">
                    {/* Floating Medals Ornament */}
                    <div className="absolute top-4 right-4 animate-bounce">
                        <SparklesIcon className="w-6 h-6 text-emerald-500/50 dark:text-emerald-400 dark:opacity-50" />
                    </div>

                    {/* Champion Badge */}
                    <motion.div
                        animate={{
                            y: [0, -10, 0],
                            rotate: [0, 5, -5, 0]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="mb-6 bg-gradient-to-r from-emerald-500 to-cyan-500 p-4 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                    >
                        <TrophyIcon className="w-10 h-10 text-white" />
                    </motion.div>

                    <h3 className="text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-[0.3em] mb-2">Hall of Fame</h3>

                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter">
                        {adviser?.name} {adviser?.lastName}
                    </h2>

                    {/* Metric Spotlight */}
                    <div className="w-full bg-slate-900/5 dark:bg-white/5 rounded-3xl p-6 border border-slate-900/5 dark:border-white/5 mb-6">
                        <p className="text-slate-950/40 dark:text-white/40 text-[10px] font-black uppercase mb-2 tracking-widest text-center">Ventas del Mes</p>
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-emerald-600 to-cyan-600 dark:from-white dark:via-emerald-400 dark:to-cyan-400">
                                ${((adviser?.currentMonthSales ?? 0) / 1000).toFixed(0)}K
                            </span>
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                                <ArrowTrendingUpIcon className="w-4 h-4" />
                                <span>{achievement.toFixed(1)}% de la meta</span>
                            </div>
                        </div>
                    </div>

                    {/* Avatar Spotlight */}
                    <div className="relative mb-2">
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 bg-emerald-500/20 dark:bg-emerald-500/30 rounded-full blur-xl"
                        />
                        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-600 p-[2px]">
                            <div className="w-full h-full rounded-full bg-white dark:bg-black flex items-center justify-center border-2 border-white dark:border-black">
                                <span className="text-3xl font-black text-slate-900 dark:text-white">
                                    {initials}
                                </span>
                            </div>
                        </div>
                    </div>

                    <p className="text-slate-900/40 dark:text-white/40 text-xs italic mt-4 text-center">“La excelencia no es un acto, es un hábito”</p>
                </div>
            </motion.div>
        );
    }

    // TYPE: WORST - "Growth Roadmap"
    const gapToGoal = Math.max(0, (adviser?.goalValue ?? 0) - (adviser?.currentMonthSales ?? 0));

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative h-full"
        >
            <div className="relative h-full bg-slate-900/5 dark:bg-black/20 backdrop-blur-xl rounded-[2rem] border border-dashed border-orange-500/30 p-8 flex flex-col shadow-sm dark:shadow-none">
                <div className="flex justify-between items-start mb-8">
                    <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-2xl">
                        <Target className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="text-right">
                        <span className="px-3 py-1 bg-white dark:bg-white/5 rounded-full text-[10px] font-black text-orange-600 dark:text-orange-400 border border-orange-500/20 uppercase tracking-widest shadow-sm dark:shadow-none">
                            Plan Hermano
                        </span>
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter mb-1">
                        {adviser?.name} {adviser?.lastName}
                    </h2>
                    <p className="text-slate-950/40 dark:text-white/40 text-xs font-medium">Estamos aquí para apoyarte a subir de nivel</p>
                </div>

                {/* Growth Analysis */}
                <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-end text-xs mb-1">
                        <span className="text-slate-950/60 dark:text-white/60 font-bold uppercase tracking-widest text-[9px]">Progreso Actual</span>
                        <span className="text-orange-600 dark:text-orange-400 font-black">{achievement.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden border border-slate-300 dark:border-white/10">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(achievement, 100)}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-orange-500 to-pink-500"
                        />
                    </div>
                    <div className="bg-orange-500/5 rounded-2xl p-4 border border-orange-500/10">
                        <div className="flex items-center gap-3">
                            <Zap className="w-5 h-5 text-orange-600 dark:text-orange-300 animate-pulse" />
                            <div>
                                <p className="text-slate-950/40 dark:text-white/40 text-[10px] font-black uppercase tracking-widest">Meta Próximo Paso</p>
                                <p className="text-lg font-black text-slate-900 dark:text-white">Faltan ${(gapToGoal / 1000).toFixed(0)}K</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-6 border-t border-slate-900/5 dark:border-white/5 flex items-center justify-between text-left">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-900/5 dark:bg-white/5 flex items-center justify-center border border-slate-900/10 dark:border-white/10 text-left">
                            <span className="text-sm font-bold text-slate-900/60 dark:text-white/60">{initials}</span>
                        </div>
                        <span className="text-[10px] font-black text-slate-950/30 dark:text-white/30 uppercase tracking-[0.2em]">Ruta de Mejora</span>
                    </div>
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="p-2 bg-orange-500/10 dark:bg-orange-500/20 rounded-xl"
                    >
                        <TrendingUp className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default FeaturedAdviserCard;