/**
 * Compresse et redimensionne une image avant upload.
 * Max 1200px de large, qualité JPEG 0.82.
 * Les GIFs sont retournés tels quels (pas de recompression).
 */
export function compressImage(file, { maxWidth = 1200, quality = 0.82 } = {}) {
  return new Promise((resolve) => {
    // Ne pas toucher aux GIFs ou vidéos
    if (file.type === 'image/gif' || file.type.startsWith('video/')) {
      resolve(file);
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;

      // Redimensionner si trop large
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            // Si la compression est pire, garder l'original
            resolve(file);
          } else {
            resolve(new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' }));
          }
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}