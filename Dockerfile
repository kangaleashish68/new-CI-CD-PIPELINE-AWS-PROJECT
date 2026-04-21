# ══════════════════════════════════════════════════════
#   DOCKERFILE — Task Manager App
#   Build: docker build -t task-manager .
#   Run:   docker run -p 3000:3000 task-manager
# ══════════════════════════════════════════════════════

# ── Stage 1: Use Node 18 slim image ─────────────────────
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# ── Copy package files first (layer caching trick)
#    Only re-installs when package.json changes
COPY package*.json ./

# Install production dependencies only
RUN npm install --omit=dev

# ── Copy remaining source files ──────────────────────────
COPY . .

# ── Expose port ──────────────────────────────────────────
EXPOSE 3000

# ── Health check (used by Jenkins & Docker Compose) ──────
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

# ── Start the app ────────────────────────────────────────
CMD ["node", "server.js"]
