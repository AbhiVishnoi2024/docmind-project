# DocMind AI — Enterprise Document Intelligence & RAG Platform

![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![ChromaDB](https://img.shields.io/badge/ChromaDB-FF6F61?style=for-the-badge)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=googlecloud&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

> An enterprise-grade, privacy-aware Document Intelligence System designed to parse, index, and perform contextual semantic search and Retrieval-Augmented Generation (RAG) over complex research literature, medical papers, and clinical PDFs.

---

## 📌 Executive Summary

Modern research workflows suffer from information fragmentation. Professionals spend excessive hours manually skimming 50+ page PDFs, clinical trials, and technical documentation. Traditional keyword-matching algorithms fail to synthesize context across long documents, leading to critical knowledge gaps.

**DocMind AI** bridges this gap by combining modular backend microservices, local embedding generation, dual-database persistence (relational + vector), and state-of-the-art LLMs. The platform converts unstructured PDF data into interactive, context-grounded insights with direct inline page citations.

---

## ✨ Core Features

* **🔐 User Authentication & Access Control:** Secure JWT-based registration, login, and session persistence using `passlib` and `bcrypt`.
* **📄 High-Speed PDF Ingestion:** Modular text extraction pipeline using `PyMuPDF` (`fitz`) with automated chunking strategies.
* **🧠 Contextual RAG Pipeline:** Semantic vector storage powered by `ChromaDB` and localized embedding via `sentence-transformers`.
* **💬 Intelligent AI Chat & Citations:** Interactive natural language interface connected to `Google Gemini API` providing grounded answers with document page numbers.
* **🔎 Literature Search:** Query indexed academic collections and clinical trial metadata instantly.
* **🎯 Smart Learning & Quiz Engine:** Automated quiz and flashcard generation based on uploaded document contents.
* **📊 Analytics Dashboard:** Visual overview tracking document counts, total queries, and learning progress.

---

## 🏗️ System Architecture & Data Flow

```text
[ React Frontend ] ──(REST API / JWT)──► [ FastAPI Backend ]
                                                 │
                   ┌─────────────────────────────┼─────────────────────────────┐
                   ▼                             ▼                             ▼
        [ PostgreSQL DB ]               [ PyMuPDF Parsing ]           [ ChromaDB Vector Store ]
     (User Profiles & Metadata)         & Chunking Engine               (Local Embeddings)
                                                 │                             │
                                                 └──────────────┬──────────────┘
                                                                ▼
                                                       [ Gemini RAG Pipeline ]
