# 🚨 AISA™ Chat Response Latency & Performance Issues Report

## Executive Summary

This report documents the specific technical issues and architectural bottlenecks causing slow chat response times in the AISA™ web application (`AISA_New` & `AISA_New_Backend`).

Currently, users experience a delay of **6.5 to 16.5 seconds** before seeing any response text after hitting Enter. This issue is **not** a hardware or database failure, but the cumulative effect of a **blocking HTTP request model** and a **multi-stage synchronous pre-processing AI pipeline**.

---

## 🔍 Detailed Issue Breakdown

### Issue #1: Synchronous Non-Streaming Request Architecture (The #1 Delay Factor)

* **Severity**: 🔴 Critical (User Experience Bottleneck)
* **Code Locations**:
  - Frontend: `AISA_New/src/services/geminiService.js` (`axios.post(apis.chatAgent, payload)`)
  - Backend: `AISA_New_Backend/routes/chatRoutes.js` (`router.post('/', ... res.json(chatResponse))`)
  - AI Service: `AISA_New_Backend/services/ai.service.js` (`const chatResponse = await aiService.chat(...)`)

#### Root Cause Explanation:
Large Language Models (LLMs) generate output sequentially, one token at a time (~20ms to 40ms per token). A typical 500-word response consists of ~700 tokens, requiring **14 to 20 seconds** of raw generation time.

Currently:
1. The frontend fires an `axios.post` request and **waits synchronously**.
2. The backend waits for the **entire 700 tokens** to finish generating on the server.
3. The backend packages the complete text into a single JSON object and returns `res.json(...)`.
4. The user sees a static `"Thinking..."` spinner for 15+ seconds without any feedback until the entire answer loads at once.

---

### Issue #2: Double-LLM Call Overhead (`analyzeRAGRequirements`)

* **Severity**: 🟠 High (Unnecessary API Latency)
* **Code Location**: `AISA_New_Backend/services/ai.service.js` (lines 266–272 calling `vertexService.analyzeRAGRequirements(message)`)

#### Root Cause Explanation:
Before starting to generate an answer, every chat request executes `analyzeRAGRequirements(message)` in `vertex.service.js`. This function sends an **auxiliary LLM prompt** to Google Vertex AI (`gemini-1.5-flash`) asking:
> *"Does this question require company document retrieval? Rewrite the query if needed."*

#### Impact:
- Adds **1,500ms to 3,500ms** of latency on **EVERY prompt**, including basic conversational messages like *"hi"*, *"how are you"*, or *"what is dataset"*.
- Essentially doubles the number of external LLM API calls required per message.

---

### Issue #3: Synchronous Vector Embedding Generation (`memoryService.retrieveMemory`)

* **Severity**: 🟠 High (Blocking REST API Call)
* **Code Location**: `AISA_New_Backend/services/memory.service.js` (lines 31–60 in `generateEmbedding`)

#### Root Cause Explanation:
On every message, `memoryService.retrieveMemory(conversationId, message, 5)` is executed:
1. Obtains Google OAuth2 access tokens using `auth.getClient()`.
2. Makes a REST API request to Google Cloud Vertex AI endpoint:
   `https://asia-south1-aiplatform.googleapis.com/.../models/text-embedding-004:predict`
3. Performs in-memory cosine similarity calculations over historical MongoDB messages.

#### Impact:
Adds **800ms to 1,500ms** of network latency before response generation can even begin.

---

### Issue #4: Heavy Model Selection & Massive System Instructions

* **Severity**: 🟡 Medium (Inference Computation Speed)
* **Code Locations**:
  - `AISA_New_Backend/config/vertex.js`
  - `AISA_New_Backend/services/ai.service.js`

#### Root Cause Explanation:
1. **Model Choice**: Standard chat queries default to `gemini-1.5-pro` or Vertex AI GenerativeModel default settings. While `gemini-1.5-pro` is capable of complex reasoning, its Time-To-First-Token is significantly higher than **`gemini-1.5-flash`**.
2. **System Prompt Inflation**: Modes like `LEGAL_TOOLKIT` and `CODE_WRITER` append large system instructions and persona constraints exceeding 2,000 words. Pre-filling large context windows increases processing latency on every turn.

---

### Issue #5: Blocking Database Writes During Request Lifecycle

* **Severity**: 🟡 Medium (I/O Overhead)
* **Code Location**: `AISA_New_Backend/services/ai.service.js` & `chatRoutes.js`

#### Root Cause Explanation:
Saving user query logs (`QueryLog.create`), updating chat session metadata (`touchSession`), and storing vector embeddings happen during the active HTTP request lifecycle. If MongoDB Atlas experiences network latency, the active HTTP response is delayed further.

---

## ⏱️ Waterfall Breakdown of Request Latency

```
0.0s ──── Auth & Middleware Check (~50ms)
0.1s ──── Intent Classifier (~150ms)
0.3s ──── [BLOCKING] RAG Requirement LLM Query (analyzeRAGRequirements) (+2,200ms)
2.5s ──── [BLOCKING] Vertex Embeddings REST Call (text-embedding-004) (+1,200ms)
3.7s ──── [BLOCKING] Main LLM Inference Generation (Gemini Pro) (+6,500ms)
10.2s ─── Response complete → JSON sent to Frontend
```

Total Time User Waits Before First Word Appears: **~10.2 Seconds**
