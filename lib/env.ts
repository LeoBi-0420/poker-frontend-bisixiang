const isDev = process.env.NODE_ENV !== "production";
const DEV_FALLBACK = "http://127.0.0.1:8001";
const PROD_FALLBACK = "https://poker-api-bisixiang.onrender.com";

function resolveBaseUrl(...values: Array<string | undefined>): string | undefined {
  return values.find((value) => Boolean(value?.trim()));
}

function readVar(name: string, value: string | undefined): string {
  if (!value) {
    return isDev ? DEV_FALLBACK : PROD_FALLBACK;
  }
  return value.replace(/\/+$/, "");
}

export function ensureEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    if (isDev) return DEV_FALLBACK;
    throw new Error(
      `Missing required environment variable ${key}. ` +
        `Set it in your hosting dashboard (e.g. Vercel → Project Settings → Environment Variables) ` +
        `or in .env.production.`,
    );
  }
  return value.replace(/\/+$/, "");
}

export const ENV = {
  isDev,
  /** Server-only: direct connection to FastAPI. */
  get apiServer(): string {
    return readVar(
      "API_BASE_URL",
      resolveBaseUrl(process.env.API_BASE_URL, process.env.BACKEND_API_URL),
    );
  },
  /** Browser-safe: public URL exposed at build time. */
  get apiPublic(): string {
    return readVar(
      "NEXT_PUBLIC_API_BASE_URL",
      resolveBaseUrl(
        process.env.NEXT_PUBLIC_API_BASE_URL,
        process.env.BACKEND_API_URL,
      ),
    );
  },
};
