<div align="center">

# 🧠 DocMind AI

**Next-Generation Document Intelligence & Conversational Contextual Q&A Platform**

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18.0+-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Desktop-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![ChromaDB](https://img.shields.io/badge/ChromaDB-Vector_DB-FF6F61?style=for-the-badge&logo=databricks&logoColor=white)

---

[Vision Document](#-1-vision-document) • [MoSCoW User Stories](#-2-moscow-prioritization--25-user-stories) • [Wireframes](#-3-figma-wireframes--ui-specifications) • [Architecture](#-4-system-architecture) • [Quick Start](#-7-quick-start--local-development)

</div>

---

## 🎯 1. Vision Document

> **Executive Summary:** DocMind AI transforms static, unstructured multi-page documents into interactive, context-aware digital assistants capable of answering complex natural language queries with source attribution.

### 📌 Problem Statement
Students, researchers, and legal professionals waste countless hours manually scanning through massive PDFs and technical specification sheets. Traditional keyword search ($Ctrl + F$) fails because it ignores **semantic context, intent, and cross-document synthesis**.

### 👥 Target Personas
| Persona | Primary Goal | Key Pain Point |
| :--- | :--- | :--- |
| **Academic Researchers** | Rapid paper synthesis & citation tracking | Time wasted manually extracting methodology details. |
| **Legal Analysts** | Clause extraction & anomaly spotting | Overlooking risk factors hidden in dense legal boilerplate. |
| **Product Engineers** | Instant API spec and doc retrieval | Context-switching between multi-page developer guides. |

### 💡 Vision Statement
> *"To democratize document interaction by giving every user an instant, context-aware AI reading assistant that transforms reading long files into a fluid conversation."*

### 🚀 Key Features & Goals
* **Multi-Format Ingestion:** Support for PDF, DOCX, and TXT files.
* **Semantic Vector Search:** Instant natural language query resolution with precise source attribution.
* **Contextual Summarization:** One-click executive summaries and key takeaway generation.
* **Interactive Q&A Chat:** Real-time conversational interface backed by modern LLMs.

### 📈 Success Metrics
* **Query Latency:** Sub-3 second responses for standard queries.
* **Extraction Accuracy:** Over 90% relevant source matching via vector retrieval.
* **User Retention:** 40%+ reduction in document reading time reported by active users.

### ⚠️ Assumptions & Constraints
* **Assumptions:** Users have access to a modern browser and standard internet connection.
* **Constraints:** Document file size limited to 25MB per upload during local runtime. API costs bounded by open-source local LLMs or set rate limits.

---

## 📋 2. MoSCoW Prioritization & 25 User Stories

### 🔴 Must Have (Core MVP Functionality)
1. **US-01:** As a user, I want to upload a PDF document so that the system can process its content.
2. **US-02:** As a user, I want a chat interface so that I can ask questions about my uploaded document.
3. **US-03:** As a user, I want the AI to cite page numbers so that I can verify facts in the source file.
4. **US-04:** As a user, I want an authentication page so that I can securely log into my account.
5. **US-05:** As a developer, I want a FastAPI backend so that frontend requests are handled asynchronously.
6. **US-06:** As a user, I want to see a document processing progress bar so I know when my file is ready.
7. **US-07:** As a system, I want to extract text into chunks so that vector embeddings can be generated.
8. **US-08:** As a user, I want to view a list of all my uploaded documents on a main dashboard.
9. **US-09:** As a user, I want to delete documents from my library to manage storage space.
10. **US-10:** As a developer, I want a `docker-compose.yml` file so that frontend and backend launch together.

### 🟡 Should Have (High Value Features)
11. **US-11:** As a user, I want an automatic summary generated upon uploading a document.
12. **US-12:** As a user, I want to copy AI chat responses to my clipboard with one click.
13. **US-13:** As a user, I want to export my chat conversation as a PDF or Markdown file.
14. **US-14:** As a user, I want dark mode support so I can read comfortably at night.
15. **US-15:** As a user, I want keyword search across all my documents on the dashboard.
16. **US-16:** As a developer, I want automated error handling for corrupted file uploads.
17. **US-17:** As a user, I want to upload multiple files simultaneously to save time.
18. **US-18:** As a system, I want rate limiting on backend endpoints to prevent server overload.

### 🟢 Could Have (Enhancements)
19. **US-19:** As a user, I want to share a document Q&A session with a colleague via a link.
20. **US-20:** As a user, I want voice input capabilities to speak queries instead of typing.
21. **US-21:** As a user, I want support for parsing `.docx` and `.txt` files in addition to PDFs.
22. **US-22:** As a user, I want custom tag support (e.g., "Finance", "Research") to categorize files.
23. **US-23:** As a user, I want an inline PDF viewer side-by-side with the chat interface.

### ⚪ Won't Have (Deferred for Future Releases)
24. **US-24:** As a user, I want multi-language OCR audio transcription for video files.
25. **US-25:** As an enterprise admin, I want custom role-based access control (RBAC) team management.

---

## 🎨 3. Figma Wireframes & UI Specifications
*(Designed for 1920x1080 Desktop View)*

| Screen | Focus | Description |
| :--- | :--- | :--- |
| **01. Authentication** | Identity Layer | Centered login/signup card with OAuth integration and form validation. |
| **02. Dashboard** | Resource Management | Grid/List view of documents with upload date, tags, and global search. |
| **03. Upload Modal** | File Ingestion | Drag-and-drop zone featuring multi-file queue and embedding progress bars. |
| **04. Workspace** | Core Product | Split-screen: Interactive PDF reader on left, AI Q&A panel on right. |
| **05. Summarization** | Analytics | High-level executive bullet points, document metadata, and auto-generated tags. |
| **06. Settings** | Configuration | User preferences, API key management, theme toggle, and model selection. |

* 🔗 **Figma Design Link:** `[Insert Your Figma Share Link Here]`

---

## 🏗️ 4. System Architecture

### Visual Data Flow Diagram

```mermaid
graph TD
    Client[User Browser / React 18 + Vite]
    Gateway[FastAPI Gateway Service]
    Auth[JWT Auth Middleware]
    Chunker[Sentence-Splitter / Chunking Engine]
    VectorDB[(ChromaDB Vector Store)]
    RelDB[(PostgreSQL User DB)]
    LLM[LLM Engine / OpenAI / Ollama]

    subgraph DockerEnv [Docker Desktop Containerization Boundary]
        subgraph PresentationLayer [Frontend Tier]
            Client
        end
        subgraph ApplicationLayer [Backend Microservices Tier]
            Gateway
            Auth
            Chunker
        end
        subgraph DataLayer [Storage & Vector Search Tier]
            VectorDB
            RelDB
        end
    end

    Client -->|1. HTTPS / REST Requests| Gateway
    Gateway -->|2. Verify Token| Auth
    Gateway -->|3. File Upload Payload| Chunker
    Chunker -->|4. Generate Embeddings| VectorDB
    Gateway -->|5. Save Metadata| RelDB
    Gateway -->|6. Query Vector Index| VectorDB
    VectorDB -->|7. Return Top Chunks| Gateway
    Gateway -->|8. Context Prompt| LLM
    LLM -->|9. Response Payload| Gateway
    Gateway -->|10. Stream Response| Client
