import React from "react";

interface MyFieldsetProps {
  hero: string | React.ReactNode;
  content: React.ReactNode;
}

export const MyFieldset: React.FC<MyFieldsetProps> = ({ hero, content }) => {
  return (
    <fieldset className="rounded-lg border-solid border-1 border-gray-300 p-4">
      <legend className="text-sm px-2">{hero}</legend>
      {content}
    </fieldset>
  );
};
