# SingHacks prep scratch space

This folder contains shallow, read-first clones of relevant open-source
repositories. The main research deliverable is
../SingHacks-2026-Agentic-AI-Prep-Dossier.md.

The [UI playbook](../SingHacks-2026-UI-Strategy.md) contains the design,
agent-prompt, and visual-QA workflow for building the final demo surface.

The active idea shortlist is intentionally limited to ClaimReady and Agent
Spend Guard. The other concepts have been removed from the active planning
material so preparation stays focused.

## Local repos

- repos/xrpl-up — local XRPL sandbox, CLI, and Claude Code skill
- repos/xrpl-mpp-sdk — XRPL machine-payment SDK and Claude agent template
- repos/x402 — x402 protocol v2, SDKs, specs, and transports
- repos/x402-secure — t54 risk/evidence layer for x402
- repos/agent-commons — coordination plane for coding agents
- repos/deepagents — planning, context, subagents, skills, and HITL
- repos/agent-sdk-workshop — tools, subagents, memory, and hooks tutorial
- repos/hedera-agent-kit-js — Hedera Agent Kit, adapters, policies, and MCP
- repos/hedera-skills — Hedera development and hackathon skills

## Suggested reading order

1. agent-sdk-workshop/01-guided-demo/GUIDE.md
2. x402/specs/x402-specification-v2.md
3. xrpl-mpp-sdk/examples/agent-template/README.md
4. xrpl-up/skills/xrpl-up/SKILL.md
5. x402-secure/docs/QUICKSTART.md
6. deepagents/openwiki/concepts/subagents-skills.md
7. agent-commons/docs/getting-started.md
8. hedera-agent-kit-js/docs/HOOKS_AND_POLICIES.md

Do not install every repository as a dependency. Pick one runtime, one
orchestration style, and the sponsor integration that the revealed brief
actually requires.
