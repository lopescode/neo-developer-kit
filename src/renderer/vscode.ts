import type { ExtensionMessage, WebviewMessage } from "./messages";

// acquireVsCodeApi() may only be called once per webview, so we cache it here.
const api = acquireVsCodeApi();

/** Sends a typed message to the extension host. */
export function postMessage(message: WebviewMessage): void {
  api.postMessage(message);
}

/** Reads the persisted webview state. */
export function getState<T>(): T | undefined {
  return api.getState<T>();
}

/** Persists the webview state (survives the panel being hidden/reloaded). */
export function setState<T>(state: T): void {
  api.setState(state);
}

/**
 * Subscribes to messages from the extension host. Returns an unsubscribe fn.
 */
export function onMessage(
  handler: (message: ExtensionMessage) => void,
): () => void {
  const listener = (event: MessageEvent) =>
    handler(event.data as ExtensionMessage);
  window.addEventListener("message", listener);
  return () => window.removeEventListener("message", listener);
}
