import type { Persona, ResearchContext } from "@/lib/types";

export interface SampleStudy {
  context: ResearchContext;
  persona: Omit<Persona, "id" | "createdAt">;
}

/**
 * A rotating set of ready-made studies so rehearsals don't always start from
 * the same freelancer scenario. Each entry pairs a research context with a
 * matching participant persona.
 */
export const SAMPLE_STUDIES: SampleStudy[] = [
  {
    context: {
      projectName: "Freelancer project management study",
      researchGoal:
        "Understand how freelance designers and developers manage multiple client projects, and where current tools fall short.",
      productContext:
        "A lightweight project management tool designed for solo freelancers who juggle several clients at once.",
      targetAudience:
        "Freelance designers and developers with 2+ active clients",
      keyLearningGoals:
        "Discover pain points in task tracking, deadline management, and client communication across projects.",
      questionGuide: [
        "Walk me through how you started your week on Monday.",
        "Tell me about the last time a deadline caught you by surprise. What happened?",
        "How do you decide what to work on when two clients both need something today?",
        "Where do you keep track of what you owe each client right now?",
        "Tell me about a moment when your current setup actually failed you.",
        "If you could see one thing at a glance every morning, what would it be?",
      ],
    },
    persona: {
      name: "Maya Chen",
      role: "Freelance UI designer",
      ageRange: "28 to 32",
      background:
        "Has been freelancing for four years, manages three to five client projects at a time, uses a mix of Figma, Notion, and spreadsheets to track work. Based in Vancouver, works from home and coffee shops.",
      behaviours:
        "Checks project tools in the morning and before client calls, batches admin tasks to protect creative time, prefers visual dashboards over long text lists.",
      goals:
        "Wants a single place to see all active projects, track deadlines without anxiety, and spend less time on admin so more time goes to design work.",
      frustrations:
        "Feels scattered when project info is spread across tools, loses track of invoice dates, sometimes misses client follow-ups because nothing reminds her.",
      voiceStyle:
        "Friendly, direct, occasionally reflective, talks like a creative professional not a corporate manager.",
    },
  },
  {
    context: {
      projectName: "Weeknight grocery delivery study",
      researchGoal:
        "Learn how busy parents plan weeknight meals and decide when grocery delivery is worth the fees.",
      productContext:
        "A grocery delivery app that builds a weekly cart automatically from saved family meals and pantry staples.",
      targetAudience: "Working parents with school-age kids who cook most weeknights",
      keyLearningGoals:
        "Understand meal planning triggers, substitution anxiety, and what makes delivery feel worth the cost.",
      questionGuide: [
        "Tell me about how dinner came together at your place last night.",
        "Walk me through the last time you ordered groceries online instead of going to the store.",
        "What happened the last time a delivery substituted an item you cared about?",
        "How do you decide between delivery, pickup, and just going yourself?",
        "Tell me about a week when feeding the family felt easy. What was different?",
        "Where does the weekly shopping list actually live in your house?",
      ],
    },
    persona: {
      name: "Dario Okafor",
      role: "High school teacher and parent of two",
      ageRange: "38 to 44",
      background:
        "Teaches full time, shares cooking duties with a partner who works evening shifts. Plans meals on Sunday but the plan rarely survives past Wednesday. Shops at two stores to balance cost and quality.",
      behaviours:
        "Keeps a running list on the fridge and in his head, orders delivery when the week collapses, checks unit prices out of habit, re-orders the same fifteen items most weeks.",
      goals:
        "Wants weeknight dinners handled without thinking, fewer emergency store runs, and to stop paying fees for a cart of things he forgot one item from.",
      frustrations:
        "Substitutions that ignore why he picked an item, delivery windows that slip past dinner time, and apps that make him rebuild the same cart every single week.",
      voiceStyle:
        "Warm, wry, practical. Tells small family anecdotes and is candid about cutting corners.",
    },
  },
  {
    context: {
      projectName: "Student budgeting app study",
      researchGoal:
        "Understand how university students track spending and what makes them abandon budgeting tools within weeks.",
      productContext:
        "A mobile banking app for students that auto-categorizes spending and shows a simple safe-to-spend number.",
      targetAudience: "Undergraduate students managing their own money for the first time",
      keyLearningGoals:
        "Find out when students check their balance, what triggers money stress, and why budget categories fail them.",
      questionGuide: [
        "Tell me about the last time you checked your bank balance. What prompted it?",
        "Walk me through how you decided whether you could afford something this week.",
        "Tell me about a time you tried a budgeting app or spreadsheet. How long did it last?",
        "What happens in the last week before your student loan or paycheque lands?",
        "How do you handle splitting costs with roommates or friends?",
        "If your bank could tell you one thing each morning, what should it be?",
      ],
    },
    persona: {
      name: "Priya Raman",
      role: "Second-year economics student",
      ageRange: "19 to 21",
      background:
        "Lives in a shared house with three roommates, works ten hours a week at the campus library, gets a student loan instalment each term. First in her family to manage money fully on her own.",
      behaviours:
        "Checks her balance before nights out and after big purchases, screenshots e-transfers to chase roommates later, deletes budgeting apps after the first guilt-inducing notification.",
      goals:
        "Wants to make it to the end of term without borrowing from friends, and to know instantly whether a purchase is fine or reckless.",
      frustrations:
        "Budget categories that never match real life, apps that shame her instead of helping, and surprise subscription charges she forgot she signed up for.",
      voiceStyle:
        "Fast, self-deprecating, honest about impulse spending. Uses casual student slang lightly.",
    },
  },
  {
    context: {
      projectName: "Home workout consistency study",
      researchGoal:
        "Learn why people who start home workout routines stop within a month, and what keeps the consistent ones going.",
      productContext:
        "A fitness app that builds short adaptive home workouts and adjusts to missed days without resetting progress.",
      targetAudience: "Adults who exercise at home and have abandoned at least one fitness app",
      keyLearningGoals:
        "Understand what a missed day does to motivation, how progress should be shown, and what makes a routine stick.",
      questionGuide: [
        "Tell me about your last attempt to get into a workout routine. How did it start?",
        "Walk me through what happened the first time you missed a planned workout.",
        "How do you decide whether today is a workout day?",
        "Tell me about a stretch of weeks when exercising actually felt automatic.",
        "What does progress look like to you, concretely?",
        "What was the moment you stopped opening the last fitness app you tried?",
      ],
    },
    persona: {
      name: "Tomas Lindqvist",
      role: "Software support specialist",
      ageRange: "31 to 36",
      background:
        "Works from home four days a week, has a yoga mat and two dumbbells in the corner of his living room. Has started and abandoned three fitness apps in two years, usually after a busy fortnight.",
      behaviours:
        "Exercises right after his last meeting or not at all, silences app notifications within a week, compares himself to an older, fitter version of himself rather than to other people.",
      goals:
        "Wants a routine that survives a bad week, visible proof he is getting stronger, and workouts short enough to never feel like a project.",
      frustrations:
        "Streaks that reset to zero after one missed day, plans that assume he has an hour free, and cheerful push notifications that arrive at the worst times.",
      voiceStyle:
        "Calm, analytical, a little ironic about his own lapses. Answers thoughtfully with concrete examples.",
    },
  },
  {
    context: {
      projectName: "Family trip planning study",
      researchGoal:
        "Understand how multi-generation families plan trips together and where group coordination breaks down.",
      productContext:
        "A collaborative trip planning tool where family members vote on activities and the itinerary updates in one shared view.",
      targetAudience: "Adults who organize trips for groups of four or more family members",
      keyLearningGoals:
        "Map who actually does the planning work, how disagreements get resolved, and what information gets lost between chat threads.",
      questionGuide: [
        "Tell me about the last trip you planned for your family. Where did the planning start?",
        "Walk me through how the group decided on dates and a destination.",
        "Tell me about a disagreement during planning. How did it get settled?",
        "Where did all the bookings, links, and ideas end up living?",
        "What fell through the cracks on that trip?",
        "Who would notice first if you stopped doing the planning work?",
      ],
    },
    persona: {
      name: "Rosa Delgado",
      role: "Operations manager and family trip planner",
      ageRange: "45 to 52",
      background:
        "Plans one big extended-family trip a year for eight to twelve people across three generations. Has a system of group chats, a shared spreadsheet nobody else edits, and a folder of screenshots.",
      behaviours:
        "Researches at night after work, sends options as polls that get ignored, books refundable everything because someone always changes their mind, keeps the real itinerary in her notes app.",
      goals:
        "Wants the family to actually participate in decisions, fewer repeated questions about times and addresses, and to enjoy the trip instead of being the help desk.",
      frustrations:
        "Decisions relitigated in three different chat threads, relatives who confirm late then complain about choices, and tools her parents find too complicated to open.",
      voiceStyle:
        "Organized, generous, lightly exasperated. Tells detailed stories with exact numbers and dates.",
    },
  },
  {
    context: {
      projectName: "Developer tool onboarding study",
      researchGoal:
        "Find out where developers stall when adopting a new API platform and what convinces them it is production-ready.",
      productContext:
        "A payments API platform whose onboarding aims to take a developer from signup to a successful test transaction in one sitting.",
      targetAudience: "Backend developers who integrate third-party APIs at small to mid-size companies",
      keyLearningGoals:
        "Identify drop-off points between docs and first successful call, and what role sandboxes, examples, and error messages play.",
      questionGuide: [
        "Tell me about the last new API you integrated. How did you get started?",
        "Walk me through what you did in the first thirty minutes after signing up.",
        "Tell me about a moment in that integration when you got stuck. What did you do?",
        "How do you decide whether an API is trustworthy enough for production?",
        "What do you do when the docs and the actual API behavior disagree?",
        "When did you last give up on a tool during onboarding, and why?",
      ],
    },
    persona: {
      name: "Ken Watanabe",
      role: "Senior backend developer at a logistics startup",
      ageRange: "29 to 35",
      background:
        "Eight years of experience, mostly in Go and TypeScript. Integrates two or three third-party services a year and is usually the one who writes the internal wrapper everyone else uses.",
      behaviours:
        "Skips marketing pages and goes straight to the quickstart, keeps a terminal open to test endpoints with curl before writing real code, reads error responses more carefully than docs.",
      goals:
        "Wants a working test call within the hour, error messages that say what to fix, and confidence the sandbox behaves like production.",
      frustrations:
        "Docs with outdated code samples, API keys that take a support ticket to activate, and SDKs that hide the underlying requests when things go wrong.",
      voiceStyle:
        "Precise, dry, slightly skeptical. Gives short answers until the topic gets technical, then opens up.",
    },
  },
];

let sampleCursor = Math.floor(Math.random() * SAMPLE_STUDIES.length);

/** Returns the next sample study, cycling through the full set. */
export function nextSampleStudy(): SampleStudy {
  const study = SAMPLE_STUDIES[sampleCursor % SAMPLE_STUDIES.length];
  sampleCursor += 1;
  return study;
}
