/**
 * Utility to resolve API endpoints dynamically.
 * Helps mobile builds (Capacitor/APK) connect to the correct absolute Cloud Run backend URL
 * instead of trying to resolve relative paths against the local WebView.
 */
export function getApiUrl(path: string): string {
  // Detect if the application is running from a local context (e.g. Capacitor, native WebView, or offline local files)
  const origin = window.location.origin || '';
  const isLocalDevice = 
    origin.includes('localhost') || 
    origin.startsWith('file:') || 
    origin.startsWith('capacitor:') || 
    origin.includes('127.0.0.1') ||
    (!origin.includes('.run.app') && !origin.includes('.web.app') && !origin.includes('.firebaseapp.com'));

  // Dynamically store the origin if the app is currently running live on a Cloud Run or Firebase domain
  if (origin.includes('.run.app') || origin.includes('.web.app') || origin.includes('.firebaseapp.com')) {
    localStorage.setItem('API_BASE_URL', origin);
  }

  // Check if a custom API Base URL is saved in localStorage
  const savedBase = localStorage.getItem('API_BASE_URL');
  if (savedBase) {
    let base = savedBase.trim().replace(/\/+$/, '');
    
    // Ignore invalid or relative saved custom bases if we are on a native device 
    // to prevent Capacitor from intercepting it and returning local index.html
    const isLocalhost = base.includes('localhost') || base.includes('127.0.0.1');
    if (isLocalDevice && (!base.startsWith('http') || isLocalhost)) {
      console.warn('Ignoring invalid or localhost API_BASE_URL on native device:', base);
    } else {
      // Force HTTPS if hitting a Cloud Run domain to prevent 301 redirects changing POST to GET
      if (base.includes('.run.app') && base.startsWith('http://')) {
        base = base.replace('http://', 'https://');
      }
      return `${base}${path}`;
    }
  }

  if (isLocalDevice) {
    // Determine default host dynamically depending on development or production (APK/Shared build) environment
    const isProd = (import.meta as any).env?.PROD || (import.meta as any).env?.MODE === 'production';
    const defaultHost = isProd
      ? 'https://ais-pre-d67xfwdfelbbfjlgvkrcsm-20091058853.europe-west1.run.app'
      : 'https://ais-dev-d67xfwdfelbbfjlgvkrcsm-20091058853.europe-west1.run.app';
    return `${defaultHost}${path}`;
  }

  // On standard browsers connected to the online server, use relative URLs
  return path;
}
