import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    windowTitle: z.string().optional(),
    title: z.string(),
    subtitle: z.string().optional(),
    summary: z.string().optional(),
    handle: z.string().min(1),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    unlisted: z.boolean().default(false),
    comments: z.boolean().default(true),
  }),
});

export const collections = { blog };
