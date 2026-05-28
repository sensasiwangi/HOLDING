import type { Lang } from "@/lib/dictionary.js";

export function langPath(basePath: string, lang: Lang): string {
  if (basePath === "/") return lang === "en" ? "/en" : "/";
  return lang === "en" ? `/en${basePath}` : basePath;
}

export const routes = [
  { href: "/", key: "nav.about" },
  { href: "/divisions", key: "nav.divisions" },
  { href: "/brands", key: "nav.brands" },
  { href: "/events", key: "nav.events" },
  { href: "/marketplace", key: "nav.marketplace" },
  { href: "/investor", key: "nav.investor" },
  { href: "/dashboard", key: "nav.dashboard" },
] as const;
