<div align="center">

# 🧠 DocMind AI
### *Enterprise-Grade Document Intelligence & Grounded RAG Platform*

[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge&logo=githubactions)](https://github.com/AbhiVishnoi2024/docmind-project)
[![GitHub stars](https://img.shields.io/github/stars/AbhiVishnoi2024/docmind-project?style=for-the-badge&logo=github&color=gold)](https://github.com/AbhiVishnoi2024/docmind-project/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/AbhiVishnoi2024/docmind-project?style=for-the-badge&logo=github&color=orange)](https://github.com/AbhiVishnoi2024/docmind-project/issues)
[![GitHub last commit](https://img.shields.io/github/last-commit/AbhiVishnoi2024/docmind-project?style=for-the-badge&logo=git&color=blue)](https://github.com/AbhiVishnoi2024/docmind-project)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

<br />

![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI_0.100+-005571?style=for-the-badge&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL_15-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![ChromaDB](https://img.shields.io/badge/ChromaDB_Vector-FF6F61?style=for-the-badge&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini_1.5-8E75B2?style=for-the-badge&logo=googlecloud&logoColor=white)
![Docker](https://img.shields.io/badge/Docker_Desktop-2496ED?style=for-the-badge&logo=docker&logoColor=white)

<br />

[⚡ Quick Start](#-quick-start--local-development) • [🎯 Vision Document](#-vision-document) • [🏗️ Architecture](#%EF%B8%8F-system-architecture) • [🌿 Branching Strategy](#-branching-strategy-github-flow) • [📊 MoSCoW Prioritization](#-moscow-prioritization)

---

</div>

> [!IMPORTANT]
> **CSE2005 Software Engineering Academic Submission**  
> **Author:** Abhi Vishnoi | **Repository:** [AbhiVishnoi2024/docmind-project](https://github.com/AbhiVishnoi2024/docmind-project)

---

## 🎯 Vision Document

### 1. Project Name & Overview
**DocMind AI** is an enterprise-grade document intelligence system built to ingest, index, and query complex literature, medical records, and dense technical PDFs using Retrieval-Augmented Generation (RAG). By coupling local vector persistence with LLM orchestration, DocMind AI allows users to converse with their documents without risk of data hallucination.

### 2. Problem Statement
Modern academic and clinical workflows suffer from **information fragmentation**. Researchers spend up to 40% of their time manually skimming 50+ page PDFs. Traditional keyword search engines (`Ctrl+F`) fail because they lack semantic context, causing researchers to miss critical insights across complex documents.

### 3. Vision Statement
> *"To empower domain researchers with instant, grounded, and verifiable document intelligence through context-aware LLMs, real-time vector search, and precise page-level citations."*

### 4. Target Users (Personas)

| Persona | Role | Pain Point | DocMind AI Solution |
| :--- | :--- | :--- | :--- |
| **Dr. Aris** | Clinical Researcher | Spends hours extracting trial metrics across dozens of medical papers. | Automated batch PDF ingestion with instant cross-document metric extraction. |
| **Priya** | AI & Robotics Student | Needs exact inline mathematical and algorithmic summaries for literature reviews. | Contextual chat interface with direct inline page & paragraph citations. |

### 5. Key Features & Goals
* 🔐 **Secure JWT Authentication:** Token-based authentication using `OAuth2` and `bcrypt` password hashing.
* 📄 **High-Performance Chunking:** PDF extraction using `PyMuPDF` and dynamic recursive token splitting.
* 🧠 **Hybrid RAG Pipeline:** Embedding persistence with `ChromaDB` and natural language synthesis via `Google Gemini 1.5 Flash API`.
* 📌 **Grounded Source Attribution:** Real-time UI highlighting linking every AI response directly to its source PDF page.

### 6. Success Metrics
