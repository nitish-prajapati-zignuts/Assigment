import { Meeting } from "@/types/meeting";

export const initialMeetings: Meeting[] = [
  {
    id: "1",
    title: "Q3 Product Roadmap Review",
    date: "2026-08-10",
    type: "Project Meeting",
    participants: ["alex@company.com", "sarah@company.com", "nitish@zignuts.com"],
    transcript:
      "Discussed feature priorities for Q3. Key focus items include authentication overhaul, performance optimizations, and automated meeting summarization. Sarah will handle frontend design components.",
    summary: {
      purpose: "Define and align Q3 product features, engineering deliverables, and UI goals.",
      discussionPoints: [
        "Authentication overhaul with JWT tokens & middleware protection",
        "Frontend component optimization and meeting details modal redesign",
        "Automated AI meeting summarization pipeline integration",
      ],
      majorOutcomes: [
        "Finalized Q3 roadmap scope and prioritized AI meeting summary integration.",
        "Sarah assigned to lead frontend UI component implementation.",
      ],
      importantConcerns: [
        "Ensure API keys are securely managed during client-side summary generation.",
      ],
      nextSteps: [
        "Deploy backend Drizzle ORM schema update to Neon DB.",
        "Integrate Vercel AI SDK summary endpoint into meeting detail modal.",
      ],
      keyDecisions: [
        {
          category: "Technology/Platform",
          decision: "Adopt Vercel AI SDK (@ai-sdk/google) for structured meeting note generation.",
          context: "Provides strict type-safe Zod schema outputs.",
        },
        {
          category: "Responsibility Assigned",
          decision: "Sarah assigned to lead frontend design and detail modal components.",
          context: "Assigned during Q3 sprint planning.",
        },
        {
          category: "Timeline Agreed",
          decision: "Deliver initial prototype demo by mid-month sprint deadline.",
        },
      ],
      actionItems: [
        {
          task: "Build frontend meeting detail modal with AI summary tab.",
          owner: "Sarah",
          dueDate: "2026-08-12",
          priority: "High",
          status: "In Progress",
        },
        {
          task: "Implement Drizzle ORM database schema and ActionItem types.",
          owner: "Alex",
          dueDate: "2026-08-10",
          priority: "High",
          status: "Completed",
        },
        {
          task: "Configure environment API keys and rate limit checks.",
          owner: "Unassigned",
          dueDate: "Not specified",
          priority: "Medium",
          status: "Pending",
        },
      ],
    },
    createdAt: "2026-08-01",
    updatedAt: "2026-08-01",
  },
  {
    id: "2",
    title: "Client Onboarding - Acme Corp",
    date: "2026-08-07",
    type: "Client Meeting",
    participants: ["john@acme.com", "nitish@zignuts.com"],
    transcript:
      "Reviewed workspace configuration and custom integration requirements for Acme Corp. Next step is to issue API keys and setup webhook endpoints.",
    summary: {
      purpose: "Onboard Acme Corp team and configure workspace integrations.",
      discussionPoints: [
        "Acme Corp workspace setup and security requirements",
        "API access key provisioning and webhook payload structure",
      ],
      majorOutcomes: [
        "Agreed on API key delivery timeline by end of week.",
      ],
      importantConcerns: [
        "Ensure webhooks comply with Acme Corp rate limiting policy.",
      ],
      nextSteps: [
        "Generate and securely send API credentials to John.",
        "Set up webhook test endpoints in staging environment.",
      ],
      keyDecisions: [
        {
          category: "Scope Change",
          decision: "Approved custom webhook payload integration for Acme Corp security portal.",
        },
      ],
      actionItems: [
        {
          task: "Generate API credentials for John.",
          owner: "Nitish",
          dueDate: "2026-08-08",
          priority: "High",
          status: "Pending",
        },
        {
          task: "Setup webhook test endpoints in staging environment.",
          owner: "Unassigned",
          dueDate: "Not specified",
          priority: "Medium",
          status: "Pending",
        },
      ],
    },
    createdAt: "2026-08-02",
    updatedAt: "2026-08-03",
  },
  {
    id: "3",
    title: "Sprint 42 Retrospective",
    date: "2026-08-04",
    type: "Retrospective",
    participants: ["dev-team@zignuts.com", "nitish@zignuts.com"],
    transcript:
      "What went well: PR review response time improved. What could improve: Test coverage for async handlers. Action item: Implement CI workflow checks for coverage threshold.",
    summary: {
      purpose: "Evaluate Sprint 42 engineering performance and process improvements.",
      discussionPoints: [
        "Faster pull request turnaround times across development team",
        "Identifying gaps in async handler test coverage",
      ],
      majorOutcomes: [
        "Commended dev team for faster PR code reviews.",
      ],
      importantConcerns: [
        "Async error handling bugs slipping into release builds due to insufficient unit tests.",
      ],
      nextSteps: [
        "Add automated test coverage checks in GitHub CI workflow.",
        "Write unit tests for core backend meeting controllers.",
      ],
      keyDecisions: [],
      actionItems: [
        {
          task: "Implement CI workflow checks for coverage threshold.",
          owner: "Dev Team",
          dueDate: "Next Sprint",
          priority: "Medium",
          status: "Pending",
        },
      ],
    },
    createdAt: "2026-08-04",
    updatedAt: "2026-08-04",
  },
];
