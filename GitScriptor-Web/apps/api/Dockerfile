FROM python:3.11-slim

WORKDIR /app

# Install git and system dependencies
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN pip install poetry

# Copy pyproject.toml and install dependencies
COPY pyproject.toml ./
COPY ../../packages/gitscriptor_core ./packages/gitscriptor_core
RUN poetry config virtualenvs.create false && poetry install --only=main

# Copy source code
COPY src ./src

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
