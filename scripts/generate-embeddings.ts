import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { pipeline } from "@xenova/transformers";

const BLOG_DIR = "./src/blog";
// NOTE:
// eleventy config is set to copy everything in src/data to the output, 
// so we can write the embeddings there and it will be available at runtime.
const OUTPUT_FILE = "./src/data/embeddings.json";
const MODEL = "Xenova/all-MiniLM-L6-v2";

async function generate() {
  const embedder = await pipeline("feature-extraction", MODEL);
  const files = fs.readdirSync(BLOG_DIR);
  const results = [];

  for (const file of files) {
    if (!file.endsWith(".md")) {
      continue;
    }

    const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
    const { data, content } = matter(raw);
    const output = await embedder(content, { pooling: "mean", normalize: true });

    results.push({
      slug: file.replace(".md", ""),
      title: data.title,
      description: data.description,
      embedding: Array.from(output.data),
    });
  }

  fs.mkdirSync("./src/data", { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results));

  console.log("Embeddings generated.");
}

generate();