---
name: docker-build
description: Build the production Docker image locally and report its size
---

Build the production Docker image and report basic info.

Steps:

1. Run `docker build -t stamprally:local .`
2. On failure, surface the failing Dockerfile line and the underlying error.
3. On success, run `docker images stamprally:local --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"` and report.
