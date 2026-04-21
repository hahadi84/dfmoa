import type { MetadataRoute } from "next";
import { SITE_OPERATOR } from "@/lib/site-operator";

const SITE_URL = SITE_OPERATOR.serviceUrl;

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "Yeti",
        allow: "/",
        disallow: "/admin",
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: "/admin",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
