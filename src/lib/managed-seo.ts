import type { Metadata } from "next";
import { db } from "@/lib/db";

/**
 * Reads the small, explicitly allow-listed set of public metadata overrides.
 * Database failure never removes metadata: callers always receive the checked-in fallback.
 */
export async function managedMetadata(
  section: "home" | "about" | "projects" | "articles" | "work-with-me",
  fallback: { title: string; description: string },
): Promise<Metadata> {
  try {
    const keys = [`seo.${section}.title`, `seo.${section}.description`];
    const values = await db.setting.findMany({
      where: { key: { in: keys } },
      select: { key: true, value: true },
    }) as { key: string; value: string }[];
    const map = new Map<string, string>(values.map((item) => [item.key, item.value.trim()]));
    const title = map.get(keys[0]);
    const description = map.get(keys[1]);
    return {
      title: title || fallback.title,
      description: description || fallback.description,
    };
  } catch (cause) {
    console.warn(`[managed-seo] Using checked-in ${section} metadata fallback:`, cause instanceof Error ? cause.message : cause);
    return fallback;
  }
}
