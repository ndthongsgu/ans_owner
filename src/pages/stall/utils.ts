export function makeId() {
  return `store-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string) || "");
    reader.onerror = (error) => reject(error);
  });
}
