import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "../pages/LoginPage";
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
            {/* RUTAS PÚBLICAS CON LAYOUT */}
            <Route path="/" element={
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
            
            {/* RUTA DE LOGIN SIN LAYOUT */}
            <Route element={<PublicRoute />}>
                <Route path="/login" element={<LoginPage />} />
            </Route>

            {/* RUTAS PRIVADAS CON LAYOUT */}
            <Route element={<PrivateRoute />}>
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