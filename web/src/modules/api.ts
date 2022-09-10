import { isJwtTokenExpired } from "../utils/jwt-expiration";
import { getAccessToken, getRefreshToken, setAccessToken } from "./auth-tokens";

const API_BASE_URL = "http://localhost:8000";

type Method = "GET" | "POST";

type APIResponse<Data> = {
  data: Data;
  status: number;
};

export const api = async <Data = any>(
  url: string,
  method: Method = "GET",
  body: any = null
): Promise<APIResponse<Data>> => {
  let accessToken = getAccessToken();
  let refreshToken = getRefreshToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (refreshToken) {
    if (!accessToken || isJwtTokenExpired(accessToken)) {
      const refreshResponse = await (
        await fetch(API_BASE_URL + "/auth/refresh-token/", {
          method: "POST",
          body: JSON.stringify({ refresh: refreshToken }),
          headers: {
            "Content-Type": "application/json",
          },
        })
      ).json();

      accessToken = setAccessToken(refreshResponse.access);
    }
  }

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(API_BASE_URL + url, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers,
  });

  const data = await response.json();

  return {
    data,
    status: response.status,
  };
};
