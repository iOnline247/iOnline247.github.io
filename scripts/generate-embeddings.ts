import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import { pipeline } from "@xenova/transformers";

const BLOG_DIR = "./src/blog";
// NOTE:
// eleventy config is set to copy everything in src/data to the output, 
// so we can write the embeddings there and it will be available at runtime.
const OUTPUT_FILE = "./src/data/embeddings.json";
const MODEL = "Xenova/all-MiniLM-L6-v2";

function isPublished(data: Record<string, unknown>): boolean {
  if (typeof data.published === "boolean") {
    return data.published;
  }

  if (typeof data.draft === "boolean") {
    return !data.draft;
  }

  return true;
}

async function generate() {
  const embedder = await pipeline("feature-extraction", MODEL);
  const files = fs.readdirSync(BLOG_DIR);
  const results = [];

  const toPlainText = (markdown) =>
    String(markdown)
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
      .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/^>\s?/gm, "")
      .replace(/[>*_~]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const toReadingMinutes = (text) => {
    if (!text) {
      return 1;
    }

    return Math.max(1, Math.round(text.split(" ").length / 220));
  };

  for (const file of files) {
    if (!file.endsWith(".md")) {
      continue;
    }

    const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
    const { data, content } = matter(raw);

    if (!isPublished(data)) {
      continue;
    }

    const plainText = toPlainText(content);
    const excerpt = plainText.slice(0, 1600);
    const tags = Array.isArray(data.tags) ? data.tags : [];
    const composedText = [data.title, data.description, tags.join(" "), excerpt]
      .filter(Boolean)
      .join("\n\n");
    const output = await embedder(composedText, { pooling: "mean", normalize: true });
    const slug = file.replace(/\.md$/, "");

    const publishedTimestamp = data.publishedTimestamp ? new Date(data.publishedTimestamp).getTime() : null;

    results.push({
      slug,
      url: `/blog/${slug}/`,
      title: data.title,
      description: data.description,
      tags,
      publishedTimestamp: Number.isFinite(publishedTimestamp) ? publishedTimestamp : null,
      readingMinutes: toReadingMinutes(plainText),
      embedding: Array.from(output.data),
    });
  }

  fs.mkdirSync("./src/data", { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results));

  console.log("Embeddings generated.");
}

generate();