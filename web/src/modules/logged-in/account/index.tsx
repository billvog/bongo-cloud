import { Button, PasswordInput, TextInput } from "@mantine/core";
import React from "react";
import { useAuth } from "../../auth-context";
import { MyFieldset } from "../components/my-fieldset";
import { Layout } from "../layout";

export const AccountPage: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <Layout>
      <div className="p-8 space-y-8">
        <h1>Welcome back, {user.first_name}!</h1>
        <div className="w-full">
          <MyFieldset
            hero={<h3>Account Information</h3>}
            content={
              <div className="space-y-4 md:w-fit">
                <div className="flex flex-row space-x-4">
                  <TextInput
                    label="First name"
                    placeholder="First name"
                    value={user.first_name}
                    readOnly
                  />
                  <TextInput
                    label="Last name"
                    placeholder="Last name"
                    value={user.last_name}
                    readOnly
                  />
                </div>
                <TextInput
                  label="Username"
                  placeholder="Username"
                  value={user.username}
                  readOnly
                />
                <TextInput
                  label="Email Address"
                  placeholder="Email Address"
                  type="email"
                  value={user.email}
                  readOnly
                />
                <PasswordInput
                  label="Password"
                  placeholder="Enter your current password"
                  description="In order to update your account, we need to be sure it's you."
                  readOnly
                />
                <Button>Update</Button>
              </div>
            }
          />
        </div>
        <div className="w-full">
          <MyFieldset
            hero={<h3>Closing your account</h3>}
            content={
              <div className="space-y-4">
                <div className="text-red-500 space-y-2">
                  <p className="font-black underline">IMPORTANT!</p>
                  <p className="text-sm">
                    Closing your account is permanent and cannot be undone, so
                    think carefuly before continuing. Additionally, closing your
                    account will delete all the files you have uploaded on Bongo
                    Cloud.
                  </p>
                </div>
                <div>
                  <Button color="red">Close My Account...</Button>
                </div>
              </div>
            }
          />
        </div>
      </div>
    </Layout>
  );
};
