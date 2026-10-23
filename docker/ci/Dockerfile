# syntax=docker/dockerfile:1.6
FROM cypress/included:10.7.0

ENV NODE_ENV=production \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_AUDIT=false \
    CYPRESS_INSTALL_BINARY=0 \
    CI=1 \
    PATH=/e2e/node_modules/.bin:$PATH

# Install `just` for task orchestration and a Chrome-family browser
RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends curl ca-certificates gnupg; \
    curl -sSfL https://just.systems/install.sh | bash -s -- --to /usr/local/bin; \
    # Try to install Google Chrome stable; fall back to Chromium if needed
    echo "Attempting to install Google Chrome stable..."; \
    mkdir -p /usr/share/keyrings; \
    (curl -fsSL https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-linux-signing-keyring.gpg \
      && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-linux-signing-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
      && apt-get update \
      && apt-get install -y --no-install-recommends google-chrome-stable) \
    || (echo "Falling back to Chromium..." && apt-get update && apt-get install -y --no-install-recommends chromium); \
    rm -rf /var/lib/apt/lists/*

WORKDIR /e2e

ENTRYPOINT ["just"]
CMD ["--list"]
