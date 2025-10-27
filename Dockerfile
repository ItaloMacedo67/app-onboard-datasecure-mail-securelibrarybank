FROM alpine:3.20 AS base

RUN apk add --no-cache \
    build-base curl git openssl-dev gtk+3.0-dev \
    webkit2gtk-4.1-dev libayatana-indicator-dev librsvg-dev \
    wget file sudo bash

RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"


FROM base AS planner
WORKDIR /workspace

COPY .cargo ./.cargo
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

RUN adduser -D -s /bin/bash vscode && \
    echo "vscode ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/vscode

RUN cp -r /root/.cargo /home/vscode/

RUN su -l vscode -c "/home/vscode/.cargo/bin/rustup default stable"

RUN chown -R vscode:vscode /home/vscode/.cargo

USER vscode
WORKDIR /workspace

COPY --from=planner --chown=vscode:vscode /workspace/target ./target
ENV PATH="/home/vscode/.cargo/bin:${PATH}"
CMD ["sleep", "infinity"]


FROM base AS build
WORKDIR /workspace
COPY --from=planner /workspace/target ./target
COPY --from=planner /root/.cargo /root/.cargo
COPY .cargo ./.cargo
COPY . .

RUN cargo tauri build --verbose


FROM scratch AS final
WORKDIR /app
COPY --from=build /workspace/src-tauri/target/release/bundle/appimage/*.AppImage .
