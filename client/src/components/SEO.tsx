import { useEffect } from "react";

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  jsonLd?: Record<string, any>;
}

export function SEO({ title, description, image, url, jsonLd }: SEOProps) {
  useEffect(() => {
    // Update title
    document.title = title;

    // Update or create meta tags
    const updateMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    if (description) {
      updateMeta("description", description);
      updateMeta("og:description", description, true);
      updateMeta("twitter:description", description);
    }
    
    updateMeta("og:title", title, true);
    updateMeta("twitter:title", title);
    
    if (image) {
      updateMeta("og:image", image, true);
      updateMeta("twitter:image", image);
      updateMeta("twitter:card", "summary_large_image");
    }

    if (url) {
      updateMeta("og:url", url, true);
    }

    // JSON-LD
    if (jsonLd) {
      let script = document.querySelector('script[type="application/ld+json"]');
      if (!script) {
        script = document.createElement("script");
        script.setAttribute("type", "application/ld+json");
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLd);
    } else {
      const script = document.querySelector('script[type="application/ld+json"]');
      if (script) {
        script.remove();
      }
    }

  }, [title, description, image, url, jsonLd]);

  return null;
}
