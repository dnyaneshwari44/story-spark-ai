# ⬡ VisionLocal – AI Image Predictor

A privacy-first, fully local AI image analysis tool powered by [Ollama](https://ollama.com) and the [moondream](https://ollama.com/library/moondream) vision model. No images ever leave your device.

## Features

- 🤖 **Local inference** – runs entirely on your machine via Ollama
- 🔒 **100% private** – zero cloud uploads
- 🖼️ **Drag & drop** – drop any image or click to browse
- 🏷️ **Auto-tagging** – keyword tags extracted from AI descriptions
- ⚡ **Auto-resize** – images scaled to ≤1024 px before processing
- 🌐 **Configurable endpoint** – point to any Ollama server URL

## Prerequisites

1. Install [Ollama](https://ollama.com/download)
2. Pull the vision model:
   ```bash
   ollama pull moondream
   ```

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

Then open `http://localhost:5173`, enter your Ollama endpoint (default: `http://localhost:11434`), drop an image, and click **Analyze Image**.

## Project Structure

```
src/
├── App.jsx        # Main application component + inline theme styles
├── App.css        # Reserved for future component overrides
├── main.jsx       # React entry point
└── index.css      # Global reset (theme is managed inside App.jsx)
index.html         # HTML shell with correct meta tags
```

## Built With

- [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- [Ollama](https://ollama.com/) — local LLM runtime
- [moondream](https://github.com/vikhyat/moondream) — vision-language model

## License

MIT
