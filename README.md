# 🗣️ Anuvādakaḥ (The Universal Translator)

**Anuvādakaḥ** (Sanskrit for *Translator*) is a powerful, AI-driven translation application designed to bridge language barriers. It specializes in seamless translation between English and multiple Indian languages, supporting text, voice, and document formats.

![Project Status](https://img.shields.io/badge/Status-Active_Development-brightgreen)
![Tech Stack](https://img.shields.io/badge/Stack-React_&_Python-blue)

## 🚀 Key Features

* **🌐 Multi-Language Support:** Accurate translations for major Indian languages (Telugu, Hindi, Tamil, Kannada, Malayalam, etc.) and global languages.
* **🎙️ Voice-to-Voice:** Speak in your native language and hear the translation instantly.
* **📄 PDF Translation:** Upload PDF documents and translate their content while preserving context.
* **🌓 Dark/Light Mode:** A modern, user-friendly interface with theme support.

---

## 🏗️ System Architecture

```mermaid
graph TD
    User[User / Browser] -->|Interacts| UI[Frontend (React + Vite)]
    UI -->|Sends Text/Voice/PDF| API[Backend API (FastAPI)]
    
    subgraph Backend Services
        API -->|Text| TM[Translation Engine (Transformers)]
        API -->|Documents| PDF[PDF Parser (PDFPlumber)]
        API -->|Voice| STT[Speech-to-Text]
        TM -->|Translated Text| API
        PDF -->|Extracted Text| TM
    end
    
    API -->|Returns Result| UI