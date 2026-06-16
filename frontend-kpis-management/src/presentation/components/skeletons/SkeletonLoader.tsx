import type { CSSProperties } from 'react';

/** Bloque rectangular con animación pulse — unidad base de todos los skeletons */
function Bone({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return (
    <div
      className={`animate-pulse rounded-lg ${className}`}
      style={{ background: 'var(--s-subtle)', ...style }}
    />
  );
}

// ─── DashboardCard skeleton ───────────────────────────────────────────────────

export function DashboardCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <div
      className="relative overflow-hidden rounded-[1.4rem] p-4 md:p-5"
      style={{
        background: 'var(--s-card)',
        border: '1px solid var(--b-line)',
        animationDelay: `${index * 70}ms`,
      }}
    >
      {/* Fila superior: icono + espacio tendencia */}
      <div className="flex items-center justify-between mb-4 md:mb-5">
        <Bone className="w-9 h-9 rounded-xl" />
        <Bone className="w-12 h-4 rounded-full" />
      </div>

      {/* Label título */}
      <Bone className="h-2.5 w-20 mb-3 rounded-full" />

      {/* Valor principal */}
      <Bone className="h-9 w-36 rounded-xl" />

      {/* Separador + descripción */}
      <div className="mt-3.5 pt-3.5" style={{ borderTop: '1px solid var(--b-subtle)' }}>
        <Bone className="h-2 w-32 rounded-full" />
      </div>
    </div>
  );
}

// ─── AdviserTable skeleton ────────────────────────────────────────────────────

function AdviserRowSkeleton({ index = 0, hideActions = false }: { index?: number; hideActions?: boolean }) {
  return (
    <tr
      style={{
        borderTop: '1px solid var(--b-subtle)',
        animationDelay: `${index * 40}ms`,
      }}
    >
      {/* Asesor: círculo iniciales + nombre */}
      <td className="px-3 sm:px-6 py-3 sm:py-5">
        <div className="flex items-center gap-2 sm:gap-3">
          <Bone className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl shrink-0" />
          <Bone className="h-3.5 rounded-full" style={{ width: `${90 + (index % 3) * 30}px` }} />
        </div>
      </td>

      {/* Ventas */}
      <td className="px-3 sm:px-6 py-3 sm:py-5">
        <Bone className="h-3.5 w-20 rounded-full" />
      </td>

      {/* Meta (oculta en mobile) */}
      <td className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-5">
        <Bone className="h-3.5 w-20 rounded-full" />
      </td>

      {/* Cumplimiento: barra + % */}
      <td className="px-3 sm:px-6 py-3 sm:py-5" style={{ minWidth: 110 }}>
        <div className="flex items-center gap-3">
          <Bone className="flex-1 h-1 rounded-full" />
          <Bone className="h-3 w-8 rounded-full shrink-0" />
        </div>
      </td>

      {/* Estado (oculto en mobile) */}
      <td className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-5">
        <Bone className="h-5 w-14 rounded-full" />
      </td>

      {/* Acciones */}
      {!hideActions && (
        <td className="px-3 sm:px-6 py-3 sm:py-5">
          <div className="flex gap-1.5 justify-end">
            <Bone className="h-5 w-12 rounded-lg" />
            <Bone className="h-5 w-14 rounded-lg" />
            <Bone className="h-5 w-10 rounded-lg" />
          </div>
        </td>
      )}
    </tr>
  );
}

export function AdviserTableSkeleton({
  rows = 6,
  hideActions = false,
}: {
  rows?: number;
  hideActions?: boolean;
}) {
  const CYAN = '#22d3ee';

  return (
    <div
      className="overflow-hidden rounded-[1.4rem]"
      style={{ background: 'var(--s-card)', border: '1px solid var(--b-line)' }}
    >
      {/* Header */}
      <div
        className="px-4 sm:px-7 pt-4 sm:pt-6 pb-3 sm:pb-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:justify-between"
        style={{ borderBottom: '1px solid var(--b-subtle)' }}
      >
        <div>
          <span
            className="text-xs font-black uppercase tracking-[0.28em] block mb-0.5"
            style={{ color: `${CYAN}80` }}
          >
            Listado General
          </span>
          <h2 className="text-lg sm:text-2xl font-black tracking-tighter" style={{ color: 'var(--t-primary)' }}>
            Lista de Asesores
          </h2>
        </div>
        {!hideActions && <Bone className="h-9 w-36 rounded-2xl" />}
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr style={{ background: 'var(--s-subtle)' }}>
              {['Asesor', 'Ventas', 'Meta', 'Cumplimiento', 'Estado'].map((h, i) => (
                <th
                  key={h}
                  className={`px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] font-black uppercase tracking-widest ${i === 2 ? 'hidden sm:table-cell' : ''} ${i === 4 ? 'hidden md:table-cell' : ''}`}
                  style={{ color: 'var(--t-micro)' }}
                >
                  {h}
                </th>
              ))}
              {!hideActions && <th className="px-3 sm:px-6 py-3 sm:py-4" />}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }, (_, i) => (
              <AdviserRowSkeleton key={i} index={i} hideActions={hideActions} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
