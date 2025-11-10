# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WhatsApp AI Helper is a Progressive Web App (PWA) that provides two main features:
1. **Chat Summarization**: Summarizes WhatsApp chat messages and suggests replies
2. **Article Conversion**: Converts web articles into WhatsApp-ready posts

**Key architectural principle**: This is a **fully client-side application**. All OpenAI API calls are made directly from the browser using the user's personal API key stored in `localStorage`. No backend server is involved.

## Development Commands

This project uses vanilla HTML/CSS/JavaScript with no build process. Development workflow:

```bash
# Serve locally (use any static server)
python -m http.server 8000
# OR
npx serve

# Test PWA functionality (requires HTTPS)
# Use ngrok or deploy to GitHub Pages for testing service worker offline capabilities
```

## Architecture & Code Structure

### Entry Points
- `index.html` - Main application UI with two features
- `key.html` - Separate page for storing OpenAI API key locally

### Core JavaScript Files

**app.js** - Main application logic:
- `askOpenAI(systemPrompt, userPrompt)` - Core function that makes direct calls to OpenAI's API
  - Uses `gpt-4o-mini` model
  - Reads API key from localStorage (`whatsappAI_key`)
  - Returns the assistant's response text
- `summarise()` - Feature 1: Summarizes chat and suggests replies, auto-copies to clipboard
- `articleToPost()` - Feature 2: Converts article URL to WhatsApp post format, auto-copies to clipboard
- Service worker registration for PWA functionality

**key.js** - Simple key storage:
- `save()` - Validates (must start with "sk-") and stores OpenAI key in localStorage

### Service Worker (sw.js)

**Cache strategy**: Cache-first with network fallback
- Cache name: `wa-ai-v1`
- Caches all static assets: HTML, JS, CSS, manifest
- Enables offline functionality for the PWA

**Important**: The cached paths are hardcoded for GitHub Pages deployment at `/whatsapp-ai-pwa/`. When modifying the service worker, update these paths if the deployment location changes.

### Data Flow

1. User enters OpenAI key via `key.html` → stored in `localStorage.whatsappAI_key`
2. User invokes feature from `index.html`
3. `app.js` retrieves key from localStorage
4. Direct fetch to `https://api.openai.com/v1/chat/completions` from browser
5. Response displayed and auto-copied to clipboard
6. No server logs or storage of user data

### PWA Manifest (manifest.json)

- App name: "WhatsApp AI Helper" (short: "WA-AI")
- Theme color: `#075e54` (WhatsApp green)
- Start URL: `/whatsapp-ai-pwa/` (GitHub Pages path)
- Standalone display mode for app-like experience

## Key Constraints

- **No build process**: Direct file editing, no transpilation or bundling
- **No dependencies**: No npm packages, frameworks, or libraries
- **GitHub Pages deployment**: All paths assume `/whatsapp-ai-pwa/` base path
- **Browser API requirements**: Uses `localStorage`, `fetch`, `navigator.clipboard`, and `serviceWorker`
- **HTTPS required**: PWA features (service worker, clipboard API) require secure context

## Common Modifications

### Changing the OpenAI Model
Update line 14 in `app.js`:
```javascript
model: 'gpt-4o-mini',  // Change to 'gpt-4', 'gpt-3.5-turbo', etc.
```

### Modifying System Prompts
- Chat summarization prompt: `app.js:41-47`
- Article conversion prompt: `app.js:60-64`

### Updating Cache Version
When deploying changes, increment the cache version in `sw.js:1`:
```javascript
const CACHE = 'wa-ai-v2';  // Increment version
```
This ensures users receive updated files.

### Changing Deployment Path
If deploying somewhere other than GitHub Pages at `/whatsapp-ai-pwa/`:
1. Update `FILES` array in `sw.js:2-10`
2. Update `start_url` in `manifest.json:5`
3. Update links in HTML files if needed
