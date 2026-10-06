import type { MetadataRoute } from "next";
import { projects } from "@/data";
import { absoluteUrl } from "@/lib/site";

/** Both indexable pages. Images let Google Images associate screenshots and the photo with the site. */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const projectImages = projects.map((p) =>
    p.cover.startsWith("http") ? p.cover : absoluteUrl(p.cover),
  );
  return [
    {
      url: absoluteUrl("/"),
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
      images: [absoluteUrl("/opengraph-image")],
    },
    {
      url: absoluteUrl("/cv"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
      // person.avatar is left out until the Cloudinary asset is restored (it currently 404s).
      images: projectImages,
    },
  ];
}
