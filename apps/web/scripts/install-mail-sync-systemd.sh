#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME="coffeehq-mail-sync.service"
TIMER_NAME="coffeehq-mail-sync.timer"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEB_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
PROJECT_USER="${SUDO_USER:-${USER}}"
PROJECT_GROUP="$(id -gn "${PROJECT_USER}")"
PROJECT_HOME="$(getent passwd "${PROJECT_USER}" | cut -d: -f6)"

fail() {
  printf 'Error: %s\n' "$1" >&2
  exit 1
}

resolve_user_command() {
  local command_name="$1"

  if [[ "${EUID}" -eq 0 && -n "${SUDO_USER:-}" ]]; then
    sudo -u "${PROJECT_USER}" -H bash -lc "command -v ${command_name}"
  else
    command -v "${command_name}"
  fi
}

[[ -f "${WEB_DIR}/package.json" ]] || fail "package.json was not found at ${WEB_DIR}."
[[ -f "${WEB_DIR}/.env" ]] || fail ".env was not found at ${WEB_DIR}/.env."

NODE_BIN="$(resolve_user_command node)" || fail "node was not found for ${PROJECT_USER}."
NPM_BIN="$(resolve_user_command npm)" || fail "npm was not found for ${PROJECT_USER}."
NODE_DIR="$(dirname "${NODE_BIN}")"
NPM_DIR="$(dirname "${NPM_BIN}")"

if ! "${NODE_BIN}" -e '
  const pkg = require(process.argv[1]);
  if (!pkg.scripts || !pkg.scripts["mail:sync"]) process.exit(1);
' "${WEB_DIR}/package.json"; then
  fail 'package.json does not contain the mail:sync script.'
fi

chmod 600 "${WEB_DIR}/.env"

SERVICE_TMP="$(mktemp)"
TIMER_TMP="$(mktemp)"
trap 'rm -f "${SERVICE_TMP}" "${TIMER_TMP}"' EXIT

cat > "${SERVICE_TMP}" <<SERVICE
[Unit]
Description=CoffeeHQ incoming claims mailbox sync
Wants=network-online.target
After=network-online.target docker.service
ConditionPathExists=${WEB_DIR}/package.json
ConditionPathExists=${WEB_DIR}/.env

[Service]
Type=oneshot
User=${PROJECT_USER}
Group=${PROJECT_GROUP}
WorkingDirectory=${WEB_DIR}
Environment="NODE_ENV=production"
Environment="HOME=${PROJECT_HOME}"
Environment="PATH=${NODE_DIR}:${NPM_DIR}:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
ExecStart=${NPM_BIN} run mail:sync
TimeoutStartSec=5min
UMask=0077
NoNewPrivileges=true
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
SERVICE

cat > "${TIMER_TMP}" <<TIMER
[Unit]
Description=Run CoffeeHQ incoming mailbox sync every minute

[Timer]
OnBootSec=30s
OnUnitInactiveSec=1min
AccuracySec=5s
Persistent=true
Unit=${SERVICE_NAME}

[Install]
WantedBy=timers.target
TIMER

printf 'Installing %s and %s...\n' "${SERVICE_NAME}" "${TIMER_NAME}"
sudo install -o root -g root -m 0644 "${SERVICE_TMP}" "/etc/systemd/system/${SERVICE_NAME}"
sudo install -o root -g root -m 0644 "${TIMER_TMP}" "/etc/systemd/system/${TIMER_NAME}"
sudo systemctl daemon-reload
sudo systemctl enable --now "${TIMER_NAME}"

printf 'Running the first mailbox sync...\n'
if ! sudo systemctl start "${SERVICE_NAME}"; then
  printf '\nThe timer was installed, but the first sync failed. Recent logs:\n' >&2
  sudo journalctl -u "${SERVICE_NAME}" -n 50 --no-pager >&2
  exit 1
fi

printf '\nCoffeeHQ mailbox automation is active.\n'
sudo systemctl list-timers "${TIMER_NAME}" --no-pager
printf '\nRecent sync log:\n'
sudo journalctl -u "${SERVICE_NAME}" -n 20 --no-pager
