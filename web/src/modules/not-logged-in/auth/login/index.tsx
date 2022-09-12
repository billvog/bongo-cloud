import { Button, PasswordInput, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification, updateNotification } from "@mantine/notifications";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiErrorNotification } from "../../../../utils/api-error-update-notification";
import { api } from "../../../api";
import { useAuth } from "../../../auth-context";

export const LoginPage: React.FC = () => {
  const form = useForm({
    initialValues: {
      username: "",
      password: "",
    },
    validate: {
      username: (value) => (value.length <= 0 ? "Username is required." : null),
      password: (value) => (value.length <= 0 ? "Password is required." : null),
    },
  });

  const navigate = useNavigate();
  const auth = useAuth();

  return (
    <div className="clouded-bg-container">
      <form
        onSubmit={form.onSubmit(async (values) => {
          const login_notif_id = "login-notification";

          showNotification({
            id: login_notif_id,
            title: "Please wait...",
            message: undefined,
            color: "gray",
            loading: true,
          });

          api("/auth/login/", "POST", values)
            .then((response) => {
              if (!response.ok) {
                updateNotification({
                  id: login_notif_id,
                  title: "Invalid login",
                  message: response.data.detail,
                  color: "red",
                  loading: false,
                });

                return;
              }

              auth.setUser(response.data.user);

              updateNotification({
                id: login_notif_id,
                title: "Logged in!",
                message: (
                  <div>
                    You have been logged in as{" "}
                    <span className="font-bold underline">
                      {response.data.user.username}
                    </span>
                    ! Redirecting you...
                  </div>
                ),
                color: "blue",
                loading: false,
              });

              navigate("/app");
            })
            .catch(() => {
              apiErrorNotification(login_notif_id);
            });
        })}
      >
        <div
          className="p-8 bg-white rounded-lg space-y-4"
          style={{
            width: 400,
          }}
        >
          <h2 className="mt-0">Sign in Your Bongo Account</h2>
          <TextInput
            placeholder="Username"
            {...form.getInputProps("username")}
          />
          <PasswordInput
            placeholder="Password"
            {...form.getInputProps("password")}
          />
          <div className="flex flex-col items-start space-y-2">
            <Button type="submit">Login</Button>
            <div className="flex flex-row items-center space-x-2">
              <span className="text-sm">Want an account?</span>
              <Link to="/register">
                <Button compact variant="light">
                  Sign up, it's free.
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
