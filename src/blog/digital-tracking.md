---
title: Digital Tracking
description: \"Free\" doesn't mean it doesn't have a cost...
layout: post.njk
published: false
tags: [ai, search]
---

## Types of Digital Tracking  

## Pervasiveness  

## Best Defense is an Even Better Offense  

## Persona was Born  

### Original Prompt  

Study this paper: <https://arxiv.org/pdf/2602.16800v2>

We are going to build a Chrome Browser extension to combat against metadata the LLMs are using to identify people using pseudonyms, thus reducing the precision of this technique.

The extension will use the Transformers.js library and will run exclusively within the browser. Choose the correct model for this environment and chat/prompt templates.

The extension will allow the user to register websites with a specific persona or randomly pick one from the list of presets. Randomly choosing a persona will be the default. We will offer 7 different predefined personas that the LLM can use to rewrite the text, unless the user has specified a specific one to use for a particular website. Present the user with a clean UX, a resizable textarea, button to convert text, an easy way to copy using the Clipboard API, a word count for both input and output, save to drafts feature, an area for usage stats over time, and anything else you might think of.
Tech Stack

Typescript
Vite for building assets
SvelteJS for UI components
Out of Scope

1 feature will be to configure the website to automatically rewrite text that is put into commonly known HTML input/textarea elements of that website.
