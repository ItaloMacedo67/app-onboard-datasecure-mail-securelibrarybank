FROM rust:bookworm AS base

RUN apt-get update && apt-get install -y \
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

ENV PATH="/root/.cargo/bin:${PATH}"

RUN cargo install tauri-cli --locked


FROM base AS planner
WORKDIR /workspace

COPY Cargo.toml Cargo.lock ./
COPY src-tauri/Cargo.toml ./src-tauri/
COPY plugin_api/Cargo.toml ./plugin_api/
COPY meu_plugin_exemplo/Cargo.toml ./meu_plugin_exemplo/
COPY plugin_mail/Cargo.toml ./plugin_mail/

RUN mkdir -p src-tauri/src plugin_api/src meu_plugin_exemplo/src plugin_mail/src && \
    touch src-tauri/src/lib.rs && \
    touch plugin_api/src/lib.rs meu_plugin_exemplo/src/lib.rs plugin_mail/src/lib.rs

RUN cargo build --release --workspace


FROM base AS dev

RUN useradd -ms /bin/bash vscode && \
    echo "vscode ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/vscode && \
    chmod 0440 /etc/sudoers.d/vscode

USER vscode
WORKDIR /workspace

ENV CARGO_HOME="/home/vscode/.cargo"
ENV PATH="/home/vscode/.cargo/bin:${PATH}"

RUN rustup default stable

RUN cargo install tauri-cli --locked

RUN echo 'export PATH="$HOME/.cargo/bin:$PATH"' >> /home/vscode/.bashrc

COPY --from=planner --chown=vscode:vscode /workspace/target ./target

CMD ["sleep", "infinity"]


FROM base AS build
WORKDIR /workspace
COPY --from=planner /workspace/target ./target
COPY --from=planner /root/.cargo /root/.cargo
COPY .cargo ./.cargo
COPY . .

RUN cargo tauri build --verbose


FROM debian:bookworm-slim AS final
WORKDIR /app
COPY --from=build /workspace/src-tauri/target/release/bundle/appimage/*.AppImage .
