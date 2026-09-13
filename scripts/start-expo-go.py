#!/usr/bin/env python3
"""Run Expo Go on LAN in a PTY wide enough for the QR, auto-answer prompts."""
from __future__ import annotations

import fcntl
import os
import pty
import select
import signal
import struct
import sys
import termios
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

ROWS, COLS = 50, 120


def set_winsize(fd: int, pid: int) -> None:
    packed = struct.pack("HHHH", ROWS, COLS, 0, 0)
    fcntl.ioctl(fd, termios.TIOCSWINSZ, packed)
    try:
        os.kill(pid, signal.SIGWINCH)
    except OSError:
        pass


pid, master = pty.fork()
if pid == 0:
    os.environ["TERM"] = "xterm-256color"
    os.environ["COLUMNS"] = str(COLS)
    os.environ["LINES"] = str(ROWS)
    os.execvp(
        "npx",
        ["npx", "expo", "start", "--go", "--clear", "--port", "8081", "--lan"],
    )

set_winsize(master, pid)
last_answer = 0.0
sent_qr_key = False
try:
    stdin_fd = sys.stdin.fileno()
except Exception:
    stdin_fd = None

while True:
    readers = [master]
    if stdin_fd is not None:
        readers.append(stdin_fd)
    ready, _, _ = select.select(readers, [], [], 1.0)
    if master in ready:
        try:
            data = os.read(master, 8192)
        except OSError:
            break
        if not data:
            break
        sys.stdout.buffer.write(data)
        sys.stdout.flush()
        text = data.decode("utf-8", "replace")
        now = time.time()
        if now - last_answer > 0.8 and (
            "Proceed anonymously" in text or "unverified-app-expo-go" in text
        ):
            os.write(master, b"\x1b[B\n")
            last_answer = now
        elif now - last_answer > 0.8 and "Use port" in text:
            os.write(master, b"y\n")
            last_answer = now
        if not sent_qr_key and (
            "Starting Metro" in text or "Waiting on exp://" in text or "Logs for your project" in text
        ):
            sent_qr_key = True
            os.write(master, b"c")
    if stdin_fd is not None and stdin_fd in ready:
        typed = os.read(stdin_fd, 1024)
        if typed:
            os.write(master, typed)

_, status = os.waitpid(pid, 0)
sys.exit(os.WEXITSTATUS(status) if os.WIFEXITED(status) else 1)
