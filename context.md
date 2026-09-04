# SingHacks 2026 — Ripple Track Context

**Audience:** a cloud agent helping theFastandtheFungible make product,
technical, UX, and pitch decisions.

**Scope:** the active Ripple/XRPL agentic-payments challenge only. This is a
neutral decision framework, not a proposed product idea. Use it to generate
and assess concepts; do not treat any particular domain or solution as chosen.

**Evidence base:** the complete `tftf/reference/` set, the active Ripple
challenge repository, and its resource guide. Reference materials were read on
4 September 2026 (Singapore time), with sponsor pages, interactive demos,
public repositories, and current product documentation rechecked on 5
September 2026. Verify live network status, SDK behaviour, amendments, fees,
and testnet availability before claiming them in a build.

---

## 1. The challenge in one sentence

Design an **AI-native product or service** for a **real customer problem** in
which an agent can independently discover, decide, transact, and deliver a
useful outcome; use XRPL for the qualifying blockchain activity and prove the
entire commercial loop.

```text
customer need
  -> agent understands objective and constraints
  -> agent discovers / compares options
  -> agent makes a bounded economic decision
  -> payment settles on XRPL
  -> customer receives tangible value
  -> decision and outcome can be inspected
```

The desired leap is from “an agent sends a transaction” to “a business works
meaningfully better because an agent can purchase and act within delegated
authority.”

---

## 2. What the judges and Ripple are actually asking for

### The core problem to solve

The agentic-payments ecosystem has progressed from ideation toward
specifications, SDKs, partnerships, and research. Ripple's challenge signal is
that the missing layer is **credible real-world use cases**, not another
protocol demo. Start from a real pain point, buyer, seller/provider, and
commercial exchange. Do not invent a problem merely to justify a payment.

### Non-negotiable build requirements

- Use the **XRP Ledger (XRPL)** for all qualifying on-chain/blockchain logic.
- Demonstrate at least **one successful XRPL transaction** on Mainnet, Testnet,
  or Devnet. Default to Testnet for a hackathon prototype.
- The XRPL EVM sidechain and all non-XRPL chains do **not** qualify for this
  challenge.
- Produce a working AI-agent-powered prototype, public source repository, setup
  instructions, architecture, and XRPL transaction hash or explorer reference.
- Demonstrate the customer journey, the agentic transaction flow, and the value
  delivered after payment.

### Recommended tools, not hard requirements

- XRPL AI Starter Kit.
- x402, MPP, or another agentic-payment standard.
- XRPL SDKs, wallets, RLUSD developer tooling, `xrpl-up`, and the provided
  XRPL agent-resource skill.

The event slides call XRPL AI Starter Kit, x402, and MPP the intended build
path. The active challenge README clarifies that only XRPL and a successful
XRPL transaction are mandatory. The strongest solution uses recommended tools
where they make the commercial loop more legible; it does not force every tool
into the architecture.

### Scoring priorities

| Criterion | Weight | Decision implication |
| --- | ---: | --- |
| Reachability | 20% | Show a path to broad use, interoperability, developer accessibility, scalability, and compliance readiness. |
| Creativity | 20% | Make the agent/payment capability central to a new or materially better workflow/business model. |
| Feasibility | 20% | Be honest about cost, operational reality, reliability, security and production constraints. |
| Technical depth | 20% | Use XRPL and agent/payment integrations well; demonstrate safeguards, autonomy, testing and sound architecture. |
| UX and design | 10% | Make the end-to-end journey and agent behaviour clear and usable. |
| Builder feedback | 10% | Give concrete feedback on the XRPL developer experience. |

---

## 3. The pattern every viable concept must satisfy

Use this as an idea filter. If a proposal fails a link in the chain, it is not
yet a Ripple-track solution.

| Link | Required answer |
| --- | --- |
| Real need | Who has a painful, recurring, specific job to do? Why does it matter now? |
| Principal and authority | Who delegates the agent? What task, budget, duration, counterparties and exceptions are permitted? |
| Discovery | What providers, products, data, APIs, counterparties, or resources can the agent actually compare? |
| Decision | What meaningful economic choice does the agent make from evidence and constraints—not just a preset button click? |
| Payment | What exactly is paid for? Who receives it? Why must payment happen at this point? |
| XRPL role | What settlement, token, identity, credential, exchange, escrow/check, or receipt property materially improves the workflow? |
| Delivery | What useful product, service, access, result, or action does the customer receive after payment? |
| Accountability | How can a user or reviewer see what happened, why it was allowed, and what outcome was received? |

The concept should become substantially weaker if either the agent or the
payment is removed. That is the practical test for AI-native commerce.

---

## 4. The ethos: useful autonomy with accountability

The reference materials consistently argue for autonomy that is fast enough to
be valuable but bounded enough to be trusted. Agentic payment is not a licence
for unrestricted wallet access.

### Division of responsibility

| The model/agent can | The deterministic control layer must |
| --- | --- |
| Understand objectives; retrieve, compare and summarize options; recommend or choose within policy | Validate inputs and mandate version; enforce money, permissions, budget, payee/endpoint, expiry, idempotency and approval rules |
| Explain a trade-off and identify missing evidence | Produce allow/review/deny outcome; preserve an inspectable event/evidence record |
| Request an authorised action | Reconcile settlement and fulfilment; handle retries, exceptions and reversals safely |

### Five trust properties

The supplied presentation uses these as the trust model for consequential
agentic systems. A strong solution expresses them in the product, not merely a
slide:

1. **Attributable:** a consequential decision is connected to an authorised
   actor, agent/model version, source and basis.
2. **Detectable:** drift, substitution, expired authority, changed terms or
   unexpected delivery becomes visible by design.
3. **Bounded:** authority and potential loss are finite: task, amount,
   counterparty, time and permitted action are constrained.
4. **No single trust root:** the model may be useful, but it is not the only
   thing the system believes; policy, verified inputs and payment checks remain
   independent control points.
5. **Demonstrable:** the decision can be reconstructed from mandate, inputs,
   evidence, policy, action, outcome and human override where applicable.

### Essential questions for every decision

- Who may bind whom, for what, and until when?
- What evidence did the agent rely on, and which model/version acted?
- What exact condition permits payment? What condition blocks it?
- How does the system prevent over-spend, payee substitution, replay, or a
  changed request?
- What does the customer receive after payment, and how is that verified?
- Can the system distinguish a payment success from a fulfilled transaction?
- What will be visible to a reviewer 18 months later without exposing private
  reasoning, customer data, or secrets?

---

## 5. Ripple, XRPL, and the relevant implementation palette

### Names and roles

- **Ripple** provides digital-asset infrastructure for institutions and is a
  major contributor/stakeholder in the XRPL ecosystem.
- **XRPL (XRP Ledger)** is the open-source, public Layer 1 ledger used for the
  challenge's required on-chain work.
- **XRP** is the ledger's native asset.
- **RLUSD** is a Ripple USD stablecoin that may suit a stable unit of account
  when it makes the customer's payment experience clearer. Do not force it
  into the product; ask Ripple/t54 about its intended use and live setup.

### Why XRPL fits agentic commerce

The materials frame XRPL as fast, low-cost, decentralized, transparent and
open source, with no mining requirement. Its value is not “blockchain for
blockchain's sake”; it is an observable settlement and financial-action layer
for an agent workflow.

XRPL offers one API surface and SDKs across JavaScript, Python, Java, Rust and
others. Useful native primitives include:

- payments and fungible tokens;
- DEX and AMM facilities for payments/FX where genuinely needed;
- NFTs where a real asset/entitlement model benefits from them;
- escrow and checks where their documented conditions fit;
- DIDs and credentials as possible trust/attestation components.

Choose the smallest set of primitives that makes the business flow more
credible. XRPL's built-in functionality means the team should not build a smart
contract merely because a blockchain is involved.

### Important implementation boundaries

- A transaction hash proves a ledger event, not that a service was correctly
  delivered, a merchant was legitimate, or a decision was appropriate.
- Do not store sensitive customer data, detailed business context, credentials,
  secrets, or model reasoning in public transaction metadata. Store protected
  evidence off-chain; use only an opaque correlation/reference if needed.
- Use a policy-aware signer or approval service. Wallet balance is not a
  sufficient delegation model.
- Do not claim a feature is live on a network without checking current
  amendment and fee/reserve status.
- Treat Testnet/Devnet and facilitators as prototype infrastructure, not a
  substitute for a production operating model.
- Avoid irreversible mainnet transactions in a hackathon demo.

---

## 6. Agentic-payment ecosystem and t54.ai

### Market context

The slides name OpenAI's Agentic Commerce Protocol (ACP), Google's Agent
Payments Protocol (AP2), x402, MPP, Agent2Agent, Universal Commerce Protocol,
OpenWallet Standard, and Mastercard's Verifiable Intent. Treat these as signals
of a rapidly forming standards landscape, not a checklist. The brief is asking
for an elegant use case that gives the standards purpose.

The key trust signal from this landscape: when an AI buys for a principal,
intent and delegated authority must be legible to the merchant and payment
participants.

### x402

x402 is an HTTP-native payment pattern suitable for machine-to-machine service
access:

```text
agent requests protected resource
  -> service returns 402 with payment requirements
  -> agent/policy evaluates exact terms
  -> permitted payment is signed and submitted
  -> request retries with payment evidence
  -> facilitator verifies/settles
  -> paid response / value is returned
```

x402 is valuable when payment needs to occur as part of a request for a paid
API, data source, digital service, resource, or agent-to-agent capability. It
does not itself manage spending limits, prove identity/quality, resolve a
dispute, or guarantee fulfilment. The product must supply those controls.

### MPP

MPP is another recommended machine-payment standard in the challenge context.
Use it when its interaction model improves the chosen service exchange; do not
add it alongside x402 simply to increase the acronym count.

### t54.ai

t54 is independent agent-payment/risk infrastructure and a Ripple strategic
portfolio company. The local materials position its **Trustline** product as a
pre-execution underwriting layer for agent-mediated financial actions. The
useful product lesson is a clear allow/review/deny posture before an action
binds, with supporting audit context.

t54's relevant tooling includes:

- an XRPL x402 facilitator, including a public testnet route;
- x402-secure tooling for risk-session and trace/evidence controls around x402;
- RLUSD tooling and agent-payment resources.

Borrow the control/evidence pattern where it fits. Do not assume t54, x402, or
an XRPL transaction alone solves governance, merchant quality, legal rights,
or delivery verification.

### 2026-09-05 sponsor-research addendum

The detailed evidence, source links, interactive-demo observations, and
product synthesis are in
[company-research-context.md](company-research-context.md). The current
working hypothesis is **Agent Spend Guard**: a deterministic policy and
evidence boundary between an agent's discovery/reasoning and an XRPL signer.

The addendum changes the implementation emphasis in four ways:

- Treat t54 Trustline as a pre-execution risk/evidence provider with an async
  assessment contract, public-safe reason codes, Agentic Challenge, and
  hash-chained audit evidence. Its documented production access requires KYB
  and explicit enablement, so the MVP needs a local deterministic provider
  with a Trustline-shaped adapter seam.
- Treat x402 as the service-exchange layer and bind the exact invoice,
  amount, asset/issuer, network, payee, expiry, and resource before signing.
  Pin one facilitator/header version; the current XRPL x402 documentation and
  some x402-secure artifacts describe different header generations.
- Treat ARS as design research: separate fee/service settlement from
  fulfilment and from higher-risk principal/credit movement. Do not claim a
  full ARS implementation or add an EVM escrow path to an XRPL-only judged
  transaction.
- Treat ClawCredit and Unlimit as optional expansion paths. ClawCredit is
  credit-backed x402 access with documented manual repayment and a custodial
  agent experience. Unlimit is a BaaS/fiat/card/payout rail with sandbox and
  onboarding requirements. Neither should be a dependency for the first
  reliable XRPL Testnet demo.

For the live story, show a hard over-budget block with no signed transaction,
an in-budget new-payee/evidence approval or challenge, one validated XRPL
Testnet payment, a verified digital deliverable, and a receipt. Keep the
receipt public-safe: use an opaque correlation reference in SourceTag/Memo and
keep raw reasoning, personal data, and secrets off-ledger.

---

## 7. A deliberately elegant product standard

Elegance here means a small number of parts that each earn their place. A
solution should feel inevitable: the customer problem naturally requires the
agent's decision; the decision naturally triggers a bounded payment; the
payment naturally unlocks the outcome; and the receipt makes the result
trustworthy.

### Prefer

- One sharply defined user, job, provider, and commercial exchange.
- One memorable end-to-end journey rather than a broad marketplace or generic
  multi-page platform.
- A single decisive agent choice with clear criteria and an obvious alternative
  it rejects.
- A bounded payment mandate that is understandable in one sentence.
- One real XRPL transaction and one visible delivered outcome.
- A compact decision/payment/fulfilment receipt that explains the value.
- One clear exception or blocked state that proves safety is real.
- Plain-language product copy; explain blockchain details progressively.

### Avoid

- A payment button, wallet dashboard, token/price dashboard, or generic chat
  interface as the primary product.
- A broad feature list that dilutes the commercial loop.
- Decorative blockchain/NFT/identity primitives with no business role.
- Large amounts of private chain-of-thought, raw logs, or unexplained confidence
  scores in the UI.
- Treating “payment submitted” as the end of the experience.
- A polished visual shell without a real discovery-decision-payment-delivery
  loop.

### UI pattern

Build a single work surface, not card soup. The first viewport should make four
answers immediate:

1. What need is the agent addressing?
2. What action/resource/service did it select, and why?
3. What authority and checks permit or block payment?
4. What did the user receive after payment?

Suggested state sequence:

```text
need captured -> options found -> decision checked -> approved | blocked
-> paid on XRPL -> outcome verified -> receipt ready
```

Show concise, inspectable status messages such as “Checking mandate,” “Verifying
destination,” or “Confirming delivery.” Keep source evidence and technical
details behind a clear secondary control such as **Why?**, **Evidence**, or
**Technical receipt**. The main screen must work for a person unfamiliar with
crypto; technical judges can expand the XRPL/x402 details.

---

## 8. Baseline architecture and operational safeguards

This is a generic architecture pattern, not a mandated implementation:

```text
principal + structured objective + delegated mandate
  -> agent orchestration (discovery, comparison, explanation)
  -> deterministic policy / budget / authority service
  -> exact payment intent
  -> allow / review / deny control point
  -> x402 or MPP service exchange where appropriate
  -> bounded XRPL payment
  -> fulfilment verification
  -> protected evidence store + customer-facing receipt
```

The payment intent should bind, at minimum, the approved purpose/task, payee or
endpoint, amount and currency, resource/SKU or service reference, expiry,
unique request identifier, and applicable policy/mandate version. A changed
price, payee, destination, terms, or delivery condition requires a new check.

### Minimum controls to demonstrate

| Risk | Minimum response |
| --- | --- |
| Authority absent, expired, or too broad | Task-scoped authority, budget, expiry and approval gate. |
| Over-budget or currency mismatch | Deterministic maximum and currency check before signing. |
| Payee/endpoint substitution | Allowlist or verified binding between service/provider and payment destination. |
| Changed quote/terms | Exact version/price/expiry binding and re-check at payment time. |
| Replay/double purchase | Nonce or idempotency key and durable state machine. |
| Prompt injection/untrusted route | Treat retrieved content as untrusted; isolate instructions from policy and approved tool paths. |
| Payment succeeds but delivery fails | Separate settlement from fulfilment; display exception, retry, escalation/refund path. |
| Missing audit trail | Versioned mandate/policy, timestamped events, redacted evidence references and final receipt. |

### State model

```text
DRAFT -> DISCOVERED -> ELIGIBLE | REVIEW | DENIED
ELIGIBLE -> PAYMENT_INTENT_CREATED -> AUTHORIZED -> SUBMITTED -> SETTLED
SETTLED -> FULFILMENT_VERIFIED | FULFILMENT_EXCEPTION
FULFILMENT_VERIFIED -> RECEIPT_ISSUED
```

Each transition should be timestamped, attributable to an actor/system version,
safe to retry, and understandable to the user.

---

## 9. Demo and pitch constraints

The live pitch is **three minutes** followed by **two minutes of judge Q&A**.
That makes focus and demo reliability more valuable than feature volume.

### Three-minute structure

1. **Problem:** introduce one real buyer problem and why ordinary/manual
   commerce is too slow, fragmented, or unsafe.
2. **Delegation:** show the customer's goal and clearly bounded authority.
3. **Decision:** show the agent discovering/comparing and making one
   understandable choice. Include one rejected/blocked alternative.
4. **Transaction:** show what is being paid for and the XRPL transaction in
   plain language; reveal x402/MPP and technical details only as needed.
5. **Delivery:** show the useful outcome and receipt, not just confirmation of
   payment.
6. **Why it matters:** state why agentic payment and XRPL materially improve
   this business experience and how it can scale responsibly.

The final pitch may occur later at Singapore FinTech Festival for finalists, so
preserve the architecture, transaction references, and clean demo story for
continued refinement.

### Submission checklist

- Public GitHub repository and reproducible setup.
- Clear product/problem statement and customer journey.
- Architecture diagram.
- Demonstrated successful XRPL transaction plus hash/explorer reference.
- Explanation of XRPL AI Starter Kit integration if used.
- Explanation of x402/MPP or other agentic payment flow if used.
- Honest statement of prototype assumptions and production safeguards.
- Builder feedback hook run during development and feedback form completed.

---

## 10. Decision rubric for ideation

Score each candidate 1–5 against the following. A high total with no weak link
is better than a flashy concept that fails the commercial loop.

| Test | Question |
| --- | --- |
| Reality | Is the customer pain concrete, recurring, and important enough that someone would pay to solve it? |
| Agent necessity | Does the agent perform non-trivial discovery/decision work within stated constraints? |
| Payment necessity | Does payment unlock the exact service/outcome, rather than merely record it? |
| XRPL fit | Does XRPL provide a material settlement, cost, speed, transparency, token, or trust advantage? |
| Trust design | Are intent, authority, policy, evidence, exception handling and accountability visible? |
| Outcome | Is delivery specific, useful, and verifiable? |
| Feasibility | Can the team reliably prove the complete path in the available time? |
| Elegance | Can the whole story be demonstrated in three minutes with one primary surface? |
| Reachability | Is there a credible generalisation or business model beyond the demo? |

Reject or reshape a candidate when it needs several speculative integrations,
cannot name the payee and deliverable, leaves the agent with unbounded spending,
or cannot demonstrate a safe failure case.

---

## 11. Source map

### Local source files read in full

- [`tftf/reference/Hackathon Briefing_cleaned.txt`](tftf/reference/Hackathon%20Briefing_cleaned.txt): Ripple framing, company/t54 context, product direction, governance and pitch format.
- [`tftf/reference/hackathon-company-brief.txt`](tftf/reference/hackathon-company-brief.txt): XRPL capability framing, ecosystem standards, and the traceable/bounded autonomy synthesis.
- [`tftf/reference/hackathon-slides-annotated.txt`](tftf/reference/hackathon-slides-annotated.txt): source slides for maturity, standards, XRPL primitives, challenge goal and trust properties.
- [`tftf/reference/notes-presentation.txt`](tftf/reference/notes-presentation.txt): concise supporting signals on Ripple USD, governance, model agnosticism, accuracy and relationships.

### Active technical sources

- [`tftf/ripple-singhacks/README.md`](tftf/ripple-singhacks/README.md): official challenge requirements, scoring, submission and feedback-hook requirements.
- [`tftf/ripple-singhacks/ETHOS.md`](tftf/ripple-singhacks/ETHOS.md): project north star and safety expectations.
- [`tftf/ripple-singhacks/resources.md`](tftf/ripple-singhacks/resources.md): resource/tooling index.
- [Official Ripple challenge repository](https://github.com/Singhacks-2026/ripple)
- [XRPL Developer Portal](https://xrpl.org/)
- [XRPL AI Starter Kit](https://ripple.com/insights/xrpl-ai-starter-kit/)
- [t54 Trustline documentation](https://www.t54.ai/docs/trustline/overview)
- [t54 XRPL x402 facilitator](https://xrpl-x402.t54.ai/docs/overview)
- [Company and protocol research context](company-research-context.md)
- [Unlimit BaaS payments](https://www.baas.unlimit.com/payments/)

---

## 12. Instructions to the cloud agent

Do not prematurely commit the team to a domain-specific product. Generate a
small number of candidate concepts, then evaluate each with the rubric above.
For any recommendation, explicitly state:

1. Customer, problem, buyer, provider/payee, and paid deliverable.
2. The agent's exact discovery and decision responsibility.
3. The delegated authority and deterministic control boundary.
4. The XRPL primitive/transaction and why it belongs in the flow.
5. The post-payment outcome and how it will be verified.
6. A blocked or exception scenario to demonstrate.
7. The narrowest credible MVP and its three-minute demo moment.

Aim for a solution that is calm, precise, trustworthy, and unmistakably useful.
The preferred outcome is not maximal autonomy; it is the smallest amount of
autonomy that produces material value while remaining legible and controlled.
