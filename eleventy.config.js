import rssPlugin from "@11ty/eleventy-plugin-rss";

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(rssPlugin);

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

  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/data");

  return {
    dir: { input: "src", output: "dist", includes: "_includes" },
    markdownTemplateEngine: "njk"
  };
}
