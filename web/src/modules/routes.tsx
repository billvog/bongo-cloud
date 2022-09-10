import React from "react";
import { Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./protected-route";
// Not logged in
import { LoginPage } from "./not-logged-in/auth/login";
import { RegisterPage } from "./not-logged-in/auth/register";
import { WelcomePage } from "./not-logged-in/welcome";
// Logged in
import { MyFilesPage } from "./logged-in/my-files";
// Errors
import { NotFoundErrorPage } from "./common/errors/not-found";

export const MyRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Not logged in */}
      <Route element={<ProtectedRoute allowed="unlogged" />}>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      {/* Logged in */}
      <Route element={<ProtectedRoute allowed="logged" />}>
        <Route path="/app" element={<MyFilesPage />} />
      </Route>
      {/* Errors */}
      <Route path="*" element={<NotFoundErrorPage />} />
    </Routes>
  );
};
