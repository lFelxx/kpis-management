import React from 'react';
import { cn } from "@/lib/utils";

interface GradientCardProps {
    children: React.ReactNode;
    className?: string;
}

export const GradientCard = ({ children, className }: GradientCardProps) => {
    return (
        <div className={cn(
            "w-[190px] h-[254px] bg-[linear-gradient(163deg,#00ff75_0%,#3700ff_100%)] rounded-[20px] transition-all duration-300 hover:shadow-[0_0_30px_1px_rgba(0,255,117,0.30)]",
            className
        )}>
            <div className="w-full h-full bg-[#1a1a1a] rounded-[20px] transition-all duration-200 hover:scale-[0.98] hover:rounded-[20px] flex flex-col p-6 items-start justify-center text-left">
                {children}
            </div>
        </div>
    );
};
