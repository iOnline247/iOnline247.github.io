---
title: First Post
description: My first semantic blog post
layout: base.njk
tags: [ai, search]
---

# Hello World

This demonstrates semantic search, RSS, sitemap, pagination, and tags.

## React island

{% react "Counter", { start: 2, label: "React counter inside markdown" } %}

## Vue island

{% vue "GreetingCard", { title: "Vue card inside markdown", name: "Matthew" } %}

## Svelte island

{% svelte "FeatureList", { title: "Svelte list inside markdown", items: ["Static site", "Framework islands", "Shortcode authoring"] } %}
