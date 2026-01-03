FROM node:18-alpine

# Create non-root user for security
RUN addgroup -S judge && adduser -S judge -G judge

WORKDIR /app

# Copy runner
COPY run.js .

USER judge

# Default command
ENTRYPOINT ["node", "run.js"]
