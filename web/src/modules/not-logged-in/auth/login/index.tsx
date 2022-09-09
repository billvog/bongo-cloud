import { Button, PasswordInput, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import React from "react";
import { Link } from "react-router-dom";

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

  return (
    <div className="clouded-bg-container">
      <form
        onSubmit={form.onSubmit((values) => {
          console.log(values);
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
