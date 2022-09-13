import React from "react";
import { Route, Routes } from "react-router-dom";
// Not logged in
import { LoginPage } from "./not-logged-in/auth/login";
import { RegisterPage } from "./not-logged-in/auth/register";
import { WelcomePage } from "./not-logged-in/welcome";
// Logged in
import { MyFilesPage } from "./logged-in/my-files";
// Errors
import { NotFoundErrorPage } from "./common/errors/not-found";
import { useAuth } from "./auth-context";

export const MyRoutes: React.FC = () => {
  const auth = useAuth();
  return (
    <Routes>
      {auth.user ? (
        // Logged in
        <>
          <Route path="/files" element={<MyFilesPage />} />
          {/* <Route path="*" element={<NotFoundErrorPage />} /> */}
        </>
      ) : (
        // Not logged in
        <>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<NotFoundErrorPage />} />
        </>
      )}
    </Routes>
  );
};
