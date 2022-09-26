import React from "react";
import { useAuth } from "../../auth-context";
import { Layout } from "../layout";

export const AccountPage: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <Layout>
      <div className="p-8">
        <h1>Welcome back, {user.first_name}!</h1>
      </div>
    </Layout>
  );
};
