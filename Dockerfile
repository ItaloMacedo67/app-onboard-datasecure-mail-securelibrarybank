FROM rust:bookworm AS base

ENV DEBIAN_FRONTEND=noninteractive

RUN printf '#!/bin/bash\nexit 101' > /usr/sbin/policy-rc.d && chmod +x /usr/sbin/policy-rc.d

RUN apt-get update && apt-get install -y --no-install-recommends \
    libwebkit2gtk-4.1-dev \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    sudo \
    git \
    && rm -rf /var/lib/apt/lists/*


FROM base AS planner
WORKDIR /workspace

COPY Cargo.toml Cargo.lock ./
COPY src-tauri/Cargo.toml ./src-tauri/
COPY src-tauri/tauri.conf.json ./src-tauri/
COPY src-tauri/capabilities ./src-tauri/capabilities/
COPY plugin_api/Cargo.toml ./plugin_api/
COPY meu_plugin_exemplo/Cargo.toml ./meu_plugin_exemplo/
COPY plugin_mail/Cargo.toml ./plugin_mail/
COPY .cargo ./.cargo

RUN mkdir -p src-tauri/src plugin_api/src meu_plugin_exemplo/src plugin_mail/src && \
    touch src-tauri/src/lib.rs && \
    echo "fn main() {}" > src-tauri/src/main.rs && \
    touch plugin_api/src/lib.rs meu_plugin_exemplo/src/lib.rs plugin_mail/src/lib.rs

RUN cargo build --workspace
RUN cargo build --release --workspace


FROM base AS dev

RUN useradd -ms /bin/bash vscode && \
    echo "vscode ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/vscode && \
    chmod 0440 /etc/sudoers.d/vscode

WORKDIR /workspace
RUN mkdir -p /workspace/target && \
    chown -R vscode:vscode /workspace

USER vscode

ENV CARGO_HOME="/home/vscode/.cargo"
ENV RUSTUP_HOME="/home/vscode/.rustup"
ENV PATH="/home/vscode/.cargo/bin:${PATH}"

COPY --from=planner --chown=vscode:vscode /usr/local/cargo /home/vscode/.cargo
COPY --from=planner --chown=vscode:vscode /usr/local/rustup /home/vscode/.rustup
COPY --from=planner --chown=vscode:vscode /workspace/target ./target
COPY --from=planner --chown=vscode:vscode /workspace/Cargo.lock /workspace/Cargo.lock

RUN rustup default stable && \
    cargo install tauri-cli --locked

CMD ["sleep", "infinity"]


FROM base AS build
WORKDIR /workspace
COPY --from=planner /workspace/target ./target
# Correção: O cache do cargo fica em /usr/local/cargo na imagem rust oficial
COPY --from=planner /usr/local/cargo /usr/local/cargo
COPY .cargo ./.cargo
COPY . .

RUN cargo tauri build --verbose


FROM debian:bookworm-slim AS final
WORKDIR /app
COPY --from=build /workspace/src-tauri/target/release/bundle/appimage/*.AppImage .
