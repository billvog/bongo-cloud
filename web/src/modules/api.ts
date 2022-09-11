import { FilesystemItem } from "../types";
import { isJwtTokenExpired } from "../utils/jwt-expiration";
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "./auth-tokens";

const API_BASE_URL = "http://localhost:8000";

type Method = "GET" | "POST";

type APIResponse<Data> = {
  status: number;
  ok: boolean;
  data: Data;
  headers: Headers;
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

  try {
    if (refreshToken) {
      if (!accessToken || isJwtTokenExpired(accessToken)) {
        const response = await fetch(API_BASE_URL + "/auth/refresh-token/", {
          method: "POST",
          body: JSON.stringify({ refresh: refreshToken }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.status !== 200) {
          throw new Error();
        }

        const refreshResponse = await response.json();
        accessToken = setAccessToken(refreshResponse.access);
      }
    }
  } catch {
    clearAuthTokens();
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
  const resHeaders = response.headers;

  // update tokens
  const newAccessToken = resHeaders.get("x-access-token");
  if (newAccessToken) {
    setAccessToken(newAccessToken);
  }

  const newRefreshToken = resHeaders.get("x-refresh-token");
  if (newRefreshToken) {
    setRefreshToken(newRefreshToken);
  }

  return {
    status: response.status,
    ok: response.status >= 200 && response.status < 300,
    data,
    headers: resHeaders,
  };
};

export const apiDownloadFile = async (item: FilesystemItem) => {
  let accessToken = getAccessToken();
  let refreshToken = getRefreshToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  try {
    if (refreshToken) {
      if (!accessToken || isJwtTokenExpired(accessToken)) {
        const response = await fetch(API_BASE_URL + "/auth/refresh-token/", {
          method: "POST",
          body: JSON.stringify({ refresh: refreshToken }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.status !== 200) {
          throw new Error();
        }

        const refreshResponse = await response.json();
        accessToken = setAccessToken(refreshResponse.access);
      }
    }
  } catch {
    clearAuthTokens();
  }

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(item.uploaded_file, {
    method: "GET",
    headers,
  });

  const blob = await response.blob();

  var url = window.URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = item.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
};
