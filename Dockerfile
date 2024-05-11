FROM oven/bun:1.1.8-slim as builder

WORKDIR /work

COPY package.json ./
COPY bun.lockb ./
COPY tsconfig.json ./
COPY src ./src

RUN bun install --frozen-lockfile --production

RUN bun compile

FROM gcr.io/distroless/base-debian12:nonroot

COPY --from=builder /work/tsukedaicho-slack /

ENTRYPOINT [ "/tsukedaicho-slack" ]
