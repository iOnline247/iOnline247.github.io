---
title: First Post
description: My first semantic blog post
layout: post.njk
published: true
publishedTimestamp: 2026-08-10
tags: [ai, search]
---

This demonstrates semantic search, RSS, sitemap, pagination, and tags.

## React island

{% react "Counter", { start: 0, label: "React counter inside markdown" } %}

## Vue island

{% vue "GreetingCard", { title: "Vue card inside markdown", name: "Matthew" } %}

## Svelte island

{% svelte "FeatureList", { title: "Svelte list inside markdown", items: ["Static site", "Framework islands", "Shortcode authoring"] } %}
