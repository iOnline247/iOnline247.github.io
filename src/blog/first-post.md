---
title: First Post
description: My first blog post with examples of framework islands and shortcodes.
layout: post.njk
published: true
publishedTimestamp: 2026-08-09
tags: [ai, search]
---

This demonstrates RSS, sitemap, pagination, and tags.

## React island

{% react "Counter", { start: 0, label: "React counter inside markdown" } %}

## Vue island

{% vue "GreetingCard", { title: "Vue card inside markdown", name: "Matthew" } %}

## Svelte island

{% svelte "FeatureList", { title: "Svelte list inside markdown", items: ["Static site", "Framework islands", "Shortcode authoring"] } %}
