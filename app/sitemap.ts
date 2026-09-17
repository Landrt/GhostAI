import { MetadataRoute } from "next";
import { getAllLegalDocuments } from "@/lib/legal/registry";

export default function sitemap(): MetadataRoute.Sitemap {
  const legalDocs = getAllLegalDocuments();

  const legalRoutes: MetadataRoute.Sitemap = legalDocs.map((doc) => ({
    url: `https://ghostai.app/legal/${doc.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [
    {
      url: "https://ghostai.app",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://ghostai.app/pricing",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://ghostai.app/legal",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...legalRoutes,
  ];
}
