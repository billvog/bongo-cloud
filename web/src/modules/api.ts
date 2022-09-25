import { FilesystemItem } from "../types";
import { getAccessToken, setAccessToken } from "./auth-tokens";
import "mrmime";
import { lookup } from "mrmime";

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

const updateAuthTokenFromXMLHttpRequest = (xhr: XMLHttpRequest) => {
  const newAccessToken = xhr.getResponseHeader("x-access-token");
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

  if (response.status >= 500) {
    throw new Error("Internal server error.");
  }

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
  onProgress: (xhr: XMLHttpRequest, total: number, uploaded: number) => void
): Promise<APIResponse> => {
  let accessToken = getAccessToken();

  const formData = new FormData();
  formData.append("parent", body.parent || "");
  formData.append("name", body.name);
  formData.append("uploaded_file", body.uploaded_file);

  var xhr = new XMLHttpRequest();
  await new Promise((res) => {
    xhr.upload.addEventListener(
      "progress",
      (e) => onProgress(xhr, e.total, e.loaded),
      false
    );
    xhr.addEventListener("load", () => res(true), false);
    xhr.addEventListener("error", () => res(false), false);
    xhr.addEventListener("abort", () => res(false), false);
    xhr.open("POST", API_BASE_URL + "/filesystem/create/");
    xhr.setRequestHeader("x-access-token", accessToken);
    xhr.withCredentials = true;
    xhr.send(formData);
  });

  const status = xhr.status;
  const data = JSON.parse(xhr.response);

  updateAuthTokenFromXMLHttpRequest(xhr);

  return {
    status,
    ok: status === 201,
    data,
    headers: {} as any,
  };
};

export const apiDownloadFile = async (
  item: FilesystemItem,
  onProgress: (xhr: XMLHttpRequest, total: number, recieved: number) => void,
  download_url: string | undefined = undefined,
  method: Method = "GET",
  body: any = undefined
): Promise<APIResponse> => {
  let accessToken = getAccessToken();

  var xhr = new XMLHttpRequest();
  await new Promise((res) => {
    xhr.open(
      method,
      typeof download_url === "string" ? download_url : item.download_url,
      true
    );
    xhr.setRequestHeader("x-access-token", accessToken);
    xhr.responseType = "blob";
    xhr.withCredentials = true;
    xhr.addEventListener(
      "progress",
      (e) => onProgress(xhr, e.total, e.loaded),
      false
    );
    xhr.addEventListener("load", () => res(true), false);
    xhr.addEventListener("error", () => res(false), false);
    xhr.addEventListener("abort", () => res(false), false);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 2) {
        onProgress(xhr, 1, 0);
      }

      if (xhr.readyState === 4 && xhr.status === 200) {
        var url = window.URL.createObjectURL(xhr.response);
        var a = document.createElement("a");
        a.href = url;
        a.download = item.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }

      if (xhr.status !== 200) {
        xhr.responseType = "json";
      }
    };

    let formData: FormData | undefined = undefined;
    if (body) {
      formData = new FormData();
      for (var key in body) {
        formData.append(key, body[key] as string);
      }
    }

    xhr.send(formData);
  });

  const status = xhr.status;
  const ok = status === 200;

  let data: any = null;
  if (!ok) {
    data = xhr.response;
  }

  updateAuthTokenFromXMLHttpRequest(xhr);

  return {
    status,
    ok: status === 200,
    data,
    headers: {} as any,
  };
};

export const apiGetFilePreview = async (item: FilesystemItem) => {
  if (!item.is_file) {
    return null;
  }

  let accessToken = getAccessToken();

  const response = await fetch(item.download_url!, {
    credentials: "include",
    headers: {
      "x-access-token": accessToken,
    },
  });

  const blob = await response.blob();

  const mimeType = lookup(item.name);
  if (!mimeType) {
    return URL.createObjectURL(blob);
  }

  const newBlob = new Blob([await blob.arrayBuffer()], { type: mimeType });
  return URL.createObjectURL(newBlob);
};
