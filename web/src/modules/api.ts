import { FilesystemItem } from "../types";
import { getAccessToken, setAccessToken } from "./auth-tokens";

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

const updateAuthTokenFromResponseHeader = (headers: Headers) => {
  const newAccessToken = headers.get("x-access-token");
  if (newAccessToken) {
    setAccessToken(newAccessToken);
  }
};

const updateAuthTokenFromXMLHttpRequest = (ajax: XMLHttpRequest) => {
  const newAccessToken = ajax.getResponseHeader("x-access-token");
  if (newAccessToken) {
    setAccessToken(newAccessToken);
  }
};

export const api = async <Data = any>(
  url: string,
  method: Method = "GET",
  body: object | null = null
): Promise<APIResponse<Data>> => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  let accessToken = getAccessToken();
  headers["x-access-token"] = accessToken;

  const response = await fetch(API_BASE_URL + url, {
    method,
    body: body ? JSON.stringify(body) : null,
    headers,
    credentials: "include",
  });

  const data = method === "DELETE" ? null : await response.json();
  const resHeaders = response.headers;

  updateAuthTokenFromResponseHeader(resHeaders);

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
  let accessToken = getAccessToken();

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
    ajax.setRequestHeader("x-access-token", accessToken);
    ajax.withCredentials = true;
    ajax.send(formData);
  });

  const status = ajax.status;
  const data = JSON.parse(ajax.response);

  updateAuthTokenFromXMLHttpRequest(ajax);

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

  const headers: HeadersInit = {};

  let accessToken = getAccessToken();
  headers["x-access-token"] = accessToken;

  const response = await fetch(item.uploaded_file!, {
    method: "GET",
    headers,
    credentials: "include",
  });

  updateAuthTokenFromResponseHeader(response.headers);

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
