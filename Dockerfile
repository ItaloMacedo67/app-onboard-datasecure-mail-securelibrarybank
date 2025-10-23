FROM alpine:latest AS base

RUN apk add --no-cache \
    build-base \
    curl \
    git \
    openssl-dev \
    gtk+3.0-dev \
    webkit2gtk-4.1-dev \
    libayatana-indicator-dev \
    librsvg-dev \
    wget \
    file \
    sudo \
    bash

RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

FROM base AS dev

RUN adduser -D -s /bin/bash vscode && \
    echo "vscode ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/vscode

USER vscode
WORKDIR /home/vscode

RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/home/vscode/.cargo/bin:${PATH}"

WORKDIR /workspace
CMD ["sleep", "infinity"]

FROM base as build
WORKDIR /workspace
COPY . .
RUN cargo build --release --workspace

RUN cargo tauri build --verbose

FROM scratch
WORKDIR /app

COPY --from=builder /workspace/src-tauri/target/release/bundle/appimage/*.AppImage .
