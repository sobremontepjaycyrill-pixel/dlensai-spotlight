# Secrets & API Key Setup

## Purpose

This document defines the **standard and required process** for managing API keys and other secrets in the DLENSAI project. The goal is to ensure that **no sensitive credentials are ever committed, logged, or shared** in the repository.

This process is mandatory for all contributors.

---

## Core Rules (Non‑Negotiable)

* **No secrets in source code** (hardcoded values are forbidden)
* **No secrets in Git commits, commit history, screenshots, or logs**
* **All secrets must be provided via environment variables only**
* **`.env` files must never be committed**

If a key is exposed, it must be **immediately revoked and replaced**.

---

## Required Environment Variables

The following environment variables are required for the application to function. **Do not place actual values in this repository.**

```text
OPENAI_API_KEY=sk-...
OPENAI_ORG_ID=org_...
OPENAI_PROJECT_ID=proj_...
OPENAI_MODEL=gpt-4.1
```

> Note: Additional variables may be required depending on deployment or environment. Follow the same rules for any future secrets.

---

## Local Development Setup

1. Create a local environment file:

```bash
.env
```

2. Add the required variables:

```bash
OPENAI_API_KEY=your_api_key_here
OPENAI_ORG_ID=your_org_id_here
OPENAI_PROJECT_ID=your_project_id
OPENAI_MODEL=gpt-4.1
```

3. Ensure `.env` is listed in `.gitignore` 

4. Restart the application after making changes to environment variables.

---

## Production / Deployment Setup

For production environments:

* Set environment variables directly in the hosting platform (e.g. Vercel, Netlify, Docker, server environment)
* **Do not upload `.env` files to servers**
* Rotate keys if access scope changes or exposure is suspected

---

## Validation Checklist

Before pushing code:

* [ ] No API keys in source files
* [ ] No API keys in logs or debug output
* [ ] `.env` files are ignored by Git
* [ ] Secrets referenced only via environment variables

---

## Security Ownership

All contributors are responsible for:

* Following this process exactly
* Reporting any accidental exposure immediately
* Treating credentials as production‑grade secrets

Failure to follow this process may result in revoked access or blocked deployments.

---

**This file exists to formalize and enforce secure secret handling.**
