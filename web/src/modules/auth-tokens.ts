let accessToken: string = "";

export const getAccessToken = (): string => {
  return accessToken;
};

export const setAccessToken = (t: string): string => {
  accessToken = t;
  return accessToken;
};

export const clearAuthTokens = () => {
  setAccessToken("");
};
