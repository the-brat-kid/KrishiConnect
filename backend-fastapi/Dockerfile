FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN chmod +x start.sh \
    && groupadd -r app && useradd -r -m -d /home/app -s /bin/bash -g app app \
    && chown -R app:app /app /home/app

ENV HOME=/home/app
ENV XDG_RUNTIME_DIR=/tmp

USER app

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8000/ || exit 1

CMD ["./start.sh"]
