<div align="center">

# 🧠 DocMind AI

### AI-Powered Document Intelligence Platform

**Upload. Understand. Ask. Learn.**

A modern PDF intelligence platform that uses **Retrieval-Augmented Generation (RAG)** to help users interact with their documents through semantic search, AI-powered conversations, summaries, citations, and interactive learning.

<br>

[![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-Vector_DB-FF6B35?style=for-the-badge)](https://www.trychroma.com/)
[![Gemini](https://img.shields.io/badge/Gemini-LLM-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

<br><br>

### 🔗 Project Resources

[🌐 GitHub Repository](https://github.com/AbhiVishnoi2024/docmind-project)  
[🎨 Figma Design / Prototype](https://www.figma.com/make/XF3GyyFEs187sKkWZnRMNi/Revamp-DocMind-AI-Design)  
[📐 Architecture Diagram](./design/architecture/docmind_architecture.drawio)  
[📚 Software Design](./design/README.md)

</div>

---

# 📌 Table of Contents

- [About DocMind AI](#-about-docmind-ai)
- [Problem Statement](#-problem-statement)
- [Solution](#-solution)
- [Key Features](#-key-features)
- [How It Works](#-how-it-works)
- [RAG Pipeline](#-rag-pipeline)
- [Technology Stack](#-technology-stack)
- [Software Architecture](#-software-architecture)
- [Software Design](#-software-design)
- [UI/UX Design](#-uiux-design)
- [Figma Design](#-figma-design)
- [Project Structure](#-project-structure)
- [Design Principles](#-design-principles)
- [Design Decisions](#-design-decisions)
- [Security](#-security)
- [Installation](#-installation)
- [Usage](#-usage)
- [Future Enhancements](#-future-enhancements)
- [Limitations](#-limitations)
- [Learning Outcomes](#-learning-outcomes)
- [Project Links](#-project-links)
- [Author](#-author)

---

# 🧠 About DocMind AI

**DocMind AI** is an AI-powered document intelligence platform designed to make large PDF documents easier to understand, search, summarize, and learn from.

Instead of manually searching through hundreds of pages, users can upload a PDF and interact with its content using natural-language questions.

The system combines:

- 📄 PDF document processing
- 🔍 Semantic search
- 🧠 Vector embeddings
- 💬 AI-powered document chat
- 📚 Retrieval-Augmented Generation
- 📝 Intelligent summaries
- ❓ Quiz generation
- 🎓 Smart learning
- 📌 Source citations
- 🔐 User authentication
- 📂 Document management

The core principle of DocMind AI is simple:

> **The AI should answer questions using the user's uploaded document context.**

---

# 🎯 Problem Statement

Large PDF documents such as:

- Academic books
- Research papers
- Technical manuals
- Lecture notes
- Reports
- Study materials
- Documentation

can contain hundreds of pages of information.

Traditional PDF readers provide basic search and navigation, but users still have to manually locate information, understand context, create summaries, and prepare study material.

This creates a gap between **having information** and **understanding information**.

---

# 💡 Solution

DocMind AI introduces an intelligent interaction layer over PDF documents.

The platform processes uploaded PDFs, converts their content into semantic vector representations, stores those representations in a vector database, and retrieves relevant sections whenever a user asks a question.

The retrieved context is then provided to the generative AI model to produce a grounded response.

```text
                    ┌──────────────────────┐
                    │       PDF File       │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │    Text Extraction   │
                    │       PyMuPDF        │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │    Text Chunking     │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │    Embeddings        │
                    │ Sentence Transformers│
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │      ChromaDB        │
                    │    Vector Storage    │
                    └──────────┬───────────┘
                               │
                               ▼
                         User Question
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Semantic Retrieval   │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Relevant PDF Context │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │       Gemini         │
                    │    Generative AI     │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ AI Answer + Citation │
                    └──────────────────────┘
