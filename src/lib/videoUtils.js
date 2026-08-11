/**
 * Compresse une vidéo côté client via canvas + MediaRecorder.
 * - Redimensionne à max 720p (garde le ratio)
 * - Ré-encode en WebM (VP9/VP8 + Opus) à ~2 Mbps
 * - Retourne un File .webm beaucoup plus léger (souvent 10-15× plus petit)
 * Fallback: retourne le fichier original si l'API n'est pas supportée ou
 * si la compression ne réduit pas la taille.
 *
 * @param {File} file — fichier vidéo source
 * @param {{ maxWidth?: number, videoBitsPerSecond?: number, onProgress?: (p:number)=>void }} opts
 * @returns {Promise<File>}
 */
export function compressVideo(file, { maxWidth = 720, videoBitsPerSecond = 2_000_000, onProgress } = {}) {
  return new Promise((resolve) => {
    if (!file.type.startsWith('video/')) { resolve(file); return; }

    // Check API support
    if (typeof MediaRecorder === 'undefined' || !HTMLCanvasElement.prototype.captureStream) {
      resolve(file); return;
    }

    const video = document.createElement('video');
    video.muted = false;
    video.volume = 0; // silence speakers mais garde l'audio pour capture
    video.playsInline = true;
    video.preload = 'auto';
    video.src = URL.createObjectURL(file);

    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      URL.revokeObjectURL(video.src);
    };

    video.onloadedmetadata = async () => {
      const srcW = video.videoWidth;
      const srcH = video.videoHeight;
      if (!srcW || !srcH) { cleanup(); resolve(file); return; }

      // Calcul dimensions cible (downscale si > maxWidth, garde le ratio)
      let outW = srcW, outH = srcH;
      if (outW > maxWidth) {
        outH = Math.round((outH * maxWidth) / outW);
        outW = maxWidth;
      }
      // Dimensions paires (requis par certains codecs)
      outW = outW % 2 ? outW - 1 : outW;
      outH = outH % 2 ? outH - 1 : outH;

      const canvas = document.createElement('canvas');
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext('2d', { alpha: false });

      // Stream vidéo depuis le canvas
      const canvasStream = canvas.captureStream(30);

      // Audio : route via Web Audio pour garantir la capture (sans sortie speakers)
      let audioTrack = null;
      let audioCtx = null;
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') await audioCtx.resume();
        const sourceNode = audioCtx.createMediaElementSource(video);
        const destNode = audioCtx.createMediaStreamDestination();
        sourceNode.connect(destNode);
        audioTrack = destNode.stream.getAudioTracks()[0];
      } catch {
        // Fallback: captureStream sur l'élément vidéo
        try {
          const vs = (video.captureStream || video.mozCaptureStream).call(video);
          audioTrack = vs.getAudioTracks()[0];
        } catch {}
      }

      // Combine tracks
      const combinedStream = new MediaStream();
      canvasStream.getVideoTracks().forEach(t => combinedStream.addTrack(t));
      if (audioTrack) combinedStream.addTrack(audioTrack);

      // Choix du codec
      const mimeTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm',
      ];
      let mimeType = '';
      for (const t of mimeTypes) {
        if (MediaRecorder.isTypeSupported(t)) { mimeType = t; break; }
      }
      if (!mimeType) { cleanup(); if (audioCtx) audioCtx.close(); resolve(file); return; }

      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond,
        audioBitsPerSecond: 128_000,
      });

      const chunks = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      recorder.onstop = () => {
        cleanup();
        if (audioCtx) audioCtx.close();
        const blob = new Blob(chunks, { type: 'video/webm' });
        if (!blob.size || blob.size >= file.size) {
          // Compression inefficace → garde l'original
          resolve(file);
        } else {
          const outName = file.name.replace(/\.\w+$/, '.webm');
          resolve(new File([blob], outName, { type: 'video/webm' }));
        }
      };

      recorder.start(1000);

      // Boucle de dessin (real-time playback)
      let rafId;
      const draw = () => {
        if (video.ended) return;
        ctx.drawImage(video, 0, 0, outW, outH);
        if (onProgress && video.duration) {
          onProgress(Math.min(0.99, video.currentTime / video.duration));
        }
        rafId = requestAnimationFrame(draw);
      };

      video.onplay = () => { draw(); };
      video.onended = () => {
        cancelAnimationFrame(rafId);
        // Petit délai pour flush le dernier chunk
        setTimeout(() => {
          if (recorder.state !== 'inactive') recorder.stop();
        }, 250);
      };

      video.play().catch(() => {
        cleanup();
        if (audioCtx) audioCtx.close();
        resolve(file);
      });
    };

    video.onerror = () => { cleanup(); resolve(file); };
  });
}