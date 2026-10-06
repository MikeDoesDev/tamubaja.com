import type { Metadata } from "next";

export function pageMetadata(options: {
  title: string;
  description: string;
  path: string;
  absolute?: boolean;
}): Metadata {
  return {
    title: options.absolute ? { absolute: options.title } : options.title,
    description: options.description,
    alternates: { canonical: options.path },
    openGraph: {
      title: options.title,
      description: options.description,
      url: options.path,
      siteName: "Texas A&M Baja SAE",
      type: "website",
      locale: "en_US",
    },
    twitter: { card: "summary_large_image", title: options.title, description: options.description },
  };
}
