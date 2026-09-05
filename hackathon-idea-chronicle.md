# SingHacks 2026 Ripple Track — Idea Chronicle

**Updated:** 5 September 2026  
**State:** Concept exploration; no final product selected  
**Goal:** Find a real, person-centered problem where both the agent and the
payment architecture materially improve the product.

## Chronicle

### Parked: DueProof

**Pitch:** Before an SME risks thousands on a suspicious invoice, its agent may
spend a tightly bounded amount on evidence.

DueProof remains the feasibility benchmark. It has a current problem, an
explainable outcome, a safe negative path, and a reliable digital deliverable.
It is parked because its first version does not make either the agent or XRPL
inevitable:

- a rules engine could call a fixed verification API;
- a card, subscription, or prepaid API account could buy the report;
- XRPL becomes important only in a later, open market of independent global
  evidence providers.

The full concept remains in `hackathon-winning-strategy.md`. It should not be
discarded, but it is no longer the presumed winner.

### Removed from the active slate

- AccessPatch
- PatchProof

## The selection bar

Every new concept must answer these questions in one breath:

1. **Person:** Whose day changes, and what are they trying to accomplish?
2. **Present pain:** What costly, urgent, or emotionally legible problem exists
   now?
3. **Agent job:** What uncertain discovery, negotiation, or adaptive decision
   cannot be reduced to a fixed checkout button?
4. **Paid object:** What exact product, access, energy, licence, or completed
   work is bought?
5. **XRPL advantage:** What becomes materially better through open,
   programmable, low-cost, final settlement?
6. **Delivery:** What can the audience see after payment that did not exist
   before it?
7. **Explanation:** Can the user inspect the mandate, choice, payment, delivery,
   and uncertainty without seeing chain-of-thought?

Two removal tests are now mandatory:

> **Remove the agent:** does the experience collapse into an ordinary app?

> **Replace XRPL/x402 with a card or API key:** does the business model or
> autonomous workflow materially weaken?

A concept can pass conditionally, but its MVP must demonstrate the condition
that makes the technology necessary.

## Sponsor DNA to design for

### Ripple

Ripple's public mission is to move value as easily as information and build a
world without economic borders. Its company and impact material repeatedly
emphasize interoperability, institutional-grade controls, economic access,
sustainability, and improving existing systems rather than ignoring their
operational and regulatory constraints.
[Ripple company](https://ripple.com/company/),
[Ripple Impact](https://ripple.com/impact/)

The most relevant technical research and product principles are:

- The XRPL AI Starter Kit is explicitly aimed at agents buying APIs, compute,
  and digital services with deterministic finality and predictable costs.
  [Ripple AI Starter Kit](https://ripple.com/insights/xrpl-ai-starter-kit/)
- Ripple's Lending Protocol work separates **off-chain credit judgment** from
  **standardized on-chain execution**. XLS-65/XLS-66 remain subject to validator
  approval, so use the principle—not an unverified mainnet claim.
  [Ripple lending research](https://ripple.com/insights/the-xrpl-lending-protocol-bringing-credit-infrastructure-onchain/)
- UBRI supports research intended to increase adoption and interoperability,
  while Ripple Impact emphasizes inclusive economic access and low-energy
  infrastructure.
  [Ripple UBRI](https://ripple.com/impact/ubri/)

### t54

t54's central value is not “more autonomous payments.” It is useful autonomy
that remains authorized, underwritten, evidence-backed, and attributable.
[t54 vision](https://docs.t54.ai/docs/company/vision)

Its **Agentic Risk Standard (ARS)** is the most valuable research asset for the
team to implement visibly. ARS models agent work as signed events and separates:

- a **fee track**: agree → lock fee → deliver → evaluate → release/refund;
- a **principal track**: underwrite higher-risk capital movement, with possible
  premium and collateral requirements.

[t54 ARS overview](https://docs.t54.ai/docs/research/agentic-risk-standard),
[ARS reference repository](https://github.com/t54-labs/AgenticRiskStandard)

t54's Monopoly Simulation and FinAgent-Bench offer two further research ideas:
repeated economic behavior matters more than one successful action, and
financial agents should be evaluated with objective, replayable checks rather
than self-reported confidence.
[Monopoly Simulation](https://docs.t54.ai/docs/research/monopoly-simulation),
[FinAgent-Bench](https://docs.t54.ai/docs/research/finagent-bench)

### ClawCredit

ClawCredit's clearest product belief is that an eligible agent should be able to
buy x402 services without a pre-funded wallet, and that capacity should grow
with security, behavior, and repayment evidence. It currently acts as a credit
and payment proxy rather than a general wallet.
[ClawCredit overview](https://www.claw.credit/docs/overview)

Use it where lack of pre-funding genuinely blocks an agent. Do not bolt it onto
every idea. Current public documentation describes Phase 1 repayment through a
user-facing dashboard, so automatic repayment must not be claimed unless it is
actually available and tested.

## New contender 1 — FairCut

> **An AI editor licenses the exact seconds it uses—and the creator gets paid
> immediately.**

### The person and the moment

**Leah** is a Singapore-based independent filmmaker finishing a 20-second travel
campaign at midnight. She needs a 12-second music cue that may be used
commercially in Singapore and Japan. She cannot spend an hour interpreting
catalogue licences, and she does not want her editor to use an unlicensed or
provenance-unknown track.

### The problem

Digital licensing is usually organized around large catalogues, subscriptions,
and human checkout flows. AI editors can generate and assemble media faster
than rights can be cleared. Independent creators and small rights-holders also
face transaction costs that make one tiny, narrowly scoped licence uneconomic.

WIPO describes growing challenges around rights management, attribution, and
compensation as AI-generated and AI-consumed content expands. In a 2025 WIPO
copyright session, participants specifically discussed how individual
licensing transaction costs can become insurmountable.
[WIPO AI and IP](https://www.wipo.int/en/web/frontier-technologies/artificial-intelligence/index),
[WIPO copyright and generative AI session](https://webcast.wipo.int/video/SCCR_47_2025-12-04_126408)

### What the agent actually does

Leah gives the editor a mandate:

> Find a tense but hopeful 12-second cue for this cut. Commercial social use in
> Singapore and Japan for six months. Budget S$1. No voice replicas and no asset
> without verifiable provenance.

The agent:

1. understands the edit's timing, mood, and sonic gaps;
2. discovers independent licensed stems from multiple providers;
3. auditions watermarked previews against the cut;
4. parses machine-readable permissions, prohibitions, attribution duties,
   territory, term, and price;
5. rejects creatively good tracks that do not satisfy the rights mandate;
6. purchases the best eligible 12-second licence;
7. inserts the clean stem and returns the finished cut plus a rights receipt.

The economic choice is simultaneously creative, legal, and budget-constrained.
A fixed rule cannot decide which cue works in the edit.

### What is bought

One x402-protected package containing:

- the clean 12-second audio stem;
- an **ISCC** content identifier or cryptographic asset hash;
- a machine-readable **ODRL** licence;
- a **C2PA Content Credentials** provenance manifest where available;
- creator/payee identity and attribution text;
- licence and delivery hashes.

The standards have distinct jobs:

- **W3C ODRL** represents permissions, prohibitions, constraints, and payment or
  attribution duties.
  [ODRL Information Model 2.2](https://www.w3.org/TR/odrl-model/)
- **ISO 24138:2024 ISCC** identifies digital assets across text, image, audio,
  and video.
  [ISO ISCC](https://committee.iso.org/standard/77899.html)
- **C2PA** records media provenance and edit history; it does not itself prove
  ownership or grant a licence.
  [C2PA specifications](https://spec.c2pa.org/specifications/)

### How the partners earn their place

- **Ripple/XRPL:** enables a sub-dollar, cross-border, machine-native purchase
  and immediate creator settlement. The transaction binds the licence order;
  the private media and detailed licence remain off-ledger.
- **t54/Trustline:** checks Leah's mandate, content identifier, rights-holder
  payee, price, territory, term, and whether the delivered licence matches the
  purchase. A changed rights document invalidates the decision.
- **ARS research:** implement the fee-track state machine. Payment is authorized,
  the asset/licence is delivered, an evaluator checks the hashes and required
  rights, then the job becomes fulfilled or a delivery exception.
- **ClawCredit:** optional but coherent for an agent that has no pre-funded
  balance and needs a tiny x402 licence. Do not make it critical unless live
  onboarding, payment, and repayment are proven.

### The hard blocked path

The agent finds a perfect S$0.20 track, but the licence permits personal use
only and its C2PA signer does not match the claimed rights-holder. The guard
shows:

```text
BLOCKED
Creative match: strong
Commercial rights: absent
Rights-holder/payee binding: failed
No payment was signed or submitted.
```

It then selects a S$0.60 eligible cue, pays on XRPL Testnet, unlocks it, and the
audience hears the finished cut.

### Three-minute stage moment

1. Play the silent/rough 20-second edit.
2. Show three watermarked cues evaluated in place.
3. Block the most attractive cue for a rights mismatch.
4. Show the exact eligible licence and bounded mandate.
5. Pay on XRP Testnet through the pinned x402 flow.
6. Replace the watermark with the clean stem and play the final cut.
7. Open the receipt: user intent → ODRL rights → XRPL hash → asset hash →
   creator paid.

### Irreducibility audit

- **Remove the agent:** the product becomes a stock-music search and manual
  licence checkout. The decisive value—the editor evaluating creative fit in
  the actual cut while satisfying machine-readable rights—disappears.
- **Replace XRPL/x402:** a centralized catalogue can use cards. To pass, the MVP
  must show independent providers and a genuinely small per-use purchase with
  immediate creator settlement, not one fake marketplace balance.

### Main risks

- Do not claim C2PA proves ownership; it proves signed provenance assertions.
- Do not invent legal enforceability. Use a narrow demo licence authored for
  the prototype and label it.
- A single self-hosted catalogue weakens the XRPL argument.
- Audio licensing introduces performance/mechanical-rights complexity. Keep the
  demo asset original, owned by a consenting creator, and the licence narrow.

**Strategic score:** Reality 4, Agent 5, Payment 5, XRPL 5, Trust 5, Outcome 5,
Feasibility 4, Elegance 5, Reach 5 — **43/45**.

**Why it could win:** it turns a ledger transaction into something the audience
can hear, pays a real creator, uses three real standards correctly, and makes
the agent's creative and economic choice inseparable.

## New contender 2 — FinishLine

> **Agents get paid for verified outcomes, not promises.**

### The person and the moment

**Maya** runs a two-person SaaS company. Her Japanese launch is tomorrow
morning, but the checkout page is still English. Her own agent can coordinate
the work but is not qualified to localize Japanese commerce copy. She needs to
hire a specialist agent tonight without trusting a marketplace rating or paying
for an unusable result.

### The problem

Agent-to-agent service markets can move quickly, but ordinary payment proves
only that money moved. It does not prove that work met the brief. Providers,
meanwhile, need confidence that successful work will be paid. This is the exact
problem t54's ARS research studies.

### What the orchestrator agent does

Maya delegates:

> Deliver a Japanese XLIFF package for checkout by 8 a.m. Preserve variables
> and HTML, use the approved terminology list, pass all structural checks, and
> spend at most S$8.

Her orchestrator:

1. turns the goal into objective acceptance tests;
2. discovers localization agents and compares domain experience, price, SLA,
   prior verified outcomes, and requested collateral;
3. negotiates a bounded job agreement;
4. selects a provider based on risk-adjusted value, not cheapest price;
5. monitors delivery and invokes an independent evaluator;
6. releases or refunds the fee according to the verified result;
7. returns the translated page and an outcome receipt.

### What is bought

A single, testable localization job:

- source and target in **XLIFF 2.1**;
- fixed glossary and prohibited translations;
- variable/HTML preservation;
- 100% segment coverage;
- screenshot render with no overflow;
- delivery deadline and artifact hashes.

XLIFF is an OASIS localization interchange standard, giving the evaluator an
objective structure instead of asking another model whether the output “looks
good.”
[OASIS XLIFF 2.1](https://docs.oasis-open.org/xliff/xliff-core/v2.1/xliff-core-v2.1.pdf)

### The research implementation

FinishLine implements a narrow XRPL adaptation of the **ARS fee track**:

```text
REQUEST
  -> signed agreement
  -> fee locked
  -> deliverable submitted
  -> objective evaluator verdict
  -> release to provider | refund to Maya
  -> outcome receipt
```

Use t54's abstract roles and event lifecycle as research inspiration; do not
claim compatibility with its EVM/AP2 reference settlement.

Ripple's lending research contributes a second design principle: **judgment is
off-chain; standardized execution is on-chain**. Here, Japanese quality and
structural checks are evaluated off-chain; XRPL executes the already-decided
release/refund. The live path can use XRP conditional Escrow if rehearsed.
XRPL supports PREIMAGE-SHA-256 conditional escrow, but it requires create plus
finish/cancel transactions and has reserve/fee implications.
[XRPL Escrow](https://xrpl.org/docs/concepts/payment-types/escrow)

### How the partners earn their place

- **Ripple/XRPL:** non-custodial conditional fee settlement and an inspectable
  release/refund outcome. XRP Testnet EscrowCreate and EscrowFinish provide more
  native depth than a decorative Payment.
- **t54 ARS:** supplies the job roles, signed events, fee lifecycle, evaluator,
  and outcome/accountability model.
- **Trustline:** underwrites Maya's agent, the provider, job scope, fee, evidence,
  and deviation from prior behavior before value is locked.
- **ClawCredit:** the provider agent may use credit to buy x402 translation or
  QA compute before it gets paid. This is an optional second-order loop, not the
  buyer's service fee and not a general P2P loan.
- **AP2:** its checkout and payment mandates are a useful authorization model
  for binding Maya's open constraints to the provider's closed job agreement.
  [AP2 specification](https://github.com/google-agentic-commerce/AP2/blob/main/docs/ap2/specification.md)

### The hard failure path

The cheapest provider asks to remove the glossary constraint or returns an XLIFF
file with a broken checkout variable. The evaluator fails it. The UI shows:

```text
DELIVERY FAILED
Payment was locked, not released.
Reason: required variable {{total}} was changed.
Outcome: fee refundable; provider does not receive payment.
```

A second provider passes the deterministic tests, the escrow is finished, and
the localized checkout appears.

### Three-minute stage moment

1. Show Maya's English checkout and 8 a.m. mandate.
2. Compare three specialist agents; reject the cheapest on verified outcomes.
3. Display the signed job and exact acceptance tests.
4. Create an XRP Testnet escrow.
5. Receive the XLIFF file and run visible deterministic checks.
6. Reveal the localized page.
7. Finish the escrow and show the ARS-style job receipt.

### Irreducibility audit

- **Remove the agent:** FinishLine becomes an ordinary freelancer marketplace.
  The MVP must show adaptive brief construction, provider negotiation, and
  automatic recovery from a failed provider—not a preselected service button.
- **Replace XRPL/x402:** a centralized platform can hold card funds. The XRPL
  advantage exists only if the demo shows open providers, no platform custody,
  native conditional settlement, and independently inspectable release.

### Main risks

- This has more moving parts than FairCut or DueProof.
- An evaluator can verify structure and terminology, not all linguistic quality.
- XRPL conditional escrow is a preimage condition, not a native “quality
  oracle.” The evaluator controls release of the fulfillment secret and must be
  shown as a separate trusted role.
- Do not combine a direct x402 Payment and escrow without a coherent accounting
  model.

**Strategic score:** Reality 5, Agent 5, Payment 5, XRPL 5, Trust 5, Outcome 5,
Feasibility 3, Elegance 4, Reach 5 — **42/45**.

**Why it could win:** it is the clearest implementation of a sponsor's actual
research thesis. “Pay agents for outcomes, not attempts” is instantly legible,
and a translated page is a visible deliverable.

## New contender 3 — LastPercent

> **At 3% battery, your car agent buys one charge anywhere—without making you
> join another network.**

### The person and the moment

**Aisha** is a home-care nurse driving to an urgent evening visit in an
unfamiliar part of Singapore. Her rental EV is at 3%. She cannot safely compare
charger apps while driving, has no account with the nearest operator, and needs
enough energy—not the cheapest headline tariff—to arrive on time.

### The problem

Charging infrastructure is expanding rapidly, but discovery, availability,
tariffs, booking, authorization, and payment span different operators. Singapore
reported 30,500 charging points by March 2026 and targets 60,000 by 2030.
[Singapore Ministry of Transport](https://www.mot.gov.sg/news-resources/newsroom/deployment-of-ev-charging-infrastructure-in-new-towns/)

The EU's Alternative Fuels Infrastructure Regulation requires ad hoc charging
without a prior contract and transparent price information, which is strong
evidence that account and payment fragmentation is a real policy problem, not
a fictional crypto use case.
[EU Regulation 2023/1804](https://eur-lex.europa.eu/eli/reg/2023/1804/oj)

### What the vehicle agent does

Aisha sets a standing mandate:

> Keep at least 20 km of reserve. When I cannot reach my next destination,
> purchase the safest compatible charge that keeps me on schedule. Maximum
> S$12, approved licensed operators only, never accept an occupancy fee above
> S$0.20/minute.

The agent combines:

- live location and route;
- battery state, consumption, and connector compatibility;
- charger availability and predicted queue;
- per-kWh, per-minute, booking, and roaming fees;
- detour time and Aisha's arrival constraint;
- operator/payee risk and payment terms.

It chooses and buys a specific reservation/energy package, then delivers a
start authorization to the charger.

### What is bought

For the MVP, use a fixed package rather than open-ended metering:

```text
10 kWh charging authorization
charger: SG-DEMO-014
connector: CCS2
reservation window: 18:40–19:00
maximum session duration: 25 minutes
fixed testnet price and exact payee
```

The visible outcome is not a receipt alone. A simulated OCPP charger changes
from `Reserved` to `Charging`; an energy meter advances; Aisha's projected
arrival changes from impossible to on time.

### Industry-standard bridge

- **OCPI** already represents locations, live status, tariffs, authorization,
  reservation, sessions, charging records, and roaming between mobility service
  providers and charge-point operators.
  [EVRoaming Foundation OCPI](https://evroaming.org/ocpi/)
- **OCPP** connects charging stations to management systems and supports
  transaction handling, smart charging, security, reservations, and ISO 15118.
  [Open Charge Alliance OCPP](https://openchargealliance.org/protocols/open-charge-point-protocol/)
- **ISO 15118** specifies EV-to-charger communication, including charging and
  control messages.
  [ISO 15118-20](https://www.iso.org/standard/77845.html)

Do not replace these standards. Add an agentic commerce bridge:

```text
OCPI discovery/tariff/reservation
  -> Trustline decision
  -> x402/XRPL payment
  -> OCPP charging authorization and metering
  -> combined payment + energy-delivery receipt
```

### How the partners earn their place

- **Ripple/XRPL:** open, fast settlement lets a vehicle agent purchase from an
  unfamiliar operator without a bilateral roaming account. The low-energy XRPL
  also aligns better with the mobility story than a high-energy chain.
- **t54/Trustline:** checks Aisha's mandate, operator identity, price anomaly,
  location, payee, energy package, timing, and whether the request is consistent
  with the vehicle agent's role.
- **ARS research:** separates payment settlement from energy delivery. A valid
  XRPL hash is not proof that 10 kWh was supplied; the OCPP meter receipt closes
  fulfilment.
- **ClawCredit:** this is the strongest natural use among the concepts. An
  eligible vehicle agent without a pre-funded wallet can request credit for the
  x402 charging service. Its limits can reflect successful prior sessions and
  repayment. Current manual repayment and onboarding limitations must be shown
  honestly.
- **Ripple research values:** interoperability, a world without economic
  borders, low-energy settlement, and improving existing infrastructure instead
  of replacing OCPI/OCPP.

### The hard blocked path

The closest charger advertises a low tariff, but its x402 challenge changes the
payee and adds an uncapped occupancy fee. The guard says:

```text
BLOCKED
Price terms exceed the standing mandate.
Payment destination does not match the licensed operator.
No charging authorization or payment was issued.
```

The agent chooses the second charger, pays for the fixed package, and starts the
simulated OCPP session.

### Three-minute stage moment

1. Show Aisha at 3%, with the route turning red.
2. The agent evaluates three live-looking OCPI offers.
3. Block the closest offer when its final payment terms mutate.
4. Select the charger that maximizes arrival probability within S$12.
5. Pay on XRP Testnet; optionally show a genuine ClawCredit path if available.
6. The charger lights up / simulated OCPP meter starts.
7. Show the route turn green and the combined energy-delivery receipt.

### Irreducibility audit

- **Remove the agent:** this can collapse into a charger app. To pass, the demo
  must make the decision dynamic and multi-constraint while Aisha is driving:
  battery prediction, queue risk, arrival time, connector, and final tariff all
  change. The user cannot be asked to compare offers manually.
- **Replace XRPL/x402:** cards already support ad hoc payment. The concept passes
  only if the commercial model is direct vehicle-to-operator purchase without a
  prior account or roaming contract, with a machine-verifiable exact quote and
  immediate settlement. Do not claim ordinary consumers need crypto at a
  charger today.

### Main risks

- A fully physical charger integration is not realistic for the MVP. Use an
  OCPP simulator or a small hardware light/meter and describe it accurately.
- Payment regulation, energy resale, refunds, and price units vary by market.
- Card and QR ad hoc payments are serious substitutes.
- The agent's optimization can be deterministic; its AI role must include
  interpreting the user's changing schedule and negotiating heterogeneous
  offers, not merely sorting by distance.

**Strategic score:** Reality 5, Agent 4, Payment 5, XRPL 4, Trust 5, Outcome 5,
Feasibility 3, Elegance 5, Reach 5 — **41/45**.

**Why it could win:** it is cinematic. The payment causes a machine to deliver
energy, and the user sees a meaningful physical outcome. It also gives
ClawCredit an intuitive reason to exist: the agent can act during an emergency
without a pre-funded wallet.

## Comparative decision

| Concept | Human hook | Research implementation | Standards | Best quality | Main weakness | Score |
| --- | --- | --- | --- | --- | --- | ---: |
| **FairCut** | Leah finishes a film without stealing or over-licensing music | ARS fee lifecycle + Verifiable Intent-style rights binding | ODRL, ISCC, C2PA, x402 | Most elegant; strongest software demo | Must prove an open creator market, not a fake stock library | **43** |
| **FinishLine** | Maya gets a launch-critical localization outcome by morning | Direct adaptation of t54 ARS fee track; Ripple off-chain judgment/on-chain execution principle | XLIFF 2.1, AP2, XRPL Escrow | Strongest sponsor-research fit | Most moving parts; evaluator trust | **42** |
| **LastPercent** | Aisha's car autonomously secures enough charge to reach a patient | ARS settlement-vs-fulfilment + Trustline behavioral underwriting | OCPI, OCPP, ISO 15118, x402 | Best stage moment; strongest ClawCredit story | Cards and route optimizers are strong substitutes | **41** |
| **DueProof** | SME buys evidence before paying a suspicious invoice | Trustline-style risk/evidence decision | x402, XRPL Payment | Safest and most explainable build | Agent and XRPL are optional in the first version | **35** |

## Recommendation at this stage

Do not settle yet. Prototype-test these three hypotheses in this order:

1. **FairCut:** can we create one genuinely valid, creator-authorized ODRL
   licence and make the paid transformation audible in under 90 seconds?
2. **FinishLine:** can XRP conditional escrow be created and finished reliably
   on Testnet, and can a deterministic XLIFF evaluator control the release
   without hand-waving?
3. **LastPercent:** can an OCPI fixture plus OCPP simulator make the physical
   outcome feel real enough without actual charger hardware?

The first concept to prove its hardest dependency should become the front-runner.
Until then:

- **FairCut leads on elegance.**
- **FinishLine leads on sponsor and research depth.**
- **LastPercent leads on memorability and live-demo theatre.**
- **DueProof remains the fallback if the harder concepts fail integration.**

## Claims discipline

- A transaction proves settlement, not delivery, rights ownership, translation
  quality, or energy supplied.
- C2PA proves provenance assertions, not truth or copyright ownership.
- Trustline should be named as the decision source only when a real response is
  used; otherwise say “local policy shaped like a Trustline adapter.”
- ARS is research infrastructure. Say “implements/adapts the ARS fee-track
  lifecycle,” not “is ARS compliant,” unless conformance is actually established.
- ClawCredit is currently a credit/payment proxy for x402 services, not a
  general wallet or an automatic repayment engine.
- XLS-65/XLS-66 are subject to validator approval. Their separation principle
  is useful even when their transactions are not in the MVP.
- XRP Testnet is the reliable live path. RLUSD belongs in the demo only after
  both sides' issuer and trust-line configuration is verified and rehearsed.

