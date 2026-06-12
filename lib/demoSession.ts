import { SAMPLE_STUDIES } from "@/lib/sampleStudies";
import type { InterviewSession } from "@/lib/types";

const study = SAMPLE_STUDIES[1];
const at = "2026-01-05T18:30:00.000Z";

/**
 * A fixed, fully scripted session used by the /demo/* routes so the landing
 * page can embed the real app screens with believable data. The last message
 * is a researcher question so the interview room never auto-plays audio.
 */
export const DEMO_SESSION: InterviewSession = {
  id: "demo-session",
  persona: { ...study.persona, id: "demo-persona", createdAt: at },
  researchContext: study.context,
  messages: [
    {
      id: "demo-m1",
      role: "researcher",
      text: "Tell me about how dinner came together at your place last night.",
      createdAt: at,
    },
    {
      id: "demo-m2",
      role: "participant",
      text: "It was one of those whatever gets everyone fed evenings. I got home late, checked the fridge list, and improvised pasta so nobody had to do a second grocery run.",
      createdAt: at,
    },
    {
      id: "demo-m3",
      role: "researcher",
      text: "Walk me through the last time you ordered groceries online instead of going to the store.",
      createdAt: at,
    },
    {
      id: "demo-m4",
      role: "participant",
      text: "Two Wednesdays ago. The week had collapsed, both kids had practice, and I ordered the usual fifteen items from the couch at 9pm. Half relief, half guilt about the fees.",
      createdAt: at,
    },
    {
      id: "demo-m5",
      role: "researcher",
      text: "What happened the last time a delivery substituted an item you cared about?",
      createdAt: at,
    },
  ],
  status: "active",
  createdAt: at,
};
