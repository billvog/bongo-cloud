import React from "react";

export const ServerErrorPage: React.FC = () => {
  return (
    <div className="clouded-bg-container">
      <div className="bg-white max-w-lg p-8 rounded-lg">
        <h1>We're in big trouble.</h1>
        <div className="mt-4 space-y-2">
          <p>Dear users,</p>
          <p>
            We're sorry to let you know that our server is down (yes, that 200$
            laptop does not function as expected). Hence, you can't use Bongo
            Cloud.
          </p>
          <p>
            To let you know how sorry we are, follow the link below to get some
            additional free storage for lifetime.
          </p>
          <p>
            <a href="https://rroll.to/H4zL1P" target="blank">
              Get 10GB for free, for lifetime.
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
