# Sistema de Gestión de KPIs

Sistema completo para la gestión y seguimiento de indicadores clave de rendimiento (KPIs) de un equipo de asesores comerciales. Permite monitorear ventas, establecer metas, calcular métricas de rendimiento y visualizar el desempeño del equipo mediante un dashboard interactivo.

## 📋 Descripción

Este proyecto es una aplicación web full-stack diseñada para gestionar y analizar el rendimiento de un equipo de asesores comerciales. El sistema permite registrar ventas, establecer metas mensuales, calcular métricas clave como UPT (Unidades por Transacción), cumplimiento de objetivos, y generar visualizaciones comparativas semanales y mensuales.

### Funcionalidades Principales

- **Gestión de Asesores**: Crear, editar, eliminar y activar/desactivar asesores del equipo
- **Registro de Ventas**: Registrar ventas individuales asociadas a cada asesor con fecha y monto
- **Gestión de Metas**: Establecer metas mensuales por asesor o de forma masiva para todo el equipo
- **Cálculo de Métricas**: 
  - Ventas totales y promedio por asesor
  - Porcentaje de cumplimiento de metas
  - UPT (Unidades por Transacción)
  - Identificación del mejor asesor por ventas y por UPT
- **Comparaciones Semanales**: Registrar y comparar ventas semanales para análisis de tendencias
- **Resúmenes Mensuales**: Generación automática de resúmenes mensuales de ventas por asesor
- **Dashboard Interactivo**: Visualización de métricas clave con gráficos y tablas
- **Autenticación y Seguridad**: Sistema de autenticación basado en JWT con roles de usuario
- **Métricas de Tienda**: Gestión de métricas adicionales a nivel de tienda

## 🛠️ Tecnologías Utilizadas

### Frontend (`frontend-kpis-management`)

- **React 19**: Biblioteca para construir interfaces de usuario
- **TypeScript**: Tipado estático para mayor seguridad en el código
- **Vite**: Herramienta de construcción y desarrollo rápida
- **Tailwind CSS**: Framework de utilidades CSS para diseño responsive
- **React Router DOM**: Enrutamiento del lado del cliente
- **Zustand**: Gestión de estado global ligera y simple
- **Chart.js + React-Chartjs-2**: Visualización de datos mediante gráficos
- **Framer Motion**: Animaciones y transiciones fluidas
- **React Hot Toast / React Toastify**: Notificaciones y mensajes al usuario
- **Headless UI**: Componentes UI accesibles y sin estilos
- **Heroicons / Lucide React / React Icons**: Iconografía moderna

### Backend (`backend-kpis-management`)

- **Spring Boot 3.5.3**: Framework para aplicaciones Java empresariales
- **Java 21**: Lenguaje de programación
- **Spring Data JPA**: Abstracción para acceso a datos y persistencia
- **MySQL**: Sistema de gestión de bases de datos relacional
- **Spring Security**: Framework de seguridad y autenticación
- **JWT (JSON Web Tokens)**: Autenticación basada en tokens
- **MapStruct**: Generación de código para mapeo entre objetos
- **Lombok**: Reducción de código boilerplate mediante anotaciones
- **Spring Boot Actuator**: Monitoreo y métricas de la aplicación
- **Spring Boot DevTools**: Herramientas de desarrollo para recarga automática
- **Maven**: Herramienta de gestión y construcción de proyectos

## 📁 Estructura del Proyecto

```
kpis-management/
├── frontend-kpis-management/     # Aplicación React
│   ├── src/
│   │   ├── core/                 # Lógica de negocio (dominio, casos de uso)
│   │   ├── infrastructure/       # Implementaciones (API, servicios)
│   │   ├── presentation/         # Componentes UI y páginas
│   │   └── config/               # Configuración
│   ├── public/                   # Archivos estáticos
│   └── package.json
│
└── backend-kpis-management/      # API Spring Boot
    └── src/main/java/com/fcastro/backend_kpis_management/
        ├── controllers/          # Controladores REST
        ├── services/             # Lógica de negocio
        ├── repositories/         # Acceso a datos
        ├── model/                # Entidades y DTOs
        ├── config/               # Configuración (Security, JWT)
        ├── exceptions/           # Manejo de excepciones
        └── util/                 # Utilidades (JWT)
```

## 🔧 Requisitos Previos

- **Node.js** (versión 18 o superior)
- **pnpm** o **npm** (gestor de paquetes)
- **Java 21** (JDK)
- **Maven 3.6+**
- **MySQL 8.0+**
- **Git**

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd kpis-management
```

### 2. Configuración del Backend

1. Navegar al directorio del backend:
```bash
cd backend-kpis-management
```

2. Configurar la base de datos MySQL:
   - Crear una base de datos llamada `kpis_management`
   - Editar `src/main/resources/application.properties` con tus credenciales de MySQL:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/kpis_management
   spring.datasource.username=tu_usuario
   spring.datasource.password=tu_contraseña
   ```

3. Compilar y ejecutar el backend:
```bash
mvn clean install
mvn spring-boot:run
```

El backend estará disponible en `http://localhost:8080`

### 3. Configuración del Frontend

1. Navegar al directorio del frontend:
```bash
cd frontend-kpis-management
```

2. Instalar dependencias:
```bash
pnpm install
# o
npm install
```

3. Configurar la URL del backend (si es necesario):
   - Editar `src/config/environment.ts` si la URL del backend es diferente

4. Ejecutar el frontend en modo desarrollo:
```bash
pnpm dev
# o
npm run dev
```

El frontend estará disponible en `http://localhost:3000`

## 📖 Uso

### Acceso al Sistema

1. Abre tu navegador y accede a `http://localhost:3000`
2. Inicia sesión con tus credenciales (si no tienes usuario, deberás crearlo primero en el backend)

### Funcionalidades Disponibles

- **Dashboard**: Visualiza métricas generales del equipo, mejores asesores, cumplimiento de metas
- **Equipo de Asesores**: Gestiona los miembros del equipo, edita información, registra ventas, actualiza UPT
- **Detalle de Asesor**: Visualiza el rendimiento individual, gráficos de ventas, comparaciones semanales
- **Gestión de Metas**: Establece metas mensuales individuales o masivas para el equipo

## 🔐 Seguridad

El sistema implementa autenticación basada en JWT (JSON Web Tokens):
- Los tokens tienen una validez de 24 horas
- Las rutas protegidas requieren autenticación
- El frontend almacena el token y lo envía en cada petición al backend

## 📊 API REST

El backend expone una API REST con los siguientes endpoints principales:

- `/api/auth/**` - Autenticación y autorización
- `/api/advisers/**` - Gestión de asesores
- `/api/sales/**` - Registro de ventas
- `/api/goals/**` - Gestión de metas
- `/api/metrics/**` - Obtención de métricas
- `/api/monthly-summaries/**` - Resúmenes mensuales
- `/api/weekly-comparisons/**` - Comparaciones semanales
- `/api/store-metrics/**` - Métricas de tienda

## 🧪 Desarrollo

### Scripts Disponibles (Frontend)

- `pnpm dev` - Inicia el servidor de desarrollo
- `pnpm build` - Construye la aplicación para producción
- `pnpm preview` - Previsualiza la build de producción
- `pnpm lint` - Ejecuta el linter

### Scripts Disponibles (Backend)

- `mvn spring-boot:run` - Ejecuta la aplicación
- `mvn test` - Ejecuta las pruebas
- `mvn clean install` - Limpia y compila el proyecto

## 📝 Notas Adicionales

- El backend utiliza Hibernate para la gestión automática del esquema de base de datos (`ddl-auto=update`)
- El frontend utiliza un proxy configurado en Vite para redirigir las peticiones `/api` al backend
- El sistema está diseñado siguiendo principios de arquitectura limpia y separación de responsabilidades

## 👥 Autores

- **Autor**: Felix Castro
- **Coautor**: Elkin Chaparro


## 📄 Licencia

Copyright © Felix Castro y Elkin Chaparro.
Todos los derechos reservados.

Este proyecto, incluyendo su código, diseño, documentación, materiales gráficos y cualquier otro contenido asociado, es propiedad exclusiva de **Felix Castro** (autor del concepto original) y **Elkin Chaparro** (coautor y colaborador en el desarrollo).
Está prohibida su copia, modificación, distribución o uso sin autorización previa y escrita de los autores.
**El acceso al proyecto no otorga ningún derecho de uso.**

---

**Desarrollado con ❤️ para la gestión eficiente de KPIs comerciales**

