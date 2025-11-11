export const fileToBase64 = (file: File): Promise<string> =>
  new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      const dataUrl = fr.result as string; // "data:<type>;base64,AAAA..."
      resolve(dataUrl.split(',')[1]);
    };
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });

 export const formatSize=(bytes: number): string=> {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  } else if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }
  return `${bytes} B`;
}