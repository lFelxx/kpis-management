# KPIsManageX — Contexto del Proyecto

## ¿Qué es y qué problema resuelve?

KPIsManageX es un sistema de gestión de KPIs para equipos de ventas en tiendas retail. Permite a coordinadores y administradores hacer seguimiento en tiempo real de las ventas, metas, cumplimientos y proyecciones de cierre de cada asesor de ventas y de la tienda en general.

**Problemas que resuelve:**
- Visibilidad del avance de ventas vs. meta en cualquier momento del mes
- Proyección inteligente de cierre (¿llegará este asesor a su meta este mes?)
- Detección temprana de asesores en riesgo de no cumplir
- Cálculo automático de comisiones por asesor
- Análisis de rendimiento semana contra semana (WoW)
- Seguimiento de KPIs de tienda: UPT, ATV, PAF, PR
- Presupuesto diario ponderado por día (considera festivos con mayor peso)

**Audiencia:** Coordinadores de tienda, administradores, managers de ventas.

---

## Stack Completo

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS v4 + Zustand + React Router v7 + Framer Motion + Recharts |
| Backend | Java 21 + Spring Boot 3.5.8 + Spring Security (JWT) + Spring Data JPA + Apache POI + WebFlux |
| ML Service | Python 3 + FastAPI + NumPy (predicción estadística) |
| Base de datos | MySQL 8 |
| Autenticación | JWT stateless (1 hora de expiración), BCrypt para contraseñas |

---

## Estructura del Monorepo

```
C:\Programacion\kpis-management\          ← Monorepo raíz
├── backend-kpis-management/              ← API Java Spring Boot
├── frontend-kpis-management/             ← App React principal
├── landing-page-kpis/                    ← Landing page pública (React + Vite, separada)
├── ROADMAP.md                            ← Hoja de ruta (próxima fase: gamificación)
└── CLAUDE.md                             ← Este archivo

C:\Programacion\kpis-ml-service\          ← Microservicio ML (repo separado, mismo host)
```

---

## Backend Java (`backend-kpis-management/`)

### Entidades JPA principales

| Entidad | Tabla | Propósito |
|---|---|---|
| `Adviser` | `advisers` | Asesor de ventas. Campos: name, lastname, active, upt |
| `Sale` | `sales` | Venta diaria de un asesor. Campos: adviser_id, sale_date, amount |
| `Goal` | `monthly_goal` | Meta mensual por asesor. Campos: adviser_id, year, month, goalValue |
| `MonthlySummary` | `monthly_summary` | Resumen mensual agregado: totalSales, goal. Se actualiza al subir CSV |
| `BudgetTemplate` | `budget_template` | Plantilla de presupuesto diario mensual. Unique por year+month |
| `DailyBudgetDistribution` | `daily_budget_distribution` | Distribución por día: weightPercentage, goalPerAdviser, manualOverride |
| `AdviserDailyExclusion` | `adviser_daily_exclusion` | Exclusión de un asesor en un día específico (incapacidad/vacación) |
| `AdviserSalesReport` | `adviser_sales_report` | Reporte mensual: UPT, ATV, invoiceCount, unitsSold, starProductSku/Qty |
| `StoreMetrics` | `store_metrics` | Métricas de tienda por mes: PAF, %PAF, %PR |
| `WeeklySalesComparison` | `weekly_sales_comparison` | Comparación WoW por asesor: currentWeek vs previousWeek |
| `WeeklyTopProduct` | `weekly_top_product` | Producto top de la semana: sku, qty |
| `User` | `users` | Usuario del sistema: username, email, password (BCrypt), active |
| `Role` | `roles` | Roles: ROLE_USER, ROLE_ADMIN, ROLE_MANAGER |

### Roles y seguridad

**Rutas públicas** (sin token): `GET /api/advisers/**`, `GET /api/v1/budget-template/**`, `/api/auth/**`, `/api/metrics/**`

**Roles:**
- `ROLE_ADMIN` / `ROLE_MANAGER` — gestión completa (crear asesores, subir presupuesto, subir CSV)
- `ROLE_USER` — consulta y operaciones básicas

**JWT:** header `Authorization: Bearer <token>`, expiración 1h, secret en `jwt.secret`.
**CORS:** localhost:3000/5173/4173, kpis-management.vercel.app, kpis-management.online, 84.247.165.126.

### Servicios clave

| Servicio | Responsabilidad |
|---|---|
| `AdviserServiceImpl` | CRUD de asesores, comisiones mensuales |
| `AdviserSalesReportServiceImpl` | Procesa CSV de ventas: calcula UPT, ATV, WoW, producto estrella, dispara `upsertDailySales()` que crea una fila `Sale` por día por asesor |
| `BudgetTemplateServiceImpl` | Parsea Excel de presupuesto (Apache POI), distribución diaria por peso, override manual de conteo, exclusiones por asesor |
| `MetricsServiceImpl` | Métricas del dashboard: totalSales, goalAchievement, bestAdviser, worstAdviser, asesores en riesgo |
| `PredictionServiceImpl` | Orquesta llamadas al ML service via `MlServiceClient` (WebFlux WebClient, llama sincrónicamente con `.block()`) |
| `CommissionServiceImpl` | Cálculo de comisiones por tramos de cumplimiento |
| `SalesCalculatorImpl` | Cálculos de ventas reutilizables (totales, promedios) |

### Endpoints REST

| Controller | Base path | Operaciones clave |
|---|---|---|
| `AuthenticateController` | `POST /api/auth/login`, `POST /api/auth/register` (MANAGER) |
| `AdviserController` | `/api/advisers` | CRUD + `GET /{id}/commissions/monthly?year` |
| `MetricsController` | `/api/metrics` | `GET /dashboard?year&month&cutoffDate`, `GET /adviser/{id}?year&month`, `GET /at-risk?cutoffDate` |
| `PredictionController` | `/api/predictions` | `GET /closing/{id}?year&month`, `GET /risk/{id}?year&month`, `GET /store-closing?year&month`, `GET /patterns/{id}`, `GET /anomalies/{id}?year&month` |
| `BudgetTemplateController` | `/api/v1/budget-template` | `POST /upload` (xlsx), `GET /{year}/{month}`, ajuste de conteo por día, exclusiones de asesores |
| `AdviserSalesReportController` | `/api/v1/adviser-sales-report` | `POST /upload` (CSV), `GET ?year&month` |
| `SaleController` | `POST /api/sales/add` | Registro de venta individual |
| `GoalController` | `/api/goals` | `PUT /{adviserId}`, `PUT /all` |
| `StoreMetricsController` | `/api/v1/store-metrics` | CRUD + recalcular PAF/PR |

**ML Client:** `client/MlServiceClient.java` — URL configurable vía `ml.service.url` (default: `http://localhost:8000`).

---

## ML Service Python (`C:\Programacion\kpis-ml-service\`)

FastAPI en puerto 8000. No tiene base de datos — recibe todos los datos del backend Java en cada request.

### Algoritmo de predicción (Bayesian Blend + Trend Detector)

Todos los endpoints de proyección usan el mismo algoritmo de 3 capas:

1. **Tasa histórica con tendencia** — Regresión lineal sobre `MonthlySummary` históricos → tasa diaria ajustada por tendencia mensual (crecimiento/declive)
2. **Proyección budget-weighted** — `pace_ratio = current_sales / (elapsed_weight × goal)` → proyecta usando los pesos diarios del presupuesto
3. **Bayesian blend** — `α = month_progress / (month_progress + 0.20)` — mezcla convexa donde α crece con el avance del mes: al 20% del mes, α=0.50 (50/50 histórico vs actual); al 70%, α=0.78 (datos actuales dominan)

**Ventas negativas** (devoluciones): se clampa a `max(0, current_sales)` antes de cualquier cálculo.

### Endpoints

| Endpoint | Método | Qué calcula |
|---|---|---|
| `POST /predict/closing` | — | Proyección de cierre individual del asesor + trend_monthly_pct + trend_direction |
| `POST /predict/risk` | — | Risk score (0-1), alert_level (safe/watch/warning/critical), pace_ratio, days_to_act |
| `POST /predict/store-closing` | — | Proyección de cierre de toda la tienda (suma de proyecciones individuales) |
| `POST /analyze/patterns` | — | Mejor/peor día de semana, mejor semana del mes, relative_strength por día |
| `POST /analyze/anomalies` | — | Días atípicos del mes actual con desvío estándar |
| `GET /health` | — | Health check |

**Servicios internos:** `sales_math.py` (matemáticas reutilizables: `trend_adjusted_daily_rate`, `weighted_daily_rate`, `achievement_pct`, `risk_level`).

### Manejo de días laborales
- Solo se cuentan como días laborales los días con `budget_weight > 0` en el `daily_budget`
- Los festivos tienen peso ALTO (más ventas), no cero — ya está codificado en los pesos del Excel
- Las ausencias registradas como exclusiones en el budget template NO aparecen en `daily_budget` del asesor → el modelo no las cuenta como días laborales

---

## Frontend React (`frontend-kpis-management/`)

### Arquitectura: Clean Architecture

```
src/
├── core/
│   ├── domain/          → Entidades puras (Adviser, AdviserPrediction, BudgetTemplate...)
│   ├── usecases/        → Casos de uso (GetAllAdvisers, LoginUseCase, GetStoreClosingUseCase...)
│   ├── interfaces/      → Contratos: repositorios y servicios
│   └── instances/       → Composition root — instancia use cases con sus dependencias
├── infrastructure/
│   ├── api/             → Implementaciones HTTP (AdviserApiRepository, PredictionApiRepository...)
│   └── hooks/           → useAuth, useTheme
└── presentation/
    ├── pages/           → Páginas completas
    ├── components/      → Componentes reutilizables
    ├── hooks/           → Hooks de UI
    ├── stores/          → Zustand stores
    └── routes/          → AppRouter
```

**Regla de dependencias:** `presentation → core ← infrastructure`. Ninguna capa interna depende de capas externas.

### Páginas y rutas

| Ruta | Página | Qué hace |
|---|---|---|
| `/` | `LandingPage` | Presentación pública del producto |
| `/login` | `LoginPage` | Autenticación con JWT |
| `/dashboard` | `Dashboard` | Métricas agregadas del equipo: ventas, metas, % cumplimiento, mejores/peores asesores, banner de proyección de cierre |
| `/advisers` | `AdvisersPage` | Lista de asesores con tabla de rendimiento, acciones rápidas (sumar venta, editar meta, eliminar) |
| `/advisers/:id` | `AdviserDetailPage` | Detalle individual: historial mensual, gráficas, WoW, comisiones |
| `/advisory-team` | `AdvisoryTeam` | Vista de equipo: asesores destacados, comparación semanal del grupo |
| `/report` | `ReportPage` | Reporte mensual: UPT, ATV, productos top, facturas |
| `/budget` | `BudgetTemplatePage` | Gestión del presupuesto diario: subir Excel, ajustar conteo por día, marcar exclusiones de asesores |
| `/sales-report` | `SalesReportUploadPage` | Upload de CSV de ventas con drag-and-drop |
| `/insights` | `InsightsPage` | Análisis ML por asesor: proyección de cierre, matriz de riesgo, patrones, anomalías, TrendBadge |

### Stores Zustand

| Store | Estado que maneja |
|---|---|
| `useAdvisersStore` | Lista de asesores, asesor seleccionado, métricas del dashboard, CRUD completo |
| `useAdviserMetricsStore` | Métricas derivadas del dashboard (totalSales, goalAchievement, bestAdviser...) |
| `useAuthStore` | Sesión activa: user, isAuthenticated, token en localStorage |
| `useBudgetStore` | Template de presupuesto mensual, exclusiones, overrides |
| `usePredictionStore` | Proyección de tienda (storeClosing) + detalle ML por asesor (risk, closing, patterns, anomalies) |
| `useSalesReportStore` | Reporte de ventas CSV: reportes por asesor, resultado del último upload |
| `useActionModalStore` | Modales de acciones rápidas: sumar venta, eliminar, actualizar UPT |
| `useAdviserModalStore` | Modal de creación/edición de asesor |
| `useReportingDateStore` | Fecha de corte global (cutoffDate) — usada por todas las queries |
| `useOnboardingStore` | Visibilidad del wizard de onboarding (persiste en localStorage) |
| `useSidebarStore` | Estado del sidebar: colapsado/expandido en desktop, overlay en mobile |

### Hooks de UI clave

| Hook | Qué hace |
|---|---|
| `useDashboardMetrics` | Combina store de asesores + fecha de corte para exponer métricas del dashboard |
| `useAdviserInsights` | Dispara en paralelo los 4 fetches ML (risk, closing, patterns, anomalies) cuando se selecciona un asesor |
| `useAdviserUI` | Orquesta los 3 handlers de modales de acción (suma, delete, UPT) |
| `useStoreClosing` | Thin wrapper sobre `fetchStoreClosing` del prediction store |
| `useMonthlySummary` | Carga historial mensual de un asesor para un año |
| `useAdviserWow` | Obtiene comparación WoW de un asesor |

---

## Flujos Clave

### 1. Subida de ventas (CSV)
1. Usuario arrastra CSV en `SalesReportUploadPage`
2. `POST /api/v1/adviser-sales-report/upload` → `AdviserSalesReportServiceImpl`
3. `SalesCsvParser` parsea el CSV — detecta asesor por nombre, agrupa ventas por día
4. `upsertDailySales()` crea/actualiza una fila `Sale` por día por asesor en la tabla `sales`
5. Calcula UPT, ATV, producto estrella, comparación WoW
6. Actualiza `AdviserSalesReport` (resumen) y `MonthlySummary` (total mensual)

### 2. Subida de presupuesto (Excel)
1. Usuario sube Excel en `BudgetTemplatePage`
2. `POST /api/v1/budget-template/upload` → `BudgetTemplateServiceImpl`
3. `BudgetExcelParser` (Apache POI) parsea el Excel — lee pesos diarios de cada día del mes
4. Crea `BudgetTemplate` + `DailyBudgetDistribution` por cada día
5. Cada día tiene `weightPercentage` (festivos tienen peso ALTO, no cero)
6. Desde UI se puede ajustar conteo de asesores por día y marcar exclusiones (incapacidades)

### 3. Proyección ML de un asesor
1. Frontend llama `GET /api/predictions/closing/{adviserId}?year&month`
2. `PredictionServiceImpl` recopila: ventas diarias actuales (tabla `sales`), historial mensual (tabla `monthly_summary` — todos los años ≤ año actual), meta mensual (budget template o fallback a `monthly_goal`), budget diario del mes (tabla `daily_budget_distribution`)
3. Envía todo en un JSON a `POST /predict/closing` del ML service
4. ML service aplica Bayesian blend + trend detector → devuelve proyección, confidence, risk_level, trend_monthly_pct, trend_direction
5. Frontend muestra en `InsightsPage` con TrendBadge y gauge de cumplimiento

### 4. Proyección de cierre de tienda
1. Mismo algoritmo que el asesor individual, aplicado a todos los asesores activos en paralelo
2. La meta de tienda = suma de metas individuales (desde budget template)
3. La proyección de tienda = suma de proyecciones individuales de cada asesor
4. Se muestra en el Dashboard como `AiInsightBanner` con nivel de riesgo y confianza

---

## Variables de Entorno

### Backend (`application.properties`)
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/kpismanagement
spring.datasource.username=root
spring.datasource.password=password
jwt.secret=<secret_base64>
jwt.expiration=3600000
ml.service.url=http://localhost:8000
APP_ADMIN_USERNAME=admin
APP_ADMIN_EMAIL=admin@example.com
APP_ADMIN_PASSWORD=password
```

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:8080
VITE_APP_VERSION=x.x.x
```

### ML Service
No requiere variables de entorno propias. Puerto: 8000. Stateless — no tiene BD.

---

## Convenciones del Frontend

- **Colores:** emerald-500/600 (primario), cyan-500/600 (secundario), slate (neutros)
- **Dark mode:** clase `dark` en `<html>`, gestionado por `useTheme` con localStorage
- **Bordes:** `rounded-[2rem]` para cards grandes, `rounded-2xl` para elementos medianos
- **Glassmorphism:** `bg-white/80 dark:bg-black/40 backdrop-blur-3xl border border-slate-200 dark:border-white/5`
- **Fuentes:** system-ui, letter-spacing `-0.025em`
- **Animaciones:** Framer Motion para transiciones, CSS keyframes para decorativos
- **API client:** `infrastructure/api/apiClient.ts` — inyecta JWT automáticamente en todos los requests

---

## Próxima Fase — Gamificación

Ver `ROADMAP.md` para la especificación completa. En resumen:

- **Fase 1:** Medallas y logros por rendimiento (Velocista, Cumplidor, Fénix, Blindado...), rol `ROLE_ADVISER` con vista propia, tab de gamificación para admin
- **Fase 2:** Ligas mensuales (Bronce/Plata/Oro/Diamante), ranking del equipo, trofeos anuales
- **Fase 3:** Personajes pixel art (bloqueada hasta tener assets)
- **Futuro:** PWA instalable con `vite-plugin-pwa`

Tablas BD pendientes: `app_config`, `adviser_points`, `adviser_medal`, `adviser_trophy`.
