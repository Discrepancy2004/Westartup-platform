import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { isSupabaseConfigured as hasSupabaseConfig } from "@/lib/supabase/config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isSupabaseConfigured(): boolean {
  return hasSupabaseConfig();
}

export function isAiConfigured(): boolean {
  const provider = (process.env.AI_PROVIDER ?? "gemini").toLowerCase();
  if (provider === "groq") return Boolean(process.env.GROQ_API_KEY);
  return Boolean(process.env.GEMINI_API_KEY);
}

export function isRazorpayConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET,
  );
}
