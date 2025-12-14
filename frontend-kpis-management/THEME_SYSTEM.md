# Sistema de Temas - KPIs Management

## Descripción

Este proyecto utiliza un sistema de temas completo basado en variables CSS en formato OKLCH, con soporte para modo claro y oscuro.

## Características

- 🎨 **Variables de color en OKLCH**: Mayor rango de colores y mejor interpolación
- 🌓 **Modo claro/oscuro**: Cambio dinámico entre temas
- 🎯 **Integración con Tailwind**: Todas las variables disponibles como clases de utilidad
- 📏 **Variables de diseño**: Radios, sombras, fuentes y espaciado configurables
- 💾 **Persistencia**: El tema seleccionado se guarda en localStorage

## Colores Disponibles

### Colores Principales
- `background` - Color de fondo principal
- `foreground` - Color de texto principal
- `primary` - Color primario de la marca
- `secondary` - Color secundario
- `accent` - Color de acento
- `muted` - Color apagado para elementos secundarios
- `destructive` - Color para acciones destructivas

### Colores de Componentes
- `card` - Fondo de tarjetas
- `popover` - Fondo de popovers
- `border` - Color de bordes
- `input` - Fondo de inputs
- `ring` - Color de anillos de foco

### Colores de Gráficos
- `chart-1` a `chart-5` - Colores para gráficos y visualizaciones

### Colores de Sidebar
- `sidebar` - Fondo del sidebar
- `sidebar-primary` - Color primario del sidebar
- `sidebar-accent` - Color de acento del sidebar

## Uso en Componentes

### Con Tailwind CSS

```tsx
// Colores de fondo
<div className="bg-background">
<div className="bg-card">
<div className="bg-primary">

// Colores de texto
<p className="text-foreground">
<p className="text-muted-foreground">
<p className="text-primary">

// Bordes
<div className="border border-border">

// Radios
<div className="rounded-lg"> // usa var(--radius)
<div className="rounded-md"> // calc(var(--radius) - 2px)

// Sombras
<div className="shadow-md">
<div className="shadow-lg">
```

### Hook de Tema

```tsx
import { useTheme } from '@/infrastructure/hooks/useTheme';

function MyComponent() {
  const { theme, toggleTheme, setTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Cambiar a {theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
    </button>
  );
}
```

### Acceso Directo a Variables CSS

```tsx
// En estilos inline
<div style={{ 
  backgroundColor: 'var(--primary)',
  color: 'var(--primary-foreground)'
}}>

// En archivos CSS
.my-class {
  background: var(--card);
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
}
```

## Componentes Actualizados

Los siguientes componentes ya están integrados con el nuevo sistema de temas:

- ✅ Layout
- ✅ Sidebar (incluye toggle de tema)
- ✅ Dashboard
- ✅ DashboardCard
- ✅ AdviserInfoBox
- ✅ Navbar
- ✅ Button (componente UI)

## Personalización

### Cambiar Colores del Tema

Edita el archivo `src/index.css`:

```css
:root {
  --primary: oklch(0.5393 0.2713 286.7462); /* Púrpura */
  --chart-1: oklch(0.7459 0.1483 156.4499); /* Verde */
  /* ... más colores */
}

.dark {
  --primary: oklch(0.6132 0.2294 291.7437); /* Púrpura más claro */
  /* ... versiones oscuras */
}
```

### Agregar Nuevas Variables

1. Define la variable en `:root` y `.dark` en `index.css`
2. Agrégala a `tailwind.config.cjs` en `theme.extend.colors`
3. Úsala como clase de Tailwind: `text-[tu-variable]` o `bg-[tu-variable]`

## Fuentes

- **Sans**: AR One Sans (con fallbacks)
- **Serif**: Lora
- **Mono**: IBM Plex Mono

Uso:
```tsx
<div className="font-sans">Texto normal</div>
<div className="font-serif">Texto serif</div>
<div className="font-mono">Código</div>
```

## Radios y Sombras

```tsx
// Radios (basados en --radius: 1.4rem)
className="rounded-sm"  // var(--radius) - 4px
className="rounded-md"  // var(--radius) - 2px
className="rounded-lg"  // var(--radius)
className="rounded-xl"  // var(--radius) + 4px

// Sombras
className="shadow-2xs"
className="shadow-xs"
className="shadow-sm"
className="shadow"      // default
className="shadow-md"
className="shadow-lg"
className="shadow-xl"
className="shadow-2xl"
```

## Migración de Componentes Existentes

Para migrar componentes que usan colores hardcoded:

| Antes | Después |
|-------|---------|
| `bg-white` | `bg-background` o `bg-card` |
| `bg-gray-50` | `bg-muted` |
| `text-gray-900` | `text-foreground` |
| `text-gray-600` | `text-muted-foreground` |
| `bg-blue-500` | `bg-primary` |
| `text-red-600` | `text-destructive` |
| `border-gray-200` | `border-border` |

## Buenas Prácticas

1. **Usa variables semánticas**: Prefiere `bg-card` sobre `bg-white`
2. **Respeta el sistema**: No uses colores hardcoded que rompan el tema
3. **Prueba en ambos modos**: Verifica que tu componente se vea bien en claro y oscuro
4. **Usa el hook useTheme**: Para lógica condicional basada en el tema
5. **Mantén la accesibilidad**: Las variables ya tienen buen contraste, no lo rompas

## Recursos

- [OKLCH Color Space](https://oklch.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)

