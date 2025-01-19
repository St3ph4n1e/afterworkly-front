export function getImageUrl(path: string): string {
    const baseUrl = import.meta.env.VITE_API_BASE_URL.replace(/\/api$/, '');
    return path ? `${baseUrl}/${path}` : '/logo.png';
  }
  

  // export function getImageUrl(path: string, defaultImage = '/logo.png'): string {
  //   const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/api$/, '') || '';
  //   if (!path || typeof path !== 'string') {
  //     return defaultImage;
  //   }
  //   return `${baseUrl}/${path.replace(/^\/+/, '')}`;
  // }
  