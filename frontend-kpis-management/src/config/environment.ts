// En desarrollo sin .env usa localhost:8080; en producción usa VITE_API_URL del build
const defaultApiUrl = import.meta.env.DEV ? "http://localhost:8080/api" : "";

export const config = {
  apiUrl: import.meta.env.VITE_API_URL ?? defaultApiUrl,
}; 