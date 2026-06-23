import type { ChatMessage } from './messages';

export type LiveMatchListeners = {
  onMessage: (message: ChatMessage) => void;
  onMessageUpdated: (message: ChatMessage) => void;
};

const matchListeners = new Map<string, Set<LiveMatchListeners>>();

export function subscribeToLiveMatch(
  matchId: string,
  listeners: LiveMatchListeners
): () => void {
  let set = matchListeners.get(matchId);
  if (!set) {
    set = new Set();
    matchListeners.set(matchId, set);
  }
  set.add(listeners);
  return () => {
    set!.delete(listeners);
    if (set!.size === 0) {
      matchListeners.delete(matchId);
    }
  };
}

export function publishLiveMessage(matchId: string, message: ChatMessage): void {
  matchListeners.get(matchId)?.forEach((listener) => listener.onMessage(message));
}

export function publishLiveMessageUpdated(matchId: string, message: ChatMessage): void {
  matchListeners.get(matchId)?.forEach((listener) => listener.onMessageUpdated(message));
}
