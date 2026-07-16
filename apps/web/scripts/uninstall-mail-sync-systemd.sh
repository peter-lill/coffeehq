#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME="coffeehq-mail-sync.service"
TIMER_NAME="coffeehq-mail-sync.timer"

sudo systemctl disable --now "${TIMER_NAME}" 2>/dev/null || true
sudo systemctl stop "${SERVICE_NAME}" 2>/dev/null || true
sudo rm -f "/etc/systemd/system/${SERVICE_NAME}" "/etc/systemd/system/${TIMER_NAME}"
sudo systemctl daemon-reload
sudo systemctl reset-failed

printf 'CoffeeHQ mailbox automation has been removed.\n'
