<div align="center">
  <h1>💰 Cost AI</h1>
  <p><b> LLM API Usage Tracking & Automatic Kill Switches</b></p>
  <br />

  [![Next.js](https://img.shields.io/badge/Next.js_15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
  [![PocketBase](https://img.shields.io/badge/PocketBase-B8DBE4?style=for-the-badge&logo=pocketbase&logoColor=black)](https://pocketbase.io/)
  [![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

</div>

---

## 📖 Overview

**Cost AI** is a modern application designed to help users understand, manage, and optimize their LLM (Large Language Model) costs with clarity and confidence.

Built with simplicity, speed, and usability in mind, Cost AI gives teams a cleaner way to work with financial or operational cost data without unnecessary complexity. Whether you are tracking API expenses across multiple providers, comparing options, reviewing estimates, or looking for smarter resource allocation, Cost AI is built to make the process more focused and efficient.

## ✨ Core Features

- 📊 **Real-time Cost Tracking:** Organized cost tracking and analysis specifically designed for LLM API usage.
- 🛑 **Automatic Kill Switches:** Implement hard limits and automated shut-offs to prevent budget overruns.
- ⚡ **Clean & Intuitive UX:** Fast access to important cost information for practical, everyday decision-making.
- 🔒 **Secure Infrastructure:** Fully containerized, local-first architecture with optional Cloudflare Tunnel access.

## 🛠️ Tech Stack

Cost AI is built on a high-velocity, robust modern stack:

- **Frontend:** Next.js 15 (Running on port `3001`)
- **Backend & Database:** PocketBase (Running on port `8090` with auto-initializing schemas)
- **Infrastructure:** Docker & Docker Compose (Internal bridge network `tracker_internal`)
- **Deployment:** Cloud-ready architecture with Cloudflare tunnel profile support

## 🚀 Quick Start

Get Cost AI running locally in seconds using Docker Compose.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running
- Git installed

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/costai.git](https://github.com/your-username/costai.git)
   cd costai
