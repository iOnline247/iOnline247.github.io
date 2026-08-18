---
title: accoutreai
description: My first semantic blog post
layout: post.njk
published: false
publishedTimestamp: 2026-08-10
tags: [ai, search]
---

# Safely Using Autonomous AI

## Problem

### Examples

## Accoutreai

### Usages

### Offline Usage

#### Copilot Settings

```env
COPILOT_PROVIDER_BASE_URL="http://localhost:11434"
COPILOT_PROVIDER_TYPE="openai"
COPILOT_PROVIDER_API_KEY="sk_OLLAMA_FOLKS"
COPILOT_MODEL="gemma4:e4b"
COPILOT_OFFLINE="true"
```

#### Claude Settings

COPILOT_PROVIDER_BASE_URL="http://localhost:11434"
COPILOT_PROVIDER_TYPE="openai"
COPILOT_PROVIDER_API_KEY="sk_OLLAMA_FOLKS"
COPILOT_MODEL="gemma4:e4b"
COPILOT_OFFLINE="true"




https://docs.docker.com/ai/sandboxes/docker-desktop/#network-policies





 Now that you can connect to Ollama, what are the exact settings that are needed to use Claude Code and work offline and use Ollama and this model?                                                                                                                                                                                                                                    
● claude-code-guide(Claude Code Ollama setup)                                                                                                                                               
  ⎿  Done (5 tool uses · 34.6k tokens · 28s)                                                                                                                                                
  (ctrl+o to expand)                                                                                                                                                                        
  
● Claude Code uses the Anthropic Messages API format, which Ollama doesn't natively speak. You need a translation proxy like LiteLLM in between.                                            
                                                                                                                                                                                            
  Setup                                                                                                                                                                                     
                                                                                                                                                                                              1. Install and configure LiteLLM                                                                                                                                                          
                                                                                                                                                                                              pip install 'litellm[proxy]'                                                                                                                                                                                                                                                                                                                                                          
  Create litellm_config.yaml:                                                                                                                                                                                                                                                                                                                                                           
model_list:                                                                                                                                                                                     - model_name: gemma4                                                                                                                                                                    
      litellm_params:                                                                                                                                                                               model: ollama/gemma4:e4b
        api_base: http://host.docker.internal:11434                                                                                                                                         
  
Start the proxy:

  litellm --config litellm_config.yaml --port 8000
                                                                                                                                                                                              2. Configure Claude Code
                                                                                                                                                                                            
  Set these environment variables:

  export ANTHROPIC_BASE_URL=http://localhost:8000
  export ANTHROPIC_AUTH_TOKEN=sk-litellm-key                                                                                                                                                  export ANTHROPIC_MODEL=gemma4
                                                                                                                                                                                              Or add to ~/.claude/settings.json:                                                                                                                                                          
  {                                                                                                                                                                                         
    "model": "gemma4",
    "env": {
      "ANTHROPIC_BASE_URL": "http://localhost:8000",
      "ANTHROPIC_AUTH_TOKEN": "sk-litellm-key"
    }                                                                                                                                                                                         }
                                                                                                                                                                                            
  Why this is needed

  Claude Code expects the Anthropic Messages API (/v1/messages). Ollama exposes an OpenAI-compatible API. LiteLLM sits in the middle and translates between the two formats.                  
  Note: Running Claude Code with a local model like gemma4 will work for basic tasks, but you'll likely see degraded performance compared to Claude models — especially for tool use,         multi-step reasoning, and complex code generation.
                                                                                                                                                                                            
  Want me to set this up for you?

### Errors

PS C:\Users\matth> docker sandbox run --pull-template missing --template accoutreai-claude-code:v1.1.1 --name accoutreai-sandbox-v1.1.1 claude d:\github\research\claude-test
Creating new sandbox 'accoutreai-sandbox-v1.1.1'...
Cleaning up...
failed to create sandbox: create sandbox: create sandbox: run sandbox: container create: Error response from daemon: Conflict. The container name "/accoutreai-sandbox-v1.1.1" is already in use by container "eee9c1612a1a30da24ee56da8e4497f683b46b556875cc154c41d31829032f6f". You have to remove (or rename) that container to be able to reuse that name.

Delete `C:\Users\matth\.docker\sandboxes\vm\accoutreai-sandbox-v1.1.1

**NOTE**: You may have to stop the Docker process in order to delete this directory.
