# Code Challenge

## Description
This project aims to address a backend developer challenge.
## Features
- **Problem 4** Three ways to sum to n
- **Problem 5** A Crude Server
- **Problem 6** dArchitecture.

## Installation

1.  Clone the repository:
   ```bash
   git clone https://github.com/huy1992nd/code-challenge-99tech.git
   cd code-challenge-99tech
   ```

2. Install root dev tooling (husky, eslint, prettier):
   ```bash
   npm install
   ```

3. Problem 5 (API) setup:
   ```bash
   cd src/problem5
   npm install
   # Create .env with your DB URL
   # DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"
   npm run prisma:generate
   npm run prisma:migrate
   npm run dev

   # In another terminal to run tests for problem5
   npm test
   ```

## Linting & Formatting

- Run from repo root (flat ESLint config):
  ```bash
  npm run lint        # check
  npm run lint:fix    # fix
  npm run format      # prettier check
  npm run format:write
  ```
- Pre-commit hook runs:
  - ESLint --fix on staged `src/problem5/**/*.ts,tsx`
  - Jest tests in `src/problem5`
- Node modules are ignored via `.gitignore`. If they were accidentally tracked:
  ```bash
  git rm -r --cached node_modules src/problem5/node_modules
  git commit -m "chore: stop tracking node_modules"
  ```

## Problem 5 quick commands

```bash
# From repo root
cd src/problem5

# Dev server
npm run dev

# Build and start
npm run build && npm start

# OpenAPI (re)generate after controller changes
npm run tsoa:gen

# Prisma
npm run prisma:generate
npm run prisma:migrate
```




