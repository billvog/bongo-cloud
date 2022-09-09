import { Button } from "@mantine/core";
import React from "react";
import { Link } from "react-router-dom";

export const WelcomePage: React.FC = () => {
  return (
    <div className="clouded-bg-container space-y-8">
      <div>
        <h1 className="text-5xl text-center font-bold m-0">
          Welcome to Bongo Cloud!
        </h1>
      </div>
      <div
        className="max-w-xl p-6 space-y-3 rounded-lg bg-white bg-opacity-20"
        style={{
          backdropFilter: "blur(12px)",
        }}
      >
        <h3>Why use Bongo instead of Googl3 Drive or iCl0ud?</h3>
        <p>
          Fuck Googl3 Cloud and iCl0oud (🤮), Bongo Cloud is free and better!
        </p>
        <h3>How many storage size do I get?</h3>
        <p>
          Bongo's strategy is far beyond any other ever seen. Essentially, all
          of our users share a 250 GB laptop's drive that's hosting this very
          website. So, don't share the word, because the more the people who
          know, the less the storage for you! (🤫)
        </p>
        <h3>Will my files be safe?</h3>
        <p>No, but life's full of risks. (🔓)</p>
        <h3>How serious do you take security?</h3>
        <p>What's that? (🤔)</p>
      </div>
      <div className="flex flex-row items-center space-x-4">
        <Link to="/register">
          <Button>Sign up, it's free</Button>
        </Link>
        <div>
          <span className="mr-3">or</span>
          <Link to="/login">
            <Button variant="default" compact>
              Login
            </Button>
          </Link>
        </div>
      </div>
      <div className="flex flex-row text-sm font-semibold underline space-x-4">
        <Link to="/about">About us</Link>
        <Link to="/jobs">Jobs</Link>
        <Link to="/contact">Get in touch</Link>
      </div>
    </div>
  );
};
