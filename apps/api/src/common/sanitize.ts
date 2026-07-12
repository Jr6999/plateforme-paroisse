import slugify from "slugify";

export const toSlug = (value: string) =>
  slugify(value, {
    lower: true,
    strict: true,
    locale: "fr",
    trim: true
  });

/**
 * Supprime les vecteurs XSS courants du texte brut.
 * Pour du contenu HTML riche, utiliser une bibliothèque dédiée (DOMPurify, sanitize-html).
 */
export const sanitizeText = (value: string) =>
  value
    // Supprime les balises script et leur contenu
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    // Supprime tous les attributs d'événements HTML (onXxx=...)
    .replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\s+on\w+\s*=\s*[^\s>]*/gi, "")
    // Supprime javascript: et vbscript: dans les attributs href/src
    .replace(/(href|src|action)\s*=\s*["']?\s*(javascript|vbscript):/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/vbscript:/gi, "")
    // Supprime les balises iframe, object, embed
    .replace(/<(iframe|object|embed|form|base)[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<(iframe|object|embed|form|base)[^>]*\/?>/gi, "")
    .trim();

export const uniqueSlug = (title: string) => `${toSlug(title)}-${Date.now().toString(36)}`;
