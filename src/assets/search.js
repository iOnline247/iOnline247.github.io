import { pipeline } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1";

let embedder = null;

function cosineSimilarity(a, b) {
  return a.reduce((sum, val, i) => sum + val * b[i], 0);
}

async function getEmbedder() {
  if (!embedder) {
    embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }

  return embedder;
}

document.getElementById("searchInput").addEventListener("keydown", async (e) => {
  if (e.key !== "Enter") {
    return;
  }
  
  const model = await getEmbedder();
  const output = await model(e.target.value, { pooling: "mean", normalize: true });
  const queryEmbedding = Array.from(output.data);
  const posts = await fetch("/data/embeddings.json").then(r => r.json());
  const ranked = posts.map(p => ({
    ...p,
    score: cosineSimilarity(queryEmbedding, p.embedding)
  })).sort((a, b) => b.score - a.score).slice(0, 5);

  document.getElementById("results").innerHTML =
    ranked.map(r => `<div><a href="/blog/${r.slug}/" class="text-blue-400">${r.title}</a></div>`).join("");
});