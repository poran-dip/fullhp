import { useRouter } from "next/navigation";

const MUTATING_METHODS = ["POST", "PATCH", "PUT", "DELETE"];

export function useApi() {
  const router = useRouter();

  const apiFetch = async (url: string, options: RequestInit = {}) => {
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json", ...options.headers },
      ...options,
    });

    if (MUTATING_METHODS.includes((options.method ?? "GET").toUpperCase())) {
      router.refresh();
    }

    return response;
  };

  return { apiFetch };
}
