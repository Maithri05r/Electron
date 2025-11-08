// shared/wire.ts
export type WireMessage =
  | { type: 'MSG';   id: string; text: string }
  | { type: 'ACK';   id: string }           // delivered
  | { type: 'READ';  ids: string[] };       // seen (batch OK)
