import { type ApiResponse } from "@/types/api";
import { toast } from "sonner";

export const BASE_URL = import.meta.env.VITE_API_URL;

export async function apiCall(
  method: "GET" | "POST" | "PUT" | "DELETE",
  url: string,
  body?: object,
): Promise<ApiResponse> {
  try {
    const response = await fetch(BASE_URL + url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error ${response.status}: ${response.statusText}`, errorText);
      throw new Error(`${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Call failed:", error);
    toast.error(`Error fetching data: ${error.message}`);
    return { success: false };
  }
}
