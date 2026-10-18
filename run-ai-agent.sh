#!/usr/bin/env bash
set -Eeuo pipefail

IMAGE="${IMAGE:-ai-agents}"
WORKSPACE_DIR="$(cd "${WORKSPACE_DIR:-$PWD}" && pwd -P)"
HOME_VOLUME="${HOME_VOLUME:-ai-agents}"

# Projekt-eigenes node_modules-Volume (nie global): Name aus Ordnername + Hash des
# absoluten Pfads, damit gleichnamige Projekte an verschiedenen Orten nicht kollidieren.
project="$(basename "$WORKSPACE_DIR")"
project="${project//[^a-zA-Z0-9_.-]/-}"
path_hash="$(printf '%s' "$WORKSPACE_DIR" | shasum -a 256 | cut -c1-8)"
NODE_MODULES_VOLUME="${NODE_MODULES_VOLUME:-ai-agents-nm-${project}-${path_hash}}"

# Label erleichtert das Aufräumen: docker volume ls --filter label=ai-agents.workspace
if ! docker volume inspect "$NODE_MODULES_VOLUME" >/dev/null 2>&1; then
  docker volume create --label "ai-agents.workspace=$WORKSPACE_DIR" "$NODE_MODULES_VOLUME" >/dev/null
fi

mounts=(
  --mount "type=bind,source=$WORKSPACE_DIR,target=/workspace"
  --mount "type=volume,source=$HOME_VOLUME,target=/home/agent"
  # Container-eigenes node_modules: schattet das vom Mac-Host gebindmountete
  # Verzeichnis ab, damit linux-native Binaries (Rollup/esbuild/...) genutzt werden.
  --mount "type=volume,source=$NODE_MODULES_VOLUME,target=/workspace/node_modules"
)

if [ -f "$WORKSPACE_DIR/config/secrets" ]; then
  mounts+=(
    --mount "type=bind,source=$WORKSPACE_DIR/config/secrets,target=/workspace/config/secrets"
  )
fi

while IFS= read -r -d '' file; do
  filename="$(basename "$file")"
  mounts+=(
    --mount "type=bind,source=/dev/null,target=/workspace/$filename,ro"
  )
done < <(find "$WORKSPACE_DIR" -maxdepth 1 -type f -name '.env*' -print0)

exec docker run --rm -it \
  --network bridge \
  --add-host=host.docker.internal:host-gateway \
  "${mounts[@]}" \
  "$IMAGE"
