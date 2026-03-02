import { writeFileSync, mkdirSync } from "fs";
import { execSync } from "child_process";
import { resolve, dirname } from "path";
import type { ReplayEvent, ReplayData, AgentId } from "../src/types.js";

const SUPABASE_URL = "http://127.0.0.1:54321";
const SUPABASE_KEY = "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH";
const TEAM = "the-architects";
const CHANNEL_REPO = resolve(import.meta.dirname, "../../channel");
const OUTPUT = resolve(import.meta.dirname, "../src/data/replay-data.json");

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
};

async function fetchTable(table: string, params: string = ""): Promise<unknown[]> {
  const url = `${SUPABASE_URL}/rest/v1/${table}?team=eq.${TEAM}&order=created_at.asc${params}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Failed to fetch ${table}: ${res.statusText}`);
  return res.json() as Promise<unknown[]>;
}

function getGitEvents(): ReplayEvent[] {
  const log = execSync(
    'git log --format="%h|||%s|||%aI" --reverse',
    { cwd: CHANNEL_REPO, encoding: "utf-8" }
  );

  const events: ReplayEvent[] = [];

  for (const line of log.trim().split("\n")) {
    const parts = line.split("|||");
    if (parts.length < 3) continue;
    const [hash, subject, date] = parts;

    if (subject.startsWith("decision:")) {
      events.push({
        id: `git-${hash}`,
        type: "decision",
        timestamp: date,
        actor: "Architect-CEO" as AgentId,
        data: { title: subject.replace("decision: ", ""), hash },
      });
    } else if (subject.startsWith("workspace: create")) {
      const filename = subject.replace("workspace: create ", "");
      events.push({
        id: `git-${hash}`,
        type: "artifact",
        timestamp: date,
        actor: "Architect-CEO" as AgentId,
        data: { filename, hash },
      });
    }
  }

  return events;
}

async function main() {
  console.log("Exporting GLink replay data...");

  const [notifications, comments, handoffs, participants] = await Promise.all([
    fetchTable("notifications"),
    fetchTable("comments"),
    fetchTable("handoff_summaries"),
    fetchTable("participants"),
  ]);

  const events: ReplayEvent[] = [];

  for (const n of notifications as Record<string, unknown>[]) {
    events.push({
      id: n.id as string,
      type: "message",
      timestamp: n.created_at as string,
      actor: n.from_participant as AgentId,
      data: {
        to: (n.to_participant as AgentId) ?? null,
        body: n.message as string,
        urgent: n.urgent as boolean,
      },
    });
  }

  for (const c of comments as Record<string, unknown>[]) {
    events.push({
      id: c.id as string,
      type: "comment",
      timestamp: c.created_at as string,
      actor: c.participant as AgentId,
      data: {
        artifact: c.artifact as string,
        body: c.body as string,
      },
    });
  }

  for (const h of handoffs as Record<string, unknown>[]) {
    events.push({
      id: h.id as string,
      type: "handoff",
      timestamp: h.created_at as string,
      actor: h.participant as AgentId,
      data: {
        summary: h.summary as string,
        inProgress: (h.in_progress as string[]) ?? [],
        nextSteps: (h.next_steps as string[]) ?? [],
      },
    });
  }

  events.push(...getGitEvents());

  for (const p of participants as Record<string, unknown>[]) {
    events.push({
      id: `presence-${p.id}`,
      type: "presence",
      timestamp: p.created_at as string,
      actor: p.name as AgentId,
      data: { status: "online" },
    });
  }

  events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const replayData: ReplayData = {
    meta: {
      team: TEAM,
      title: "The Architects",
      agents: [
        { id: "Architect-CEO", role: "CEO", color: "ceo" },
        { id: "Architect-CTO", role: "CTO", color: "cto" },
        { id: "Architect-COO", role: "COO", color: "coo" },
      ],
      startTime: events[0]?.timestamp ?? "",
      endTime: events[events.length - 1]?.timestamp ?? "",
      totalEvents: events.length,
    },
    events,
  };

  mkdirSync(dirname(OUTPUT), { recursive: true });
  writeFileSync(OUTPUT, JSON.stringify(replayData, null, 2));
  console.log(`Exported ${events.length} events to ${OUTPUT}`);
  console.log(`  Messages: ${notifications.length}`);
  console.log(`  Comments: ${comments.length}`);
  console.log(`  Handoffs: ${handoffs.length}`);
  console.log(`  Git events: ${events.filter((e) => e.id.startsWith("git-")).length}`);
  console.log(`  Time span: ${replayData.meta.startTime} → ${replayData.meta.endTime}`);
}

main().catch(console.error);
