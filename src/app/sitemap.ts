import { MetadataRoute } from "next";

const BASE = "https://holding-amber.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  return [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/divisions`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/brands`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/brands/arc-en-scent`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/events`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/marketplace`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE}/investor`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/divisions/produksi`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/divisions/store`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/divisions/event`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/divisions/ecommerce`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/divisions/digital`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/dashboard`, lastModified: now, changeFrequency: "daily", priority: 0.3 },
  ];
}
