# app-onboard-datasecure-mail-securelibrarybank
aplicativo de onboard para 3 prestações de serviços


## Usando devcontainer:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
docker compose exec dev bash
```


## Usando a extensão Dev Contianer do VScode:

1. Procure pelo simbolo de duas setas (><) na barra de
tatus do vscode, localizada no canto inferio esquerdo.
2. Clique nela e depois uma caixa ira aparecer na sua barra de pesquisa do workspace, selecione abrir container
3. espere carregar todo o processo e seu container vai estar


## Após container rodar execute os comandos:
```bash
# Compilar plugins + app
cargo build --workspace
# Rodar o projeto
cargo tauri dev
```

**Nota:** Se `cargo tauri dev` não funcionar, instale tauri-cli
```bash
csargo install tauri-cli
```


## Build de produção:
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm prod-builder
```


## Localmente sem o Docker:
```bash
cargo build --workspace
cd src-tauri
cargo tauri dev
```