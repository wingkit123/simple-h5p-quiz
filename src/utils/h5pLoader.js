// Utilities to load H5P related assets only once
let scriptPromises = new Map();

export function loadScriptOnce(src) {
  if (scriptPromises.has(src)) return scriptPromises.get(src);
  const p = new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load script ' + src));
    document.head.appendChild(s);
  });
  scriptPromises.set(src, p);
  return p;
}

export function loadCssOnce(href) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = href;
  document.head.appendChild(l);
}

let h5pGlobalPromise;
export async function ensureH5PGlobals({ playerBase, retryCount = 40, retryInterval = 200 }) {
  if (h5pGlobalPromise) return h5pGlobalPromise;
  h5pGlobalPromise = (async () => {
    const frameCss = `${playerBase}/styles/h5p.css`;
    const mainBundle = `${playerBase}/main.bundle.js`;
    loadCssOnce(frameCss);
    await loadScriptOnce(mainBundle);
    let tries = 0;
    while (!window.H5PStandalone && !window.H5P && tries < retryCount) {
      await new Promise(r => setTimeout(r, retryInterval));
      tries++;
    }
    if (!window.H5PStandalone && !window.H5P) {
      throw new Error('H5P globals not available');
    }
    return { frameCss, frameBundle: `${playerBase}/frame.bundle.js` };
  })();
  return h5pGlobalPromise;
}