#!/usr/bin/env bash
set -Eeuo pipefail

IMAGE="${IMAGE:-ai-agents}"
WORKSPACE_DIR="${WORKSPACE_DIR:-$PWD}"
HOME_VOLUME="${HOME_VOLUME:-ai-agents}"
OLLAMA_API_BASE="${OLLAMA_API_BASE:-http://host.docker.internal:11434}"

mounts=(
  --mount "type=bind,source=$WORKSPACE_DIR,target=/workspace"
  --mount "type=volume,source=$HOME_VOLUME,target=/home/agent"
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
  --env "OLLAMA_API_BASE=$OLLAMA_API_BASE" \
  "${mounts[@]}" \
  "$IMAGE"
