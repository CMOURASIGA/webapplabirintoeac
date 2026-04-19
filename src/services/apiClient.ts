import { mockRequest } from "./mockBackend";
import type { ApiAction, ApiActionMap, ApiEnvelope } from "../types/api";

const apiMode = (import.meta.env.VITE_API_MODE ?? "mock").toLowerCase();
const apiUrl = import.meta.env.VITE_APPS_SCRIPT_URL ?? "";

async function requestAppsScript<TAction extends ApiAction>(
  action: TAction,
  payload: ApiActionMap[TAction]["request"]
): Promise<ApiEnvelope<ApiActionMap[TAction]["response"]>> {
  if (!apiUrl) {
    return {
      ok: false,
      error: "VITE_APPS_SCRIPT_URL nao configurado para modo apps_script."
    };
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    body: JSON.stringify({
      action,
      payload
    })
  });

  if (!response.ok) {
    return {
      ok: false,
      error: `Falha HTTP ${response.status} ao chamar o Apps Script.`
    };
  }

  const parsed = (await response.json()) as ApiEnvelope<ApiActionMap[TAction]["response"]>;
  return parsed;
}

export async function apiRequest<TAction extends ApiAction>(
  action: TAction,
  payload: ApiActionMap[TAction]["request"]
): Promise<ApiActionMap[TAction]["response"]> {
  const envelope =
    apiMode === "apps_script"
      ? await requestAppsScript(action, payload)
      : await mockRequest(action, payload);

  if (!envelope.ok) {
    throw new Error(envelope.error);
  }

  return envelope.data;
}

export function getApiModeLabel(): "mock" | "apps_script" {
  return apiMode === "apps_script" ? "apps_script" : "mock";
}
