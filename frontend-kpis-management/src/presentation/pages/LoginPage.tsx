import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthCredentials } from "../../core/domain/auth/AuthCredentials";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { StarField } from "@/presentation/components/ui/star-field";

/* ── Iconos inline — sin dependencia externa ── */
function IconUser() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

/* ── Icono marca: cuadrado con línea de tendencia ── */
function BrandIcon() {
  return (
    <svg width="42" height="42" viewBox="0 0 42 42" fill="none" aria-hidden="true">
      <rect x="1.5" y="1.5" width="39" height="39" rx="6" stroke="#34d399" strokeWidth="1.2" opacity="0.22" />
      <path d="M9 29L16 19L22 24L33 12" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M28 12H33V17" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.45" />
    </svg>
  );
}

export const LoginPage = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    const user = await login(new AuthCredentials(username, password));
    if (user) {
      navigate("/dashboard");
    } else {
      setErrorMsg("Credenciales incorrectas. Intenta de nuevo.");
    }
  };

  return (
    <>
      <style>{`
        .kpi-field {
          position: relative;
          display: flex;
          align-items: center;
        }
        .kpi-field-icon {
          position: absolute;
          left: 14px;
          color: rgba(255,255,255,.22);
          pointer-events: none;
          display: flex;
        }
        .kpi-input {
          width: 100%;
          background: #0b0b0b;
          color: #fff;
          font-size: 14px;
          padding: 11px 14px 11px 40px;
          border: 1px solid #2e2e2e;
          border-radius: 8px;
          outline: none;
          transition: border-color .15s, box-shadow .15s;
        }
        .kpi-input::placeholder { color: rgba(255,255,255,.16); }
        .kpi-input:focus {
          border-color: rgba(255,255,255,.45);
          box-shadow: inset 0 0 10px rgba(255,255,255,.03);
        }
        .kpi-btn {
          background: linear-gradient(180deg, #2c2c2c 0%, #0f0f0f 100%);
          border: 1px solid rgba(52,211,153,0.28);
          border-radius: 8px;
          box-shadow: 0 0 12px rgba(52,211,153,0.07);
          transition: border-color .2s, box-shadow .2s;
        }
        .kpi-btn:hover:not(:disabled) {
          border-color: rgba(52,211,153,.55);
          box-shadow: 0 0 22px rgba(52,211,153,.14);
        }
        .kpi-btn:disabled { cursor: not-allowed; opacity: .45; }
      `}</style>

      <div className="relative min-h-screen overflow-hidden bg-black">

        <StarField count={160} />

        <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="w-full max-w-[420px]"
          >
            {/* Card */}
            <div
              className="rounded-2xl bg-[#121212] shadow-[0_32px_80px_rgba(0,0,0,0.8)]"
              style={{ border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="px-14 py-16">

                {/* ── Brand ── */}
                <div className="mb-12 flex flex-col items-center gap-3">
                  <BrandIcon />
                  <div className="text-center">
                    <h1 className="text-[27px] font-semibold tracking-tight text-white leading-none">
                      KPIs Management
                    </h1>
                    <p className="mt-1.5 font-mono text-[11px] tracking-[0.14em] text-white/60 uppercase">
                      Sistema de Gestión Comercial
                    </p>
                  </div>
                </div>

                {/* ── Form ── */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="login-username" className="flex items-center gap-1.5 font-mono text-[12px] tracking-[0.07em] text-white/45">
                      Usuario
                      <span className="text-emerald-400 text-[9px]">●</span>
                    </label>
                    <div className="kpi-field">
                      <span className="kpi-field-icon"><IconUser /></span>
                      <input
                        id="login-username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        autoFocus
                        autoComplete="username"
                        placeholder="Tu usuario"
                        className="kpi-input"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="login-password" className="flex items-center gap-1.5 font-mono text-[12px] tracking-[0.07em] text-white/45">
                      Contraseña
                      <span className="text-emerald-400 text-[9px]">●</span>
                    </label>
                    <div className="kpi-field">
                      <span className="kpi-field-icon"><IconLock /></span>
                      <input
                        id="login-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        placeholder="••••••••"
                        className="kpi-input"
                      />
                    </div>
                  </div>

                  <AnimatePresence>
                    {errorMsg && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.18 }}
                        className="font-mono text-[12px] text-red-400/80"
                      >
                        {errorMsg}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    disabled={loading}
                    className="kpi-btn mt-1 flex w-full items-center justify-center gap-2 py-3 text-[14px] text-white"
                  >
                    {loading ? (
                      <>
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Ingresando…
                      </>
                    ) : (
                      <>
                        Iniciar sesión
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.45">
                          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>

                {/* ── Tagline ── */}
                <div
                  className="mt-8 pt-7"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <p className="text-center font-mono text-[11px] leading-relaxed tracking-[0.05em] text-white/25">
                    Monitoreo de ventas, comisiones y metas<br />
                    para equipos comerciales de alto rendimiento.
                  </p>
                </div>

              </div>
            </div>
          </motion.div>
        </main>

        {/* ── Footer ── */}
        <footer
          className="fixed bottom-0 z-20 w-full bg-[#0d0d0d]"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="mx-auto flex max-w-[1280px] items-center justify-between px-8 py-5">
            <span className="font-mono text-[13px] tracking-widest text-white/35">
              KPIs Management
            </span>
            <span className="font-mono text-[11px] tracking-wider text-white/20">
              © {new Date().getFullYear()} KPIs Management · Todos los derechos reservados
            </span>
          </div>
        </footer>
      </div>
    </>
  );
};
