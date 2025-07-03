import { glob} from "astro/loaders";
import { defineCollection, z } from "astro:content";

const posts = defineCollection({
  loader: glob({ base: "./src/collections/posts", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    published: z.boolean(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.string().array(),
  }),
});

const albums = defineCollection({
  loader: glob({ base: "./src/collections/albums", pattern: "**/*.yml" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      cover: image(),
      tags: z.string().array(),
      date: z.coerce.date(),
    }),
});

export const collections = { 
  posts,
  albums
 };
