import { appParams } from '@/lib/app-params';

const SERVER_URL = 'https://base44.app';

/**
 * Upload un fichier vers l'API Base44 avec suivi de progression réel (XHR).
 * @param {File} file
 * @param {{ onProgress?: (info: {loaded:number, total:number, percent:number, speed:number, eta:number}) => void }} opts
 * @returns {Promise<{file_url:string}>}
 */
export function uploadFileWithProgress(file, { onProgress } = {}) {
  return new Promise((resolve, reject) => {
    const { appId, token } = appParams;
    const url = `${SERVER_URL}/api/apps/${appId}/integration-endpoints/Core/UploadFile`;

    const formData = new FormData();
    formData.append('file', file, file.name);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.setRequestHeader('X-Origin-URL', window.location.href);

    const startTime = Date.now();

    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable) return;
      const elapsed = (Date.now() - startTime) / 1000;
      const speed = elapsed > 0 ? e.loaded / elapsed : 0; // bytes/sec
      const remaining = e.total - e.loaded;
      const eta = speed > 0 ? remaining / speed : 0;
      onProgress?.({
        loaded: e.loaded,
        total: e.total,
        percent: Math.round((e.loaded / e.total) * 100),
        speed,
        eta,
      });
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try { resolve(JSON.parse(xhr.responseText)); }
        catch { reject(new Error('Réponse invalide')); }
      } else { reject(new Error(`Upload échoué (${xhr.status})`)); }
    };
    xhr.onerror = () => reject(new Error('Erreur réseau'));
    xhr.send(formData);
  });
}

/**
 * Formate une vitesse (bytes/sec) en chaîne lisible.
 */
export function formatSpeed(bytesPerSec) {
  if (!bytesPerSec || bytesPerSec <= 0) return '—';
  if (bytesPerSec < 1024) return `${Math.round(bytesPerSec)} o/s`;
  if (bytesPerSec < 1024 * 1024) return `${(bytesPerSec / 1024).toFixed(0)} Ko/s`;
  return `${(bytesPerSec / (1024 * 1024)).toFixed(1)} Mo/s`;
}

/**
 * Formate un temps (secondes) en chaîne lisible.
 */
export function formatEta(seconds) {
  if (!seconds || !isFinite(seconds) || seconds <= 0) return '';
  if (seconds < 1) return '< 1s';
  if (seconds < 60) return `${Math.ceil(seconds)}s restantes`;
  const min = Math.floor(seconds / 60);
  const sec = Math.round(seconds % 60);
  return `${min}min ${sec}s restantes`;
}