import { Button, PasswordInput, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import React from "react";
import { Link } from "react-router-dom";

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
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email."),
      password: (value) =>
        value.length < 6 ? "Length must be at least 6 characters." : null,
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
