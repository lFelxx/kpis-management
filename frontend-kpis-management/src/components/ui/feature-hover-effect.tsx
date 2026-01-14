import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface FeatureCardItem {
    icon: React.ReactNode;
    title: string;
    description: string;
}

interface HoverEffectProps {
    items: FeatureCardItem[];
    className?: string;
}

export const FeatureHoverEffect = ({
    items,
    className,
}: HoverEffectProps) => {
    let [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <div
            className={cn(
                "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
                className
            )}
        >
            {items.map((item, idx) => (
                <div
                    key={idx}
                    className="relative group block p-2 h-full w-full"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                >
                    <AnimatePresence>
                        {hoveredIndex === idx && (
                            <motion.span
                                className="absolute inset-0 h-full w-full bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 block rounded-3xl"
                                layoutId="hoverBackground"
                                initial={{ opacity: 0 }}
                                animate={{
                                    opacity: 1,
                                    transition: { duration: 0.15 },
                                }}
                                exit={{
                                    opacity: 0,
                                    transition: { duration: 0.15, delay: 0.2 },
                                }}
                            />
                        )}
                    </AnimatePresence>
                    <FeatureCard>
                        <div className="mb-4 p-3 rounded-xl bg-white/5 inline-block">
                            {item.icon}
                        </div>
                        <FeatureCardTitle>{item.title}</FeatureCardTitle>
                        <FeatureCardDescription>{item.description}</FeatureCardDescription>
                    </FeatureCard>
                </div>
            ))}
        </div>
    );
};

export const FeatureCard = ({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) => {
    return (
        <div
            className={cn(
                "rounded-2xl h-full w-full p-[2px] transition-all duration-300 group-hover:bg-[linear-gradient(163deg,#00ff75_0%,#3700ff_100%)] group-hover:shadow-[0_0_30px_1px_rgba(0,255,117,0.30)]",
                className
            )}
        >
            <div className="p-6 h-full w-full rounded-2xl bg-[#1a1a1a]/80 backdrop-blur-md transition-all duration-200 group-hover:scale-[0.98] relative z-50">
                {children}
            </div>
        </div>
    );
};

export const FeatureCardTitle = ({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) => {
    return (
        <h3 className={cn("text-xl font-bold mb-2 text-white", className)}>
            {children}
        </h3>
    );
};

export const FeatureCardDescription = ({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) => {
    return (
        <p
            className={cn(
                "text-gray-400 text-sm leading-relaxed",
                className
            )}
        >
            {children}
        </p>
    );
};
