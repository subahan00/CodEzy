FROM python:3.9-alpine

# Security: non-root user
RUN addgroup -S judge && adduser -S judge -G judge

WORKDIR /judge
COPY run.py .

WORKDIR /workspace
USER judge

ENTRYPOINT ["python3", "/judge/run.py"]