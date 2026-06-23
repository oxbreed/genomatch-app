let openMatchId: string | null = null;

export function setOpenChatMatchId(matchId: string | null): void {
  openMatchId = matchId;
}

export function getOpenChatMatchId(): string | null {
  return openMatchId;
}
