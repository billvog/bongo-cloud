import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
// Not logged in
import { LoginPage } from "./not-logged-in/auth/login";
import { RegisterPage } from "./not-logged-in/auth/register";
import { WelcomePage } from "./not-logged-in/welcome";
// Logged in
import { MyFilesPage } from "./logged-in/my-files";
// Errors
import { NotFoundErrorPage } from "./common/errors/not-found";
import { useAuth } from "./auth-context";
// Other
import { AboutPage } from "./common/about";
import { SharedItemDownloadPage } from "./logged-in/shared-item-download";
import { AccountPage } from "./logged-in/account";

export const MyRoutes: React.FC = () => {
  const auth = useAuth();
  return (
    <Routes>
      {auth.user ? (
        // Logged in
        <>
          <Route path="/" element={<Navigate to="/-/" />} />
          <Route path="/-/*" element={<MyFilesPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route
            path="/share/:shareId/download"
            element={<SharedItemDownloadPage />}
          />
        </>
      ) : (
        // Not logged in
        <>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </>
      )}
      <Route path="/about" element={<AboutPage />} />
      <Route path="*" element={<NotFoundErrorPage />} />
    </Routes>
  );
};
