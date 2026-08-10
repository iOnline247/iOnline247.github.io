import rssPlugin from "@11ty/eleventy-plugin-rss";

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(rssPlugin);

  const isPublished = (itemData = {}) => {
    if (typeof itemData.published === "boolean") {
      return itemData.published;
    }

    return false;
  };

  const formatDate = (value, options) => {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return new Intl.DateTimeFormat("en-US", {
      ...options,
      timeZone: "UTC",
    }).format(date);
  };

  const toIsoDate = (value) => {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toISOString().slice(0, 10);
  };

  eleventyConfig.addCollection("publishedPosts", (collectionApi) =>
    collectionApi
      .getFilteredByGlob("src/blog/**/*.md")
      .filter((item) => isPublished(item.data))
  );

  eleventyConfig.addFilter("displayDate", (value) =>
    formatDate(value, {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  );

  eleventyConfig.addFilter("htmlDate", (value) => toIsoDate(value));

  const encodeJsonAttr = (value) =>
    JSON.stringify(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/'/g, "&#39;");

  const islandMarkup = (framework, componentName, props = {}) => {
    return `<div data-island-framework="${framework}" data-island-component="${componentName}" data-island-props='${encodeJsonAttr(props)}'></div>`;
  };

  eleventyConfig.addShortcode("react", (componentName, props = {}) =>
    islandMarkup("react", componentName, props)
  );
  eleventyConfig.addShortcode("vue", (componentName, props = {}) =>
    islandMarkup("vue", componentName, props)
  );
  eleventyConfig.addShortcode("svelte", (componentName, props = {}) =>
    islandMarkup("svelte", componentName, props)
  );

  eleventyConfig.ignores.add("src/assets/styles.css");
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/data");

  return {
    dir: { input: "src", output: "dist", includes: "_includes" },
    markdownTemplateEngine: "njk"
  };
}
