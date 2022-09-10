import { Button, PasswordInput, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification, updateNotification } from "@mantine/notifications";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../../api";
import { useAuth } from "../../../auth-context";
import { setAccessToken, setRefreshToken } from "../../../auth-tokens";

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

          const response = await api("/auth/login/", "POST", values);

          // login failed
          if (response.status !== 200) {
            updateNotification({
              id: login_notif_id,
              title: "Invalid login",
              message: response.data.detail,
              color: "red",
              loading: false,
            });

            return;
          }

          // login worked
          setAccessToken(response.data.access);
          setRefreshToken(response.data.refresh);

          const userResponse = await api("/auth/me/", "GET");

          // something went wrong
          if (userResponse.status !== 200) {
            updateNotification({
              id: login_notif_id,
              title: "Something went wrong 😑",
              message: "Something went terribly wrong.",
              color: "red",
              loading: false,
            });
            return;
          }

          // TODO: store user in state...
          auth.setUser(userResponse.data.user);

          updateNotification({
            id: login_notif_id,
            title: "Logged in!",
            message: (
              <div>
                You have been logged in as
                <span className="font-bold underline">
                  {userResponse.data.user.username}
                </span>
                ! Redirecting you...
              </div>
            ),
            color: "blue",
            loading: false,
          });

          navigate("/app");
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
