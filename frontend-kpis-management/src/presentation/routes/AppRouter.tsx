import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "../pages/LoginPage";
import { LandingPage } from "../pages/LandingPage";
import { PrivateRoute } from "./PrivateRoute";
import { Dashboard } from "../pages/Dashboard";
import { AdviserDetailPage } from "../pages/AdviserDetailPage";
import { AdvisoryTeam } from "../pages/AdvisoryTeam";
import { AdviserList } from "../components/AdviserList";
import { Layout } from "../components/Layout";
import { PublicRoute } from "./PublicRoute";

export const AppRouter = () => {
    return (
        <Routes>
            {/* RUTAS PÚBLICAS */}
            <Route element={<PublicRoute />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
            </Route>

            {/* RUTAS PRIVADAS CON LAYOUT */}
            <Route element={<PrivateRoute />}>
                <Route path="/dashboard" element={
                    <Layout>
                        <Dashboard />
                    </Layout>
                } />

                <Route path="/advisers" element={
                    <Layout>
                        <AdviserList />
                    </Layout>
                } />
                <Route path="/advisers/:id" element={
                    <Layout>
                        <AdviserDetailPage />
                    </Layout>
                } />
                <Route path="/advisory-team" element={
                    <Layout>
                        <AdvisoryTeam />
                    </Layout>
                } />
            </Route>

            {/* CUALQUIER RUTA NO DEFINIDA */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}