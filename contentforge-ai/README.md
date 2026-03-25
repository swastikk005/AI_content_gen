# ⚡ ContentForge AI — Write Better Content, 10x Faster

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![OpenRouter](https://img.shields.io/badge/AI-OpenRouter-7c3aed?style=flat-square)](https://openrouter.ai/)

**ContentForge AI** is a premium, dark-themed SaaS application designed for creators. It automates the entire content creation workflow—from real-time web research to structured outling and full-length content generation—all in under 60 seconds.

![Demo Placeholder](https://via.placeholder.com/1200x630/0a0a0f/7c3aed?text=ContentForge+AI+Demo+Coming+Soon)

## 🚀 Features

- **🔍 Intelligent Research**: Agent-driven research using DuckDuckGo to gather current context on any topic.
- **📋 Automated Outlining**: Structured AI planning for Blog Posts and YouTube Scripts.
- **✍️ Multi-Format Writing**: SEO-optimized blogs or timestamped YouTube scripts.
- **⚡ SSE Streaming**: Watch the AI agent work in real-time with live progress updates.
- **🛠️ Creator Tools**: Markdown editor, word counts, and multi-format exports (.txt, .md).
- **🎨 Premium UI**: High-end dark theme with glassmorphism, smooth animations, and mobile-first design.
- **🕹️ Demo Mode**: Functional preview even without an API key.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS 4.0
- **AI Engine**: OpenRouter (LLM Aggregator), DuckDuckGo (Search)
- **Styling**: Framer Motion / CSS Animations, Lucide Icons
- **Persistence**: LocalStorage (Waitlist MVP)

## 📦 Setup & Installation

1. **Clone the repo:**
   ```bash
   git clone https://github.com/swastikk005/AI_content_gen.git
   cd AI_content_gen/contentforge-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root:
   ```env
   OPENROUTER_API_KEY=your_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## 🌐 Deployment

This project is optimized for **Vercel**. Simply connect your GitHub repository, add your `OPENROUTER_API_KEY` to the environment variables, and deploy.

---

Built with 💜 by **Swastik**
[Live Demo](https://swastik-contentforge.vercel.app)
