# KPIsManageX — Roadmap

## Estado actual (sept 2026)

Sistema de gestión de KPIs funcionando en producción:
- Dashboard con métricas del equipo y asesores
- Análisis individual: proyección ML, matriz de riesgo, comisiones
- Presupuesto mensual desde plantilla Excel
- Reporte de ventas desde CSV con UPT, WoW, producto estrella
- Microservicio Python/FastAPI para predicción de riesgo y cierre

---

## Próxima fase — Sistema de Gamificación

Especificación completa en el artefacto de diseño del equipo.

### Fase 1 — Medallas y logros (Modo Básica)
- [ ] Tablas BD: `app_config` (modo gamificación), `adviser_points`, `adviser_medal`, `adviser_trophy`
- [ ] Rol `ADVISER` con login propio — ve solo su perfil gamificado + ranking del equipo
- [ ] Evento `CsvReportProcessedEvent` en `AdviserSalesReportServiceImpl` al terminar subida de CSV
- [ ] `GamificationEventListener` + `GamificationService.evaluateAllMedals()`
- [ ] Medallas individuales: Velocista, Cumplidor, Primer Día, Crecimiento, Fénix, Blindado
- [ ] Medallas comparativas post-CSV: El Mejor, Mejor UPT, Top 3
- [ ] `MonthlyClosingJob` (día 1 del mes): En Racha, Blindado mensual
- [ ] Switch modo gamificación en UI admin (Desactivada / Básica / Completa)
- [ ] Tab "Gamificación del equipo" para ADMIN y COORDINATOR: tabla con puntos, medallas y ligas
- [ ] Perfil del asesor (mobile-first): ventas actuales, cuánto falta, meta de hoy, % cumplimiento

### Fase 2 — Ligas y ranking (Modo Básica completo)
- [ ] Ligas mensuales: Bronce / Plata / Oro / Diamante según % de meta
- [ ] Ranking del equipo visible para el asesor (lectura)
- [ ] Trofeos anuales: Asesor del Año, Año Perfecto, Trofeo Veterano

### Fase 3 — Personajes pixel art (Modo Completa)
> **Pendiente de producción de assets.** No se implementa hasta tener los sprites listos.

Los personajes se introducen cuando estén diseñados y exportados.
Herramientas recomendadas para producirlos:
- **Concepto/referencia:** Leonardo.ai o Bing Image Creator (prompt: "32x32 pixel art RPG character")
- **Edición y animación:** Piskel (web, gratis) o LibreSprite (desktop, gratis)
- **Formato de entrega:** PNG spritesheet con frames: idle, win, levelup
- **Resolución:** 32×32 px base, escalado ×3 en CSS para display (96×96)
- **Ubicación en el proyecto:** `frontend-kpis-management/public/sprites/`

Una vez listos los assets, la implementación es:
- [ ] Páginas del asesor: `MyProfilePage`, `TeamLeaderboardPage`, `MyMedalsPage`, `CustomizePage`
- [ ] Componente `PixelCharacter` con sprite animado según nivel y accesorios desbloqueados
- [ ] Sistema de accesorios: marcos de liga en el avatar, badges de medalla

### Nota futura — PWA instalable
Cuando se quiera hacer la sección del asesor instalable como app nativa:
- Agregar `vite-plugin-pwa` al build de React
- Crear `manifest.json` con íconos y nombre de la app
- Las rutas y el backend no cambian — es solo una capa de installability sobre la web app existente
