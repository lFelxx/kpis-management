import React from "react";
import { Adviser } from "../../../../core/domain/Adviser/Adviser";
import { useNavigate } from "react-router-dom";

interface AdviserCardProps {
  adviser: Adviser;
}

export const AdviserCard: React.FC<AdviserCardProps> = ({ adviser }) => {
  const navigate = useNavigate();

  // Calcula el progreso (puede ser mayor a 100%)
  const progress = adviser.goalValue
    ? Math.min(((adviser.currentMonthSales ?? 0) / adviser.goalValue) * 100, 100)
    : 0;

  return (
    <div className="bg-card rounded-xl shadow-md p-6 flex flex-col items-start max-w-md w-full min-h-[240px] hover:shadow-lg transition-all duration-200 border border-border">
      <div className="flex items-center justify-between w-full mb-4">
        <span className="font-bold text-2xl text-chart-1">
          {adviser.name} {adviser.lastName}
        </span>
        <span
          className={`flex items-center text-base px-3 py-1 rounded-full ${
            adviser.active
              ? "bg-chart-1/20 text-chart-1"
              : "bg-destructive/20 text-destructive"
          }`}
        >
          {adviser.active ? "ACTIVO" : "INACTIVO"}
        </span>
      </div>
      <div className="text-lg text-foreground mb-1">
        Ventas:{" "}
        <span className="font-bold text-chart-1">
          ${adviser.currentMonthSales?.toLocaleString() ?? 0}
        </span>
      </div>
      <div className="text-lg text-foreground mb-2">
        Meta:{" "}
        <span className="font-bold text-chart-2">
          ${adviser.goalValue?.toLocaleString() ?? 0}
        </span>
      </div>
      <div className="text-lg text-foreground mb-2">
        UPT:{" "}
        <span className="font-bold text-card-foreground">
          {adviser.upt || ''}
        </span>
      </div>
      {/* Barra de progreso */}
      <div className="w-full mb-2">
        <div className="w-full bg-muted rounded-full h-2.5">
          <div
            className="bg-chart-1 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>Progreso</span>
          <span className="font-semibold text-chart-1">
            {adviser.goalValue 
              ? (((adviser.currentMonthSales ?? 0) / adviser.goalValue) * 100).toFixed(1)
              : '0.0'
            }%
          </span>
        </div>
      </div>
      <button
        className="mt-auto w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg py-3 text-base font-bold transition"
        onClick={() => navigate(`/advisers/${adviser.id}`)}
      >
        Ver Detalle
      </button>
    </div>
  );
};