const REFRESH_TOKEN_KEY = "@bongoclound/refresh-token";
let accessToken: string = "";

export const getAccessToken = (): string => {
  return accessToken;
};

export const setAccessToken = (t: string): string => {
  accessToken = t;
  return accessToken;
};

export const getRefreshToken = (): string => {
  return localStorage.getItem(REFRESH_TOKEN_KEY) || "";
};

export const setRefreshToken = (t: string) => {
  localStorage.setItem(REFRESH_TOKEN_KEY, t);
};
