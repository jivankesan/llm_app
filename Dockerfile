# -------------------------
# 1) BUILD FRONTEND
# -------------------------
FROM node:18 as build-frontend

WORKDIR /app

# Copy package files and install deps
COPY frontend/package*.json ./
RUN npm install

# Copy rest of the frontend code and build
COPY frontend/ .
RUN npm run build  
# For Vite: outputs to /app/dist; For CRA: outputs to /app/build

# -------------------------
# 2) BUILD BACKEND
# -------------------------
FROM python:3.9-slim

WORKDIR /app

# Copy requirements and install Python deps
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend code
COPY backend/ .

# Copy the built frontend files from previous stage
# - If using Vite, the build output is /app/dist
# - If using Create React App, it'd be /app/build
COPY --from=build-frontend /app/dist ./frontend-dist

# Expose port
EXPOSE 8000

# By default, Python buffers output. Disabling makes logs appear instantly
ENV PYTHONUNBUFFERED=1

# -------------------------
# 3) RUN BACKEND
# -------------------------
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]