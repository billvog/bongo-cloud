import { FilesystemItem } from "../types";
import { isJwtTokenExpired } from "../utils/jwt-expiration";
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "./auth-tokens";

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://bongoapi.bongo-cloud.ga"
    : "http://localhost:8000";

type Method = "GET" | "POST" | "DELETE" | "UPDATE" | "PUT" | "PATCH";

export type APIResponse<Data = any> = {
  status: number;
  ok: boolean;
  data: Data;
  headers: Headers;
};

type APIRequestOptions = {
  sendAsFormData: boolean;
};

const apiRefreshTokenIfNeeded = async (): Promise<string> => {
  let accessToken = getAccessToken();
  let refreshToken = getRefreshToken();

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

  return accessToken;
};

export const api = async <Data = any>(
  url: string,
  method: Method = "GET",
  body: object | null = null,
  options: APIRequestOptions = {
    sendAsFormData: false,
  }
): Promise<APIResponse<Data>> => {
  let accessToken = await apiRefreshTokenIfNeeded();

  const headers: HeadersInit = {};

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  let requestBody: FormData | string | null = null;
  if (body) {
    if (options.sendAsFormData) {
      requestBody = new FormData();
      for (const [key, value] of Object.entries(body)) {
        requestBody.append(key, value || "");
      }
    } else {
      requestBody = JSON.stringify(body);
      headers["Content-Type"] = "application/json";
    }
  }

  const response = await fetch(API_BASE_URL + url, {
    method,
    body: requestBody,
    headers,
  });

  const data = method === "DELETE" ? null : await response.json();
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

export const apiUploadFile = async (
  body: {
    parent: string | null;
    name: string;
    uploaded_file: Blob;
  },
  onProgress: (total: number, uploaded: number) => void
): Promise<APIResponse> => {
  let accessToken = await apiRefreshTokenIfNeeded();
  if (!accessToken) {
    throw new Error("Not authenticated");
  }

  const formData = new FormData();
  formData.append("parent", body.parent || "");
  formData.append("name", body.name);
  formData.append("uploaded_file", body.uploaded_file);

  var ajax = new XMLHttpRequest();
  await new Promise((res) => {
    ajax.upload.addEventListener(
      "progress",
      (e) => onProgress(e.total, e.loaded),
      false
    );
    ajax.addEventListener("load", () => res(true), false);
    ajax.addEventListener("error", () => res(false), false);
    ajax.addEventListener("abort", () => res(false), false);
    ajax.open("POST", API_BASE_URL + "/filesystem/create/");
    ajax.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    ajax.send(formData);
  });

  const status = ajax.status;
  const data = JSON.parse(ajax.response);

  return {
    status,
    ok: status === 201,
    data,
    headers: {} as any,
  };
};

export const apiDownloadFile = async (
  item: FilesystemItem,
  onProgress: (total: number, recieved: number) => void
) => {
  if (!item.is_file) {
    return;
  }

  let accessToken = await apiRefreshTokenIfNeeded();

  const headers: HeadersInit = {};
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(item.uploaded_file!, {
    method: "GET",
    headers,
  });

  const contentLength = response.headers.get("content-length") || "0";
  const total = parseInt(contentLength);
  let loaded = 0;

  const responseWithProgress = new Response(
    new ReadableStream({
      async start(controller) {
        if (!response.body) return;
        const reader = response.body.getReader();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          loaded += value.byteLength;
          onProgress(total, loaded);
          controller.enqueue(value);
        }
        controller.close();
      },
    })
  );

  const blob = await responseWithProgress.blob();

  var url = window.URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = item.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
};
