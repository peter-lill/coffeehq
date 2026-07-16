#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME="coffeehq-mail-sync.service"
TIMER_NAME="coffeehq-mail-sync.timer"

printf '%s\n' '--- Timer ---'
systemctl status "${TIMER_NAME}" --no-pager || true
printf '\n%s\n' '--- Next scheduled run ---'
systemctl list-timers "${TIMER_NAME}" --no-pager || true
printf '\n%s\n' '--- Recent mailbox sync log ---'
sudo journalctl -u "${SERVICE_NAME}" -n 50 --no-pager
