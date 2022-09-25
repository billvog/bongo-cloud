import React from "react";
import { Link } from "react-router-dom";

export const AboutPage: React.FC = () => {
  return (
    <div className="clouded-bg-container">
      <div
        className="bg-white bg-opacity-30 max-w-xl min-h-full h-fit px-8 py-10 space-y-4 overflow-y-auto"
        style={{
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <Link to="/">Return</Link>
        <h1>About us.</h1>
        <p>
          Behind <b>Bongo Cloud</b>, <b>Bongoose</b> and <b>Bongo-Vault</b>{" "}
          there lies the team that brought to humanity that revolutionary
          product. We, the Bongo Team, are about to introduce ourselves. But
          firstly, let us explain some things about what we build:
        </p>
        <h2>Why Bongo?</h2>
        <p>
          Well, that's a question we get quite often. In a time that nearly
          every major tech company offers fixed cloud storage solutions, we
          thought about people that just need some space on the cloud, to store
          backups and other personal files and aren't willing to pay a cent. So,
          that's how <b>Bongo Cloud</b> was born.
        </p>
        <h2>How does it work?</h2>
        <p>
          Essentially, Bongo lets its users share a 250 GB drive with each other
          without letting anyone pay a <b>single dollar</b>. That's it.
        </p>
        <h2>What about security?</h2>
        <p>Yeah, what about it?</p>
        <h1>The team.</h1>
        <h2>CEO.</h2>
        <p>
          Personally, I, as the Chief Executive Officer of Bongo, want to say
          that I use Bongo Cloud to upload my very personal files. Now, if any
          hacker finds them, please, don't send them to my wife. Additionally, I
          want to state that we take security very seriou- hahahahahahhah.
        </p>
      </div>
    </div>
  );
};
