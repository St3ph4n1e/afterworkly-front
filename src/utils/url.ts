export function getImageUrl(path: string): string {
    const baseUrl = import.meta.env.VITE_API_BASE_URL.replace(/\/api$/, '');
    return path ? `${baseUrl}/${path}` : '/logo.png';
  }
  