# =======================================================
# Dockerfile for Google Cloud Run Deployment
# Aura Café — Ambient AI Companion
# =======================================================

FROM python:3.11-slim

# Prevent Python from writing pyc files and buffer stdout/stderr
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8080

WORKDIR /app

# Install curl for container healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install backend dependencies first (cached if requirements.txt unchanged)
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r backend/requirements.txt

# Copy backend source code and frontend
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Non-root user for secure container execution
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Document exposed port (Cloud Run defaults to 8080)
EXPOSE 8080

# Health check to ensure service readiness
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8080}/api/health || exit 1

# Start server binding to 0.0.0.0 and reading dynamic $PORT from Cloud Run
CMD exec uvicorn backend.app:app --host 0.0.0.0 --port ${PORT:-8080}
