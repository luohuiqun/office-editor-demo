import { STATIC_RESOURCE } from "../const";

let initializePromise: Promise<void> | null = null;
let initializeApiUrl = "";

type DocsApiWindow = Window & {
  DocsAPI?: unknown;
};

function resetLoadedDocsApi(apiUrl: string) {
  if (!initializeApiUrl || initializeApiUrl === apiUrl) {
    return;
  }

  document
    .querySelectorAll<HTMLScriptElement>(
      'script[src*="/web-apps/apps/api/documents/api.js"]',
    )
    .forEach((script) => script.remove());
  document
    .querySelectorAll<HTMLIFrameElement>("iframe[data-onlyoffice-preload]")
    .forEach((iframe) => iframe.remove());

  try {
    delete (window as DocsApiWindow).DocsAPI;
  } catch {
    (window as DocsApiWindow).DocsAPI = undefined;
  }
}

function preloadEditorFrame() {
  if (
    document.querySelector(
      `iframe[data-onlyoffice-preload="${STATIC_RESOURCE.onlyoffice.preloadHtml}"]`,
    )
  ) {
    return;
  }

  const iframe = document.createElement("iframe");
  iframe.src = STATIC_RESOURCE.onlyoffice.preloadUrl;
  iframe.dataset.onlyofficePreload = STATIC_RESOURCE.onlyoffice.preloadHtml;
  iframe.className = "w-0 h-0 hidden absolute -z-10";
  document.body.appendChild(iframe);
}

export async function initializeOnlyOffice() {
  if (typeof window === "undefined") return;

  const apiUrl = STATIC_RESOURCE.onlyoffice.apiUrl;

  // #region debug-point A:api-url
  fetch("http://127.0.0.1:7777/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: "onlyoffice-api-load",
      runId: "pre-fix",
      hypothesisId: "A",
      location: "util/initialize.ts:46",
      msg: "[DEBUG] OnlyOffice API URL selected",
      data: {
        apiUrl,
        pageUrl: window.location.href,
        resourceRoot: STATIC_RESOURCE.onlyoffice.root,
      },
      ts: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  if (initializePromise && initializeApiUrl === apiUrl) {
    return initializePromise;
  }

  if (initializePromise && initializeApiUrl !== apiUrl) {
    initializePromise = null;
  }
  resetLoadedDocsApi(apiUrl);
  initializeApiUrl = apiUrl;

  initializePromise = new Promise<void>((resolve, reject) => {
    preloadEditorFrame();

    if ((window as DocsApiWindow).DocsAPI) {
      resolve();
      return;
    }

    let script = document.querySelector<HTMLScriptElement>(
      `script[src="${apiUrl}"]`,
    );

    if (!script) {
      script = document.createElement("script");
      script.src = apiUrl;
      document.head.appendChild(script);
    }

    script.addEventListener(
      "load",
      () => {
        // #region debug-point B:script-load
        fetch("http://127.0.0.1:7777/event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: "onlyoffice-api-load",
            runId: "pre-fix",
            hypothesisId: "B",
            location: "util/initialize.ts:78",
            msg: "[DEBUG] OnlyOffice API script loaded",
            data: {
              apiUrl,
              docsApiReady: Boolean((window as DocsApiWindow).DocsAPI),
              scriptSrc: script?.src,
            },
            ts: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
        resolve();
      },
      { once: true },
    );
    script.addEventListener(
      "error",
      () => {
        // #region debug-point D:script-error
        fetch("http://127.0.0.1:7777/event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: "onlyoffice-api-load",
            runId: "pre-fix",
            hypothesisId: "D",
            location: "util/initialize.ts:89",
            msg: "[DEBUG] OnlyOffice API script failed",
            data: { apiUrl, scriptSrc: script?.src },
            ts: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
        initializePromise = null;
        reject(new Error("Failed to load OnlyOffice DocsAPI script"));
      },
      { once: true },
    );
  });

  return initializePromise;
}
