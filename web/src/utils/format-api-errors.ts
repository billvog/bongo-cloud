type APIErrors = {
  [key: string]: string[];
};

type FormattedErrors = {
  [key: string]: string;
};

export const formatApiErrors = (errors: APIErrors): FormattedErrors => {
  const result: FormattedErrors = {};

  for (const [key, values] of Object.entries(errors)) {
    result[key] = values[0];
  }

  return result;
};
