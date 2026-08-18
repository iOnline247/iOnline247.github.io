import { pipeline } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1";

const SEARCH_MODEL = "Xenova/all-MiniLM-L6-v2";
const RESULT_LIMIT = 8;
const MIN_QUERY_LENGTH = 2;
const MIN_RELEVANCE_SCORE = 0.18;

const searchInput = document.getElementById("searchInput");
const searchStatus = document.getElementById("searchStatus");
const searchHeading = document.querySelector("[data-search-heading]");
const searchNote = document.querySelector("[data-search-note]");
const searchFeedResults = document.querySelector("[data-search-results]");
const searchPreviewResults = document.querySelector("[data-search-preview]");
const searchPagination = document.querySelector("[data-search-pagination]");

function initTaglineTypewriter() {
  const tagline = document.querySelector(".site-tagline-home .site-tagline-typed");

  if (!tagline) {
    return;
  }

  const fullText = tagline.textContent ?? "";

  if (!fullText) {
    return;
  }

  const characters = Array.from(fullText);
  const frameDelayMs = 34;
  let index = 0;

  tagline.textContent = "";

  const step = () => {
    index += 1;
    tagline.textContent = characters.slice(0, index).join("");

    if (index < characters.length) {
      window.setTimeout(step, frameDelayMs);
    }
  };

  window.setTimeout(step, frameDelayMs);
}

initTaglineTypewriter();

if (!searchInput || (!searchFeedResults && !searchPreviewResults)) {
  throw new Error("Search controls are missing from the page.");
}

const activeResults = searchFeedResults ?? searchPreviewResults;
const defaultFeedMarkup = searchFeedResults?.innerHTML ?? "";
const defaultPreviewMarkup = searchPreviewResults?.innerHTML ?? "";
const defaultHeading = searchHeading?.textContent ?? "";
const defaultNote = searchNote?.textContent ?? "";
const defaultPaginationHidden = searchPagination ? searchPagination.hidden : false;

let embedderPromise = null;
let postsPromise = null;
let renderToken = 0;
let debounceTimer = 0;
let semanticUnavailable = false;
let registryUnavailable = false;

function cosineSimilarity(a, b) {
  let sum = 0;

  for (let i = 0; i < a.length; i += 1) {
    sum += a[i] * b[i];
  }

  return sum;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeText(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokenize(value) {
  return normalizeText(value).split(" ").filter(Boolean);
}

function tokenCoverage(queryTokens, fieldTokens) {
  if (!queryTokens.length || !fieldTokens.length) {
    return 0;
  }

  const fieldSet = new Set(fieldTokens);
  const matches = queryTokens.filter((token) => fieldSet.has(token)).length;

  return matches / queryTokens.length;
}

function lexicalScore(query, post) {
  const normalizedQuery = normalizeText(query);
  const queryTokens = tokenize(query);

  if (!normalizedQuery || !queryTokens.length) {
    return 0;
  }

  const title = normalizeText(post.title);
  const description = normalizeText(post.description);
  const tags = normalizeText(Array.isArray(post.tags) ? post.tags.join(" ") : post.tags);
  const slug = normalizeText(post.slug);
  const url = normalizeText(post.url);

  let score = 0;

  if (title === normalizedQuery) {
    score += 0.35;
  }

  if (title.includes(normalizedQuery)) {
    score += 0.22;
  }

  if (description.includes(normalizedQuery)) {
    score += 0.08;
  }

  if (tags.includes(normalizedQuery)) {
    score += 0.2;
  }

  if (slug.includes(normalizedQuery) || url.includes(normalizedQuery)) {
    score += 0.05;
  }

  score += tokenCoverage(queryTokens, tokenize(title)) * 0.18;
  score += tokenCoverage(queryTokens, tokenize(description)) * 0.07;
  score += tokenCoverage(queryTokens, tokenize(tags)) * 0.12;

  return Math.min(score, 1);
}

function renderPostItem(post) {
  const publishedTimestamp = post.publishedTimestamp ? new Date(post.publishedTimestamp) : null;
  const dateLabel = publishedTimestamp
    ? new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }).format(publishedTimestamp)
    : "";
  const readingMinutes = Number.isFinite(post.readingMinutes) ? post.readingMinutes : 1;
  const description = post.description || "Read the full article for more detail.";

  return `<li class="site-post-item rounded-2xl transition">
    <a href="${escapeHtml(post.url)}" class="site-post-link block h-full rounded-2xl p-4">
      <span class="site-link site-post-title text-lg">${escapeHtml(post.title)}</span>
      <span class="site-post-meta mt-2 block text-xs uppercase tracking-[0.12em]">
        ${dateLabel ? `<time datetime="${publishedTimestamp.toISOString()}">${escapeHtml(dateLabel)}</time><span aria-hidden="true">&nbsp;&bull;&nbsp;</span>` : ""}
        <span>${readingMinutes} min read</span>
      </span>
      <span class="mt-2 block text-sm text-slate-700">${escapeHtml(description)}</span>
    </a>
  </li>`;
}

function renderEmptyState(query, message = null) {
  const statusMessage = message ?? `error: pattern '${query}' not found in registry.`;

  activeResults.innerHTML = `<li class="search-empty-state rounded-2xl border border-amber-900/60 bg-black/40 p-4 font-mono text-sm text-amber-200">${escapeHtml(statusMessage)}</li>`;

  if (searchPreviewResults && searchFeedResults) {
    searchPreviewResults.innerHTML = "";
    searchPreviewResults.hidden = true;
  }

  if (searchHeading) {
    searchHeading.textContent = "Search results";
  }

  if (searchNote) {
    searchNote.textContent = "";
  }

  if (searchPagination) {
    searchPagination.hidden = true;
  }

  if (searchStatus) {
    searchStatus.textContent = statusMessage;
    searchStatus.dataset.state = "error";
  }

  activeResults.setAttribute("aria-busy", "false");
}

function restoreDefaultState() {
  if (searchFeedResults) {
    searchFeedResults.innerHTML = defaultFeedMarkup;
    searchFeedResults.setAttribute("aria-busy", "false");
  }

  if (searchPreviewResults) {
    searchPreviewResults.innerHTML = defaultPreviewMarkup;
    searchPreviewResults.hidden = Boolean(searchFeedResults);
    searchPreviewResults.setAttribute("aria-busy", "false");
  }

  if (searchHeading) {
    searchHeading.textContent = defaultHeading;
  }

  if (searchNote) {
    searchNote.textContent = defaultNote;
  }

  if (searchPagination) {
    searchPagination.hidden = defaultPaginationHidden;
  }

  if (searchStatus) {
    searchStatus.textContent = "";
    searchStatus.removeAttribute("data-state");
  }

  activeResults.setAttribute("aria-busy", "false");
}

function setSearchState(message, state = "info") {
  if (!searchStatus) {
    return;
  }

  searchStatus.textContent = message;
  searchStatus.dataset.state = state;
}

async function getEmbedder() {
  if (!embedderPromise && !semanticUnavailable) {
    embedderPromise = pipeline("feature-extraction", SEARCH_MODEL).catch(() => {
      semanticUnavailable = true;
      return null;
    });
  }

  return embedderPromise;
}

async function getPosts() {
  if (!postsPromise && !registryUnavailable) {
    postsPromise = fetch("/data/embeddings.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load search registry (${response.status})`);
        }

        return response.json();
      })
      .catch(() => {
        registryUnavailable = true;
        return null;
      });
  }

  return postsPromise;
}

function rankPosts(query, queryEmbedding, posts) {
  const queryTokens = tokenize(query);

  return posts
    .map((post) => {
      const semanticScore = queryEmbedding ? cosineSimilarity(queryEmbedding, post.embedding) : 0;
      const lexical = lexicalScore(query, post);
      const score = queryEmbedding ? semanticScore * 0.72 + lexical * 0.28 : lexical;

      return { ...post, score, lexical };
    })
    .filter((post) => post.score >= MIN_RELEVANCE_SCORE || post.lexical > 0)
    .sort((left, right) => right.score - left.score || (right.publishedTimestamp || 0) - (left.publishedTimestamp || 0))
    .slice(0, RESULT_LIMIT);
}

async function updateResults(query, token) {
  const trimmedQuery = query.trim();

  if (trimmedQuery.length < MIN_QUERY_LENGTH) {
    restoreDefaultState();
    return;
  }

  activeResults.setAttribute("aria-busy", "true");

  const posts = await getPosts();

  if (token !== renderToken) {
    return;
  }

  if (!posts) {
    renderEmptyState(trimmedQuery, "error: search registry unavailable.");
    return;
  }

  const embedder = await getEmbedder();

  if (token !== renderToken) {
    return;
  }

  let queryEmbedding = null;

  if (embedder) {
    const output = await embedder(trimmedQuery, { pooling: "mean", normalize: true });
    queryEmbedding = Array.from(output.data);
  }

  const ranked = rankPosts(trimmedQuery, queryEmbedding, posts);

  if (token !== renderToken) {
    return;
  }

  if (!ranked.length) {
    renderEmptyState(trimmedQuery);
    return;
  }

  const renderedMarkup = ranked.map((post) => renderPostItem(post)).join("");

  if (searchFeedResults) {
    searchFeedResults.innerHTML = renderedMarkup;
    searchFeedResults.setAttribute("aria-busy", "false");
  }

  if (searchPreviewResults) {
    if (searchFeedResults) {
      searchPreviewResults.innerHTML = "";
      searchPreviewResults.hidden = true;
    } else {
      searchPreviewResults.innerHTML = renderedMarkup;
      searchPreviewResults.hidden = false;
    }

    searchPreviewResults.setAttribute("aria-busy", "false");
  }

  if (searchHeading) {
    searchHeading.textContent = "Search results";
  }

  if (searchNote) {
    searchNote.textContent = `Showing ${ranked.length} live ${ranked.length === 1 ? "match" : "matches"} for “${trimmedQuery}”.`;
  }

  if (searchPagination) {
    searchPagination.hidden = true;
  }

  setSearchState(`showing ${ranked.length} live ${ranked.length === 1 ? "match" : "matches"} for '${trimmedQuery}'.`);
  activeResults.setAttribute("aria-busy", "false");
}

function scheduleSearch() {
  window.clearTimeout(debounceTimer);
  renderToken += 1;
  const token = renderToken;
  const query = searchInput.value;

  debounceTimer = window.setTimeout(() => {
    updateResults(query, token);
  }, 180);
}

searchInput.addEventListener("input", () => {
  scheduleSearch();
});

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    searchInput.value = "";
    window.clearTimeout(debounceTimer);
    renderToken += 1;
    restoreDefaultState();
  }
});

if (searchInput.value.trim().length >= MIN_QUERY_LENGTH) {
  scheduleSearch();
} else {
  restoreDefaultState();
}