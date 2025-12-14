import React from "react";
import { Sidebar } from "./Sidebar";

interface LayoutProps{
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) =>{
    return (
        <div className="flex min-h-screen bg-background">
          <Sidebar />
          <main className="flex-1 ml-72 p-8">
            {children}
          </main>
        </div>
      );
}