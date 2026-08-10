const isPublished = (data = {}) => {
  if (typeof data.published === "boolean") {
    return data.published;
  }

  return false;
};

export default {
  layout: "post.njk",
  eleventyComputed: {
    permalink: (data) => {
      return isPublished(data) ? data.permalink : false;
    },
    publishedTimestamp: (data) => {
      if (!isPublished(data)) {
        return null;
      }

      return data.publishedTimestamp || data.date;
    },
  },
};
