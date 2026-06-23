/** Dev-only logging — never emits PII in production builds. */
export function devLog(label: string, payload?: Record<string, unknown>): void {
  if (__DEV__) {
    console.log(label, payload ?? {});
  }
}

export function devWarn(label: string, payload?: unknown): void {
  if (__DEV__) {
    console.warn(label, payload ?? '');
  }
}

export function devError(label: string, payload?: unknown): void {
  if (__DEV__) {
    console.error(label, payload ?? '');
  }
}
