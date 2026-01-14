import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
    FaArrowRight,
    FaChartLine,
    FaShieldAlt,
    FaUsers,
    FaBullseye,
    FaCalendarAlt,
    FaChartBar,
    FaStore,
    FaCheckCircle,
    FaTrophy
} from 'react-icons/fa';
import { Cover } from '@/components/ui/cover';
import { ShootingStars } from '@/components/ui/shooting-stars';
import { StarsBackground } from '@/components/ui/stars-background';
import { FeatureHoverEffect } from '@/components/ui/feature-hover-effect';
import { InfiniteMovingCards } from '@/components/ui/infinite-moving-cards';
import { WarpSpeed } from '@/components/ui/warp-speed';

// Main Features Data
const mainFeatures = [
    {
        icon: <FaChartLine className="text-3xl text-cyan-400" />,
        title: "Analítica en Tiempo Real",
        description: "Visualiza métricas clave al instante: ventas totales, cumplimiento de metas, UPT y rendimiento del equipo con dashboards interactivos."
    },
    {
        icon: <FaUsers className="text-3xl text-emerald-400" />,
        title: "Gestión de Asesores",
        description: "Crea, edita, activa/desactiva asesores. Administra permisos y monitorea el rendimiento individual de cada miembro del equipo."
    },
    {
        icon: <FaChartBar className="text-3xl text-purple-400" />,
        title: "Registro de Ventas",
        description: "Registra ventas individuales asociadas a cada asesor con fecha y monto. Actualiza las métricas automáticamente en tiempo real."
    },
    {
        icon: <FaBullseye className="text-3xl text-orange-400" />,
        title: "Gestión de Metas",
        description: "Establece metas mensuales por asesor o de forma masiva para todo el equipo. Monitorea el cumplimiento en tiempo real."
    },
    {
        icon: <FaCalendarAlt className="text-3xl text-pink-400" />,
        title: "Comparaciones Semanales",
        description: "Registra y compara ventas semanales para análisis de tendencias. Identifica patrones y oportunidades de mejora."
    },
    {
        icon: <FaTrophy className="text-3xl text-yellow-400" />,
        title: "Métricas Avanzadas",
        description: "Calcula UPT, porcentaje de cumplimiento, identifica mejores asesores por ventas y UPT. Resúmenes mensuales automáticos."
    },
    {
        icon: <FaStore className="text-3xl text-blue-400" />,
        title: "Métricas de Tienda",
        description: "Gestiona métricas adicionales a nivel de tienda. Visualiza el rendimiento global y compara con objetivos establecidos."
    },
    {
        icon: <FaShieldAlt className="text-3xl text-indigo-400" />,
        title: "Seguridad Robusta",
        description: "Autenticación JWT con tokens de 24 horas. Spring Security protege tus datos con los más altos estándares de seguridad."
    },
    {
        icon: <FaCheckCircle className="text-3xl text-green-400" />,
        title: "Resúmenes Mensuales",
        description: "Generación automática de resúmenes mensuales de ventas por asesor. Exporta reportes y analiza el desempeño histórico."
    }
];

// Benefits Data for Infinite Moving Cards
const benefitsData = [
    {
        quote: "Stack tecnológico de última generación: React 19, Spring Boot 3.5, TypeScript y MySQL. Rendimiento y escalabilidad garantizados para crecer con tu negocio.",
        name: "Arquitectura Moderna",
        title: "Tecnología de Vanguardia"
    },
    {
        quote: "Automatiza cálculos de métricas, generación de reportes y seguimiento de objetivos. Enfócate en lo que realmente importa: hacer crecer tu negocio.",
        name: "Ahorro de Tiempo",
        title: "Eficiencia Maximizada"
    },
    {
        quote: "Sistema de autenticación robusto con JWT. Tus datos comerciales protegidos con encriptación y mejores prácticas de seguridad empresarial.",
        name: "Datos Seguros",
        title: "Seguridad Garantizada"
    },
    {
        quote: "Interfaz intuitiva y moderna diseñada con los mejores principios de UX/UI. Dashboards interactivos con Chart.js y animaciones fluidas con Framer Motion.",
        name: "Experiencia Premium",
        title: "Diseño Excepcional"
    },
    {
        quote: "Arquitectura limpia con separación de responsabilidades. Frontend y backend independientes para facilitar el mantenimiento y escalabilidad del sistema.",
        name: "Código Mantenible",
        title: "Desarrollo Profesional"
    }
];

export const LandingPage = () => {
    const navigate = useNavigate();
    const [isWarping, setIsWarping] = useState(false);

    const scrollToBenefits = () => {
        setIsWarping(true);
    };

    const handleWarpComplete = () => {
        setIsWarping(false);
        const benefitsSection = document.getElementById('benefits-section');
        if (benefitsSection) {
            benefitsSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    return (
        <div className="relative min-h-screen bg-black text-white overflow-hidden font-sans">
            {/* Stars Background */}
            <StarsBackground
                starDensity={0.00015}
                allStarsTwinkle={true}
                twinkleProbability={0.7}
                minTwinkleSpeed={0.5}
                maxTwinkleSpeed={1}
                className="absolute inset-0 z-0"
            />

            {/* Shooting Stars */}
            <ShootingStars
                minSpeed={10}
                maxSpeed={30}
                minDelay={1200}
                maxDelay={4200}
                starColor="#34d399"
                trailColor="#2EB9DF"
                starWidth={15}
                starHeight={3}
                className="absolute inset-0 z-[1]"
            />

            {/* Overlays */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/40 to-emerald-900/40 z-[2]"></div>

            {/* Warp Speed Effect */}
            <WarpSpeed isActive={isWarping} onComplete={handleWarpComplete} />

            {/* Navbar */}
            <nav className="relative z-20 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
                <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500">
                    KPIs Management
                </div>
                <div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-6 py-2 rounded-full border border-white/20 hover:bg-white/10 transition backdrop-blur-md text-sm font-medium"
                    >
                        Iniciar Sesión
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 flex flex-col items-center justify-center text-center px-4 mt-20 max-w-7xl mx-auto pb-20">
                <div className="inline-block px-4 py-1 mb-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold tracking-wide backdrop-blur-md">
                    SISTEMA DE GESTIÓN AVANZADO
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
                    Gestiona tus KPIs con <br />
                    <Cover>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400">
                            Precisión y Estilo
                        </span>
                    </Cover>
                </h1>

                <p className="text-xl text-gray-300 max-w-2xl mb-10 leading-relaxed">
                    Optimiza el rendimiento de tu equipo con una plataforma diseñada para el futuro.
                    Métricas en tiempo real, análisis profundo y una experiencia de usuario incomparable.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-32">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="group px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-bold text-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all flex items-center gap-2 justify-center"
                    >
                        Comenzar Ahora
                        <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={scrollToBenefits}
                        className="group px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-sm text-white rounded-full font-bold text-lg border border-white/10 transition-all hover:border-emerald-500/30"
                    >
                        Conocer Más
                    </button>
                </div>

                {/* Main Features Section */}
                <div className="w-full mb-20">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
                        Funcionalidades <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">Principales</span>
                    </h2>
                    <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
                        Un sistema completo para gestionar y analizar el rendimiento de tu equipo comercial
                    </p>

                    <FeatureHoverEffect items={mainFeatures} />
                </div>


                {/* Benefits Section */}
                <div id="benefits-section" className="w-full mb-20 scroll-mt-20">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
                        ¿Por qué elegir <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">KPIs Management</span>?
                    </h2>
                    <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
                        Diseñado para maximizar la eficiencia y el rendimiento de tu equipo comercial
                    </p>

                    <InfiniteMovingCards
                        items={benefitsData}
                        direction="right"
                        speed="slow"
                        pauseOnHover={true}
                        className="py-8"
                    />
                </div>

                {/* Technology Stack Section */}
                <div className="w-full">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
                        Tecnologías <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">de Vanguardia</span>
                    </h2>
                    <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
                        Construido con las mejores herramientas del ecosistema moderno de desarrollo
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        <div className="group rounded-2xl p-[2px] transition-all duration-300 hover:bg-[linear-gradient(163deg,#00ff75_0%,#3700ff_100%)] hover:shadow-[0_0_30px_1px_rgba(0,255,117,0.30)]">
                            <div className="p-6 h-full w-full rounded-2xl bg-[#1a1a1a]/80 backdrop-blur-md transition-all duration-200 group-hover:scale-[0.98] text-left">
                                <h3 className="text-xl font-bold mb-4 text-emerald-400">Frontend</h3>
                                <ul className="text-gray-400 text-sm space-y-2">
                                    <li>• React 19 + TypeScript</li>
                                    <li>• Vite + Tailwind CSS</li>
                                    <li>• Zustand (State Management)</li>
                                    <li>• Chart.js + Framer Motion</li>
                                    <li>• React Router DOM</li>
                                </ul>
                            </div>
                        </div>

                        <div className="group rounded-2xl p-[2px] transition-all duration-300 hover:bg-[linear-gradient(163deg,#00ff75_0%,#3700ff_100%)] hover:shadow-[0_0_30px_1px_rgba(0,255,117,0.30)]">
                            <div className="p-6 h-full w-full rounded-2xl bg-[#1a1a1a]/80 backdrop-blur-md transition-all duration-200 group-hover:scale-[0.98] text-left">
                                <h3 className="text-xl font-bold mb-4 text-cyan-400">Backend</h3>
                                <ul className="text-gray-400 text-sm space-y-2">
                                    <li>• Spring Boot 3.5.3 + Java 21</li>
                                    <li>• Spring Security + JWT</li>
                                    <li>• Spring Data JPA + MySQL</li>
                                    <li>• MapStruct + Lombok</li>
                                    <li>• Maven + Spring Actuator</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Decorative Lights */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] -z-10 animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] -z-10 animate-pulse delay-1000"></div>
        </div>
    );
};


