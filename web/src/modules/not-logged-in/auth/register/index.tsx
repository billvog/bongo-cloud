import { Button, PasswordInput, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification, updateNotification } from "@mantine/notifications";
import React from "react";
import { useMutation } from "react-query";
import { Link, useNavigate } from "react-router-dom";
import { apiErrorNotification } from "../../../../utils/api-error-update-notification";
import { formatApiErrors } from "../../../../utils/format-api-errors";
import { api, APIResponse } from "../../../api";
import { useAPICache } from "../../../shared-hooks/use-api-cache";

export const RegisterPage: React.FC = () => {
  const form = useForm({
    initialValues: {
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      password: "",
    },
    validate: {
      first_name: (value) =>
        value.length < 2 ? "Length must be at least 2 characters." : null,
      last_name: (value) =>
        value.length < 2 ? "Length must be at least 2 characters." : null,
      username: (value) =>
        value.length < 3 ? "Length must be at least 3 characters." : null,
      email: (value) =>
        /^\S+@\S+$/.test(value) ? null : "Invalid email format.",
      password: (value) =>
        value.length < 6 ? "Length must be at least 6 characters." : null,
    },
  });

  const navigate = useNavigate();

  const apiCache = useAPICache();
  const registerMutation = useMutation<
    APIResponse,
    any,
    {
      first_name: string;
      last_name: string;
      username: string;
      email: string;
      password: string;
    }
  >((values) => api("/auth/register/", "POST", values));

  return (
    <div className="clouded-bg-container">
      <form
        onSubmit={form.onSubmit(async (values) => {
          const register_notif_id = "register-notification";

          showNotification({
            id: register_notif_id,
            title: "Please wait...",
            message: undefined,
            color: "gray",
            loading: true,
          });

          registerMutation.mutate(values, {
            onSuccess: (data) => {
              if (!data.ok) {
                form.setErrors(formatApiErrors(data.data));
                updateNotification({
                  id: register_notif_id,
                  title: "Registration failed",
                  message: "Ensure all fields are correctly filled.",
                  color: "red",
                  loading: false,
                });

                return;
              }

              apiCache.setAuthenticatedUserFromResponse(data);

              updateNotification({
                id: register_notif_id,
                title: "Logged in!",
                message: (
                  <div>
                    You have been logged in as{" "}
                    <span className="font-bold underline">
                      {data.data.user.username}
                    </span>
                    ! Redirecting you...
                  </div>
                ),
                color: "blue",
                loading: false,
              });

              navigate("/", { replace: true });
            },
            onError: (error) => {
              console.log(error);
              apiErrorNotification(register_notif_id);
            },
          });
        })}
      >
        <div
          className="p-8 bg-white rounded-lg space-y-4"
          style={{
            width: 400,
          }}
        >
          <h2 className="mt-0">Create Your Bongo Account</h2>
          <div className="flex flex-row space-x-4">
            <TextInput
              placeholder="First name"
              {...form.getInputProps("first_name")}
            />
            <TextInput
              placeholder="Last name"
              {...form.getInputProps("last_name")}
            />
          </div>
          <TextInput
            placeholder="Username"
            {...form.getInputProps("username")}
          />
          <TextInput
            placeholder="Email Address"
            type="email"
            {...form.getInputProps("email")}
          />
          <PasswordInput
            placeholder="Password"
            {...form.getInputProps("password")}
          />
          <div className="flex flex-col items-start space-y-2">
            <Button type="submit">Register</Button>
            <div className="flex flex-row items-center space-x-2">
              <span className="text-sm">Already have an account?</span>
              <Link to="/login">
                <Button compact variant="light">
                  Sign in.
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
