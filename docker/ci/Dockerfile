# syntax=docker/dockerfile:1.6
FROM cypress/included:10.7.0

ENV NODE_ENV=production \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_AUDIT=false \
    CYPRESS_INSTALL_BINARY=0 \
    CI=1 \
    PATH=/e2e/node_modules/.bin:$PATH

# Install `just` for task orchestration
RUN apt-get update \
 && apt-get install -y --no-install-recommends curl ca-certificates \
 && rm -rf /var/lib/apt/lists/* \
 && curl -sSfL https://just.systems/install.sh | bash -s -- --to /usr/local/bin

WORKDIR /e2e

ENTRYPOINT ["just"]
CMD ["--list"]
