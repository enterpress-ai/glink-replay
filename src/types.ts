export type AgentId = "Architect-CEO" | "Architect-CTO" | "Architect-COO";

export type EventType =
  | "message"
  | "decision"
  | "artifact"
  | "comment"
  | "handoff"
  | "presence";

export interface ReplayEvent {
  id: string;
  type: EventType;
  timestamp: string;
  actor: AgentId;
  data: MessageData | DecisionData | ArtifactData | CommentData | HandoffData | PresenceData;
}

export interface MessageData {
  to: AgentId | null;
  body: string;
  urgent: boolean;
}

export interface DecisionData {
  title: string;
  hash: string;
}

export interface ArtifactData {
  filename: string;
  hash: string;
}

export interface CommentData {
  artifact: string;
  body: string;
}

export interface HandoffData {
  summary: string;
  inProgress: string[];
  nextSteps: string[];
}

export interface PresenceData {
  status: "online" | "offline";
}

export interface ReplayData {
  meta: {
    team: string;
    title: string;
    agents: { id: AgentId; role: string; color: string }[];
    startTime: string;
    endTime: string;
    totalEvents: number;
  };
  events: ReplayEvent[];
}
