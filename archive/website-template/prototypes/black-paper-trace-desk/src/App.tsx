import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";

type Environment = "production" | "staging" | "canary";
type TimeRange = "6h" | "24h" | "7d";
type ServiceStatus = "healthy" | "degraded" | "critical";
type Severity = "critical" | "major" | "minor" | "info";
type FeedKind = "incident" | "change" | "trace";

type IconName =
  | "activity"
  | "arrow-up-right"
  | "bell"
  | "check"
  | "chevron-down"
  | "chevron-right"
  | "clock"
  | "close"
  | "command"
  | "external"
  | "filter"
  | "grid"
  | "help"
  | "layers"
  | "menu"
  | "plus"
  | "search"
  | "settings"
  | "sliders"
  | "spark"
  | "trace"
  | "warning";

type FeedItem = {
  id: string;
  kind: FeedKind;
  severity: Severity;
  title: string;
  summary: string;
  time: string;
  relative: string;
  source: string;
  owner: string;
  affectedServices: string[];
  traceId: string;
  deploy?: string;
  nextAction: string;
  timeline: Array<{ time: string; title: string; detail: string }>;
};

type Service = {
  id: string;
  name: string;
  endpoint: string;
  role: string;
  status: ServiceStatus;
  owner: string;
  deploy: string;
  p95: number;
  errorRate: string;
  budget: string;
  nextAction: string;
  evidence: string;
};

type TraceSpan = {
  id: string;
  traceId: string;
  service: string;
  detail: string;
  start: number;
  width: number;
  tone: "quiet" | "watch" | "alert";
  incidentId?: string;
};

type TraceLane = {
  service: string;
  role: string;
  spans: TraceSpan[];
};

type DrawerSubject =
  | { type: "event"; id: string }
  | { type: "trace"; id: string }
  | { type: "service"; id: string };

const environmentMeta: Record<
  Environment,
  {
    label: string;
    short: string;
    region: string;
    insight: string;
    detail: string;
    availability: string;
    availabilityDelta: string;
    availabilityTone: "positive" | "watch";
    p95: string;
    p95Delta: string;
    p95Tone: "positive" | "watch" | "negative";
    errors: string;
    errorsDelta: string;
    errorsTone: "positive" | "watch" | "negative";
    budget: string;
    budgetDelta: string;
    budgetTone: "positive" | "watch";
  }
> = {
  production: {
    label: "Production",
    short: "prod",
    region: "us-east-1 · 12 services",
    insight: "Checkout is healthy, with one regression worth opening.",
    detail:
      "The payment callback recovered inside the last window. One trace still spends 91ms above its baseline, isolated to the callback path after deploy v2.18.0.",
    availability: "99.97%",
    availabilityDelta: "+0.02 pts vs target",
    availabilityTone: "positive",
    p95: "412ms",
    p95Delta: "+91ms vs baseline",
    p95Tone: "watch",
    errors: "0.18%",
    errorsDelta: "−0.06 pts vs prior window",
    errorsTone: "positive",
    budget: "72%",
    budgetDelta: "28% spent this period",
    budgetTone: "positive",
  },
  staging: {
    label: "Staging",
    short: "stage",
    region: "us-east-1 · 12 services",
    insight:
      "Staging is quiet; the production callback regression is not in this build.",
    detail:
      "The candidate environment is inside every checkout target. The same trace shape is available here as a comparison point before promoting the next change.",
    availability: "100.00%",
    availabilityDelta: "+0.05 pts vs target",
    availabilityTone: "positive",
    p95: "284ms",
    p95Delta: "−37ms vs baseline",
    p95Tone: "positive",
    errors: "0.04%",
    errorsDelta: "−0.12 pts vs production",
    errorsTone: "positive",
    budget: "94%",
    budgetDelta: "6% spent this period",
    budgetTone: "positive",
  },
  canary: {
    label: "Canary",
    short: "canary",
    region: "us-east-1 · 4 services",
    insight:
      "Canary is catching the checkout drift before it reaches more traffic.",
    detail:
      "The callback path is slower on the canary slice, but the signal is contained. Compare the trace with production before increasing the rollout to 25%.",
    availability: "99.94%",
    availabilityDelta: "−0.01 pts vs target",
    availabilityTone: "watch",
    p95: "468ms",
    p95Delta: "+118ms vs baseline",
    p95Tone: "negative",
    errors: "0.31%",
    errorsDelta: "+0.07 pts vs prior window",
    errorsTone: "negative",
    budget: "48%",
    budgetDelta: "52% spent this period",
    budgetTone: "watch",
  },
};

const rangeMeta: Record<
  TimeRange,
  { label: string; window: string; suffix: string }
> = {
  "6h": {
    label: "Last 6 hours",
    window: "14:02–14:16 UTC",
    suffix: "6h window",
  },
  "24h": {
    label: "Last 24 hours",
    window: "Yesterday 14:16–14:16 UTC",
    suffix: "24h window",
  },
  "7d": { label: "Last 7 days", window: "Aug 28–Sep 04", suffix: "7d window" },
};

const rangeSeries: Record<
  TimeRange,
  { labels: string[]; current: number[]; baseline: number[]; max: number }
> = {
  "6h": {
    labels: ["08:16", "09:16", "10:16", "11:16", "12:16", "13:16", "14:16"],
    current: [334, 348, 341, 356, 373, 392, 412],
    baseline: [322, 326, 329, 330, 329, 327, 321],
    max: 520,
  },
  "24h": {
    labels: ["14:16", "18:16", "22:16", "02:16", "06:16", "10:16", "14:16"],
    current: [321, 327, 342, 338, 354, 386, 412],
    baseline: [314, 317, 320, 319, 322, 324, 321],
    max: 520,
  },
  "7d": {
    labels: [
      "Aug 28",
      "Aug 29",
      "Aug 30",
      "Aug 31",
      "Sep 01",
      "Sep 02",
      "Sep 04",
    ],
    current: [298, 304, 311, 326, 341, 365, 412],
    baseline: [292, 296, 298, 301, 304, 308, 310],
    max: 520,
  },
};

const baseServices: Service[] = [
  {
    id: "checkout-api",
    name: "checkout-api",
    endpoint: "POST /v1/checkout",
    role: "Order orchestration",
    status: "degraded",
    owner: "Payments",
    deploy: "v2.18.0 · 18m ago",
    p95: 412,
    errorRate: "0.18%",
    budget: "64%",
    nextAction: "Compare callback timeout",
    evidence: "Callback span is +91ms against the 7-day baseline.",
  },
  {
    id: "payment-gateway",
    name: "payment-gateway",
    endpoint: "POST /payments/authorize",
    role: "Provider adapter",
    status: "degraded",
    owner: "Payments",
    deploy: "v2.17.4 · 2d ago",
    p95: 381,
    errorRate: "0.22%",
    budget: "58%",
    nextAction: "Inspect provider retries",
    evidence:
      "Retry count rose on the callback handshake, but no provider outage is present.",
  },
  {
    id: "orders-db",
    name: "orders-db",
    endpoint: "orders.insert",
    role: "Order persistence",
    status: "healthy",
    owner: "Data platform",
    deploy: "schema 841 · 6d ago",
    p95: 86,
    errorRate: "0.01%",
    budget: "91%",
    nextAction: "No action needed",
    evidence: "Query latency and lock wait remain inside the normal band.",
  },
  {
    id: "session-store",
    name: "session-store",
    endpoint: "GET /sessions/:id",
    role: "Cart state",
    status: "healthy",
    owner: "Core platform",
    deploy: "v4.6.2 · 11d ago",
    p95: 24,
    errorRate: "0.00%",
    budget: "98%",
    nextAction: "No action needed",
    evidence: "Session reads are stable across the selected range.",
  },
  {
    id: "fraud-check",
    name: "fraud-check",
    endpoint: "POST /risk/decision",
    role: "Risk decision",
    status: "healthy",
    owner: "Trust & safety",
    deploy: "v1.9.1 · 4d ago",
    p95: 144,
    errorRate: "0.03%",
    budget: "83%",
    nextAction: "No action needed",
    evidence:
      "Decision volume is normal; no latency contribution to the incident.",
  },
];

const feedItems: FeedItem[] = [
  {
    id: "inc-218",
    kind: "incident",
    severity: "major",
    title: "Payment callback drift",
    summary: "checkout-api p95 crossed the 400ms watchline after v2.18.0.",
    time: "14:11 UTC",
    relative: "5m ago",
    source: "Trace monitor",
    owner: "Mina Okafor",
    affectedServices: ["checkout-api", "payment-gateway", "orders-db"],
    traceId: "tr_7fa2",
    deploy: "v2.18.0 · 14:02 UTC",
    nextAction: "Compare the callback timeout to the previous deploy.",
    timeline: [
      {
        time: "14:02",
        title: "Deploy completed",
        detail: "checkout-api v2.18.0 reached 100%.",
      },
      {
        time: "14:08",
        title: "Baseline crossed",
        detail: "p95 moved 2.1σ above the 7-day band.",
      },
      {
        time: "14:11",
        title: "Incident opened",
        detail: "Trace monitor grouped 37 related requests.",
      },
      {
        time: "14:14",
        title: "Error rate recovered",
        detail: "Failures returned below the 0.25% watchline.",
      },
    ],
  },
  {
    id: "chg-217",
    kind: "change",
    severity: "info",
    title: "checkout-api deployed",
    summary: "v2.18.0 is live in production with a new callback guard.",
    time: "14:02 UTC",
    relative: "14m ago",
    source: "Deploy log",
    owner: "Release bot",
    affectedServices: ["checkout-api"],
    traceId: "tr_7fa2",
    deploy: "v2.18.0",
    nextAction: "Review the callback guard diff.",
    timeline: [
      {
        time: "13:46",
        title: "Change approved",
        detail: "Payments team approved the callback guard.",
      },
      {
        time: "14:02",
        title: "Deploy completed",
        detail: "Production rollout reached 100%.",
      },
    ],
  },
  {
    id: "inc-216",
    kind: "incident",
    severity: "minor",
    title: "Fraud provider retry burst",
    summary:
      "A short provider retry burst was contained without checkout impact.",
    time: "12:38 UTC",
    relative: "1h 38m ago",
    source: "Provider monitor",
    owner: "Jon Bell",
    affectedServices: ["fraud-check", "payment-gateway"],
    traceId: "tr_4c19",
    nextAction: "Keep the provider retry guard in place.",
    timeline: [
      {
        time: "12:38",
        title: "Retry burst detected",
        detail: "Provider 3 returned intermittent 429s.",
      },
      {
        time: "12:42",
        title: "Traffic normalized",
        detail: "Fallback path absorbed the remaining requests.",
      },
    ],
  },
];

const traceLanes: TraceLane[] = [
  {
    service: "edge-router",
    role: "ingress",
    spans: [
      {
        id: "sp-edge",
        traceId: "tr_7fa2",
        service: "edge-router",
        detail: "GET /checkout",
        start: 1,
        width: 2,
        tone: "quiet",
      },
      {
        id: "sp-edge-auth",
        traceId: "tr_7fa2",
        service: "edge-router",
        detail: "session gate",
        start: 4,
        width: 1,
        tone: "quiet",
      },
    ],
  },
  {
    service: "checkout-api",
    role: "orchestration",
    spans: [
      {
        id: "sp-checkout",
        traceId: "tr_7fa2",
        service: "checkout-api",
        detail: "create session",
        start: 2,
        width: 3,
        tone: "watch",
        incidentId: "inc-218",
      },
      {
        id: "sp-callback",
        traceId: "tr_7fa2",
        service: "checkout-api",
        detail: "payment callback",
        start: 6,
        width: 4,
        tone: "alert",
        incidentId: "inc-218",
      },
    ],
  },
  {
    service: "payment-gateway",
    role: "provider",
    spans: [
      {
        id: "sp-gateway",
        traceId: "tr_7fa2",
        service: "payment-gateway",
        detail: "authorize",
        start: 4,
        width: 2,
        tone: "watch",
        incidentId: "inc-218",
      },
      {
        id: "sp-retry",
        traceId: "tr_4c19",
        service: "payment-gateway",
        detail: "retry guard",
        start: 8,
        width: 2,
        tone: "watch",
        incidentId: "inc-216",
      },
    ],
  },
  {
    service: "orders-db",
    role: "persistence",
    spans: [
      {
        id: "sp-db",
        traceId: "tr_7fa2",
        service: "orders-db",
        detail: "insert order",
        start: 5,
        width: 2,
        tone: "quiet",
        incidentId: "inc-218",
      },
      {
        id: "sp-db-read",
        traceId: "tr_7fa2",
        service: "orders-db",
        detail: "read status",
        start: 9,
        width: 1,
        tone: "quiet",
      },
    ],
  },
  {
    service: "fraud-check",
    role: "risk",
    spans: [
      {
        id: "sp-fraud",
        traceId: "tr_4c19",
        service: "fraud-check",
        detail: "risk decision",
        start: 3,
        width: 3,
        tone: "quiet",
        incidentId: "inc-216",
      },
    ],
  },
];

const navItems: Array<{
  label: string;
  href: string;
  icon: IconName;
  active?: boolean;
}> = [
  { label: "Overview", href: "#overview", icon: "grid", active: true },
  { label: "Trace desk", href: "#trace-desk", icon: "trace" },
  { label: "Incidents", href: "#incidents", icon: "warning" },
  { label: "Services", href: "#services", icon: "layers" },
];

const focusableSelector =
  'a[href], button:not([disabled]), select:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

function useFocusTrap(
  open: boolean,
  containerRef: RefObject<HTMLElement | null>,
  onClose: () => void,
) {
  useEffect(() => {
    if (!open) return undefined;

    const previous =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const container = containerRef.current;
    if (!container) return undefined;

    const focusFirst = () => {
      const autofocus =
        container.querySelector<HTMLElement>("[data-autofocus]");
      const focusable = container.querySelector<HTMLElement>(focusableSelector);
      (autofocus ?? focusable)?.focus();
    };
    const focusTimer = window.setTimeout(focusFirst, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;
      const focusableElements = Array.from(
        container.querySelectorAll<HTMLElement>(focusableSelector),
      );
      if (focusableElements.length === 0) return;
      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      container.removeEventListener("keydown", handleKeyDown);
      if (previous && document.contains(previous)) previous.focus();
    };
  }, [containerRef, onClose, open]);
}

function Icon({ name, size = 16 }: { name: IconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "activity":
      return (
        <svg {...common}>
          <path d="M3 12h4l2.1-6 4.1 12 2.2-6H21" />
        </svg>
      );
    case "arrow-up-right":
      return (
        <svg {...common}>
          <path d="M7 17 17 7M8 7h9v9" />
        </svg>
      );
    case "bell":
      return (
        <svg {...common}>
          <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );
    case "chevron-down":
      return (
        <svg {...common}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      );
    case "chevron-right":
      return (
        <svg {...common}>
          <path d="m9 6 6 6-6 6" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "close":
      return (
        <svg {...common}>
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      );
    case "command":
      return (
        <svg {...common}>
          <path d="M7 3a4 4 0 1 0 0 8h4V7a4 4 0 1 0-4-4ZM17 3a4 4 0 1 1 0 8h-4V7a4 4 0 1 1 4-4ZM7 21a4 4 0 1 1 0-8h4v4a4 4 0 1 1-4 4ZM17 21a4 4 0 1 0 0-8h-4v4a4 4 0 1 0 4 4Z" />
        </svg>
      );
    case "external":
      return (
        <svg {...common}>
          <path d="M14 5h5v5M19 5l-8 8" />
          <path d="M18 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
        </svg>
      );
    case "filter":
      return (
        <svg {...common}>
          <path d="M4 6h16M7 12h10M10 18h4" />
        </svg>
      );
    case "grid":
      return (
        <svg {...common}>
          <rect x="4" y="4" width="6" height="6" rx="1" />
          <rect x="14" y="4" width="6" height="6" rx="1" />
          <rect x="4" y="14" width="6" height="6" rx="1" />
          <rect x="14" y="14" width="6" height="6" rx="1" />
        </svg>
      );
    case "help":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M9.7 9a2.4 2.4 0 1 1 3.8 1.9c-1 .7-1.5 1.2-1.5 2.5M12 17h.01" />
        </svg>
      );
    case "layers":
      return (
        <svg {...common}>
          <path d="m12 4 8 4-8 4-8-4 8-4Z" />
          <path d="m4 12 8 4 8-4M4 16l8 4 8-4" />
        </svg>
      );
    case "menu":
      return (
        <svg {...common}>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      );
    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="10.8" cy="10.8" r="6.3" />
          <path d="m16 16 4.2 4.2" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
          <path d="m19.4 15 .1.1a1.7 1.7 0 0 1-2.4 2.4l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a1.7 1.7 0 0 1-3.4 0v-.2A1.7 1.7 0 0 0 8 17.4l-.1.1a1.7 1.7 0 0 1-2.4-2.4l.1-.1a1.7 1.7 0 0 0-1.2-2.9h-.2a1.7 1.7 0 0 1 0-3.4h.2a1.7 1.7 0 0 0 1.2-2.9l-.1-.1A1.7 1.7 0 0 1 8 3.3l.1.1a1.7 1.7 0 0 0 2.9-1.2V2a1.7 1.7 0 0 1 3.4 0v.2a1.7 1.7 0 0 0 2.9 1.2l.1-.1a1.7 1.7 0 0 1 2.4 2.4l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.2a1.7 1.7 0 0 1 0 3.4h-.2a1.7 1.7 0 0 0-1.2 2.9Z" />
        </svg>
      );
    case "sliders":
      return (
        <svg {...common}>
          <path d="M4 6h16M4 12h16M4 18h16" />
          <circle cx="9" cy="6" r="1.8" fill="currentColor" stroke="none" />
          <circle cx="15" cy="12" r="1.8" fill="currentColor" stroke="none" />
          <circle cx="11" cy="18" r="1.8" fill="currentColor" stroke="none" />
        </svg>
      );
    case "spark":
      return (
        <svg {...common}>
          <path d="m12 3 1.2 5.8L19 10l-5.8 1.2L12 17l-1.2-5.8L5 10l5.8-1.2L12 3ZM19 16l.5 2.5L22 19l-2.5.5L19 22l-.5-2.5L16 19l2.5-.5L19 16Z" />
        </svg>
      );
    case "trace":
      return (
        <svg {...common}>
          <path d="M4 7h5l3 5h8M4 17h4l3-5h9" />
          <circle cx="4" cy="7" r="1.5" />
          <circle cx="20" cy="12" r="1.5" />
          <circle cx="4" cy="17" r="1.5" />
        </svg>
      );
    case "warning":
      return (
        <svg {...common}>
          <path d="m12 4 8 15H4L12 4Z" />
          <path d="M12 9v4M12 16h.01" />
        </svg>
      );
    default:
      return null;
  }
}

function LogoMark() {
  return (
    <span className="logo-mark" aria-hidden="true">
      LS
    </span>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <p className="rail-label">Observe</p>
      <div className="nav-list">
        {navItems.map((item) => (
          <a
            className={`nav-item${item.active ? " is-active" : ""}`}
            href={item.href}
            aria-current={item.active ? "page" : undefined}
            key={item.label}
            onClick={onNavigate}
          >
            <Icon name={item.icon} size={16} />
            <span>{item.label}</span>
            {item.label === "Incidents" ? (
              <span className="nav-count">2</span>
            ) : null}
          </a>
        ))}
      </div>
      <p className="rail-label rail-label-spaced">Workspace</p>
      <div className="nav-list">
        <a className="nav-item" href="#incidents" onClick={onNavigate}>
          <Icon name="activity" size={16} />
          <span>Deploy log</span>
        </a>
        <a className="nav-item" href="#services" onClick={onNavigate}>
          <Icon name="sliders" size={16} />
          <span>Thresholds</span>
        </a>
      </div>
    </>
  );
}

function DesktopRail() {
  return (
    <aside className="desktop-rail" aria-label="Primary navigation">
      <div className="rail-brand">
        <LogoMark />
        <div>
          <strong>Lattice</strong>
          <span>Signal</span>
        </div>
      </div>
      <div className="rail-workspace">
        <span className="workspace-dot">C</span>
        <span className="rail-workspace-copy">
          <strong>Checkout</strong>
          <small>Payments workspace</small>
        </span>
        <span className="workspace-live-dot" aria-label="Live workspace" />
      </div>
      <nav className="rail-nav">
        <NavLinks />
      </nav>
      <div className="rail-bottom">
        <div className="rail-ingest">
          <span className="live-indicator" aria-hidden="true" />
          <div>
            <strong>Live ingest</strong>
            <span>Updated 14:16 UTC</span>
          </div>
        </div>
        <a className="rail-utility" href="#services">
          <Icon name="settings" size={15} />
          <span>Workspace settings</span>
        </a>
        <a className="rail-utility" href="#overview">
          <Icon name="help" size={15} />
          <span>Read the field guide</span>
        </a>
      </div>
    </aside>
  );
}

function MobileNavigation({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const navRef = useRef<HTMLElement>(null);
  useFocusTrap(open, navRef, onClose);
  if (!open) return null;

  return (
    <>
      <button
        className="nav-scrim"
        type="button"
        aria-label="Close navigation"
        onClick={onClose}
      />
      <aside
        className="mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-nav-title"
        ref={navRef}
      >
        <div className="mobile-nav-head">
          <div className="rail-brand">
            <LogoMark />
            <div>
              <strong>Lattice</strong>
              <span>Signal</span>
            </div>
          </div>
          <button
            className="icon-button"
            type="button"
            aria-label="Close navigation"
            onClick={onClose}
            data-autofocus
          >
            <Icon name="close" size={18} />
          </button>
        </div>
        <h2 id="mobile-nav-title" className="sr-only">
          Workspace navigation
        </h2>
        <div className="mobile-workspace">
          <span className="workspace-dot">C</span>
          <div>
            <strong>Checkout</strong>
            <span>Payments workspace</span>
          </div>
          <span className="workspace-live-dot" aria-hidden="true" />
        </div>
        <nav className="mobile-nav-links">
          <NavLinks onNavigate={onClose} />
        </nav>
        <div className="mobile-nav-foot">
          <div className="rail-ingest">
            <span className="live-indicator" aria-hidden="true" />
            <div>
              <strong>Live ingest</strong>
              <span>Updated 14:16 UTC</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function MiniTrend({
  values,
  tone = "neutral",
}: {
  values: number[];
  tone?: "positive" | "watch" | "negative" | "neutral";
}) {
  const width = 86;
  const height = 28;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = max - min || 1;
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / spread) * 19 - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      className={`mini-trend tone-${tone}`}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
    >
      <path className="mini-trend-guide" d={`M0 ${height - 4}H${width}`} />
      <polyline points={points} />
      <circle
        cx={points.split(" ").at(-1)?.split(",")[0]}
        cy={points.split(" ").at(-1)?.split(",")[1]}
        r="2.4"
      />
    </svg>
  );
}

function KpiCard({
  label,
  value,
  detail,
  delta,
  tone,
  trend,
  progress,
}: {
  label: string;
  value: string;
  detail: string;
  delta: string;
  tone: "positive" | "watch" | "negative";
  trend: number[];
  progress?: number;
}) {
  return (
    <article className={`kpi-card tone-${tone}`}>
      <div className="kpi-head">
        <span>{label}</span>
        <span className="kpi-rule" aria-hidden="true" />
        <Icon
          name={tone === "watch" || tone === "negative" ? "warning" : "check"}
          size={14}
        />
      </div>
      <div className="kpi-value-row">
        <strong>{value}</strong>
        <MiniTrend values={trend} tone={tone} />
      </div>
      <div className="kpi-foot">
        <span>{detail}</span>
        <span className={`kpi-delta tone-${tone}`}>{delta}</span>
      </div>
      {typeof progress === "number" ? (
        <div
          className="budget-track"
          aria-label={`${progress}% of error budget remaining`}
        >
          <span style={{ width: `${progress}%` }} />
        </div>
      ) : null}
    </article>
  );
}

function pathFromValues(values: number[], max: number) {
  const width = 760;
  const height = 236;
  const padX = 34;
  const padY = 20;
  return values
    .map((value, index) => {
      const x = padX + (index / (values.length - 1)) * (width - padX * 2);
      const y = height - padY - (value / max) * (height - padY * 2);
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function ChartPanel({
  environment,
  timeRange,
  onOpenIncident,
}: {
  environment: Environment;
  timeRange: TimeRange;
  onOpenIncident: (item: FeedItem, trigger: HTMLElement) => void;
}) {
  const meta = environmentMeta[environment];
  const series = rangeSeries[timeRange];
  const adjustment =
    environment === "staging" ? -35 : environment === "canary" ? 27 : 0;
  const current = series.current.map((value) => value + adjustment);
  const baseline = series.baseline.map(
    (value) => value + (environment === "canary" ? 8 : 0),
  );
  const eventIndex = Math.max(1, current.length - 2);
  const markerLeft = `${(eventIndex / (current.length - 1)) * 100}%`;
  const currentLast = current.at(-1) ?? 0;
  const baselineLast = baseline.at(-1) ?? 0;

  return (
    <section className="panel chart-panel" aria-labelledby="trend-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">02 / trend</p>
          <h2 id="trend-title">Current p95 against the quiet line</h2>
          <p className="panel-caption">
            Checkout request latency ·{" "}
            {rangeMeta[timeRange].label.toLowerCase()} · milliseconds
          </p>
        </div>
        <div
          className="chart-stat"
          aria-label={`Current p95 ${currentLast} milliseconds, baseline ${baselineLast} milliseconds`}
        >
          <strong>{currentLast}ms</strong>
          <span>current p95</span>
        </div>
      </div>
      <div className="chart-legend" aria-label="Chart legend">
        <span>
          <i className="legend-line current" />
          Current
        </span>
        <span>
          <i className="legend-line baseline" />
          7-day baseline
        </span>
        <span>
          <i className="legend-marker" />
          Regression window
        </span>
      </div>
      <div className="chart-wrap">
        <svg
          className="trend-chart"
          viewBox="0 0 760 236"
          role="img"
          aria-labelledby="trend-chart-title trend-chart-desc"
        >
          <title id="trend-chart-title">Checkout p95 latency trend</title>
          <desc id="trend-chart-desc">
            Current p95 rises from {current[0]} milliseconds to {currentLast}{" "}
            milliseconds while the 7-day baseline stays near {baselineLast}{" "}
            milliseconds.
          </desc>
          {[0, 130, 260, 390, 520].map((value) => {
            const y = 236 - 20 - (value / series.max) * (236 - 40);
            return (
              <g key={value}>
                <line
                  x1="34"
                  x2="726"
                  y1={y}
                  y2={y}
                  className="chart-grid-line"
                />
                <text x="0" y={y + 4} className="chart-axis-label">
                  {value}
                </text>
              </g>
            );
          })}
          <path
            d={pathFromValues(baseline, series.max)}
            className="series-baseline"
          />
          <path
            d={pathFromValues(current, series.max)}
            className="series-current"
          />
          {current.map((value, index) => {
            const x = 34 + (index / (current.length - 1)) * (760 - 68);
            const y = 236 - 20 - (value / series.max) * (236 - 40);
            return (
              <circle
                key={`${value}-${index}`}
                cx={x}
                cy={y}
                r={index === current.length - 1 ? 4 : 2.3}
                className="series-point"
              />
            );
          })}
          <line
            x1={34 + (eventIndex / (current.length - 1)) * (760 - 68)}
            x2={34 + (eventIndex / (current.length - 1)) * (760 - 68)}
            y1="20"
            y2="216"
            className="chart-event-line"
          />
          <line
            x1="34"
            x2="726"
            y1="216"
            y2="216"
            className="chart-axis-line"
          />
          {series.labels.map((label, index) => {
            const x = 34 + (index / (series.labels.length - 1)) * (760 - 68);
            return (
              <text
                key={`${label}-${index}`}
                x={x}
                y="232"
                textAnchor={
                  index === 0
                    ? "start"
                    : index === series.labels.length - 1
                      ? "end"
                      : "middle"
                }
                className="chart-axis-label"
              >
                {label}
              </text>
            );
          })}
        </svg>
        <button
          className="chart-marker"
          type="button"
          style={{ left: markerLeft }}
          aria-label="Open the payment callback regression evidence"
          onClick={(event) => onOpenIncident(feedItems[0], event.currentTarget)}
        >
          <span className="chart-marker-glyph" aria-hidden="true">
            ◆
          </span>
          <span>callback drift</span>
        </button>
      </div>
      <div className="chart-footnote">
        <span>
          <Icon name="clock" size={14} />
          Fresh through 14:16 UTC
        </span>
        <span>{meta.region}</span>
        <button
          className="text-action"
          type="button"
          onClick={(event) => onOpenIncident(feedItems[0], event.currentTarget)}
        >
          Open regression evidence <Icon name="arrow-up-right" size={14} />
        </button>
      </div>
    </section>
  );
}

function TraceDesk({
  selectedTraceId,
  selectedIncidentId,
  onSelectSpan,
  onOpenIncident,
}: {
  selectedTraceId: string;
  selectedIncidentId: string;
  onSelectSpan: (span: TraceSpan, trigger: HTMLElement) => void;
  onOpenIncident: (item: FeedItem, trigger: HTMLElement) => void;
}) {
  const selectedIncident =
    feedItems.find((item) => item.id === selectedIncidentId) ?? feedItems[0];
  return (
    <section
      className="panel trace-panel"
      id="trace-desk"
      aria-labelledby="trace-title"
    >
      <div className="panel-heading trace-heading">
        <div>
          <p className="eyebrow">Signature / trace desk</p>
          <h2 id="trace-title">Where the regression travels</h2>
          <p className="panel-caption">
            One checkout request, laid out across the services it touched.
          </p>
        </div>
        <div className="trace-heading-actions">
          <span className="trace-id">
            <Icon name="trace" size={13} />
            {selectedTraceId}
          </span>
          <button
            className="button button-quiet"
            type="button"
            onClick={(event) =>
              onOpenIncident(selectedIncident, event.currentTarget)
            }
          >
            Open evidence <Icon name="arrow-up-right" size={14} />
          </button>
        </div>
      </div>
      <div className="trace-callout">
        <span className="callout-marker" aria-hidden="true" />
        <p>
          <strong>14:11 UTC</strong> callback drift appears after{" "}
          <code>checkout-api v2.18.0</code>. The signal is contained to the
          provider handshake.
        </p>
      </div>
      <div className="trace-legend" aria-label="Trace legend">
        <span>
          <i className="trace-key quiet" />
          within baseline
        </span>
        <span>
          <i className="trace-key watch" />
          watchline
        </span>
        <span>
          <i className="trace-key alert" />
          selected regression
        </span>
        <span className="trace-window-key">window 14:02–14:16</span>
      </div>
      <div className="trace-desk" aria-describedby="trace-instruction">
        <div className="trace-axis">
          <span className="trace-axis-label">service</span>
          {rangeSeries["6h"].labels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        <div className="trace-window" aria-hidden="true" />
        <div className="trace-regression-line" aria-hidden="true">
          <span>regression</span>
        </div>
        {traceLanes.map((lane) => (
          <div className="trace-lane" key={lane.service}>
            <div className="trace-lane-label">
              <strong>{lane.service}</strong>
              <span>{lane.role}</span>
            </div>
            <div className="trace-lane-track">
              {lane.spans.map((span) => {
                const isSelected =
                  span.traceId === selectedTraceId &&
                  (span.incidentId === selectedIncidentId || !span.incidentId);
                const isAffected = span.incidentId === selectedIncidentId;
                const style = {
                  left: `${((span.start - 1) / 12) * 100}%`,
                  width: `${(span.width / 12) * 100}%`,
                } as CSSProperties;
                return (
                  <button
                    className={`trace-span tone-${span.tone}${isAffected ? " is-affected" : ""}${isSelected ? " is-selected" : ""}`}
                    type="button"
                    style={style}
                    key={span.id}
                    aria-pressed={isSelected}
                    aria-label={`${span.service} ${span.detail}, trace ${span.traceId}`}
                    onClick={(event) => onSelectSpan(span, event.currentTarget)}
                  >
                    <span>{span.detail}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <p id="trace-instruction" className="trace-instruction">
        Select a span to open its evidence. The highlighted lane follows the
        incident currently in view.
      </p>
      <div className="trace-foot">
        <span>
          <Icon name="spark" size={14} />
          Deterministic demo trace · 37 grouped requests
        </span>
        <span>
          Latency budget <strong>500ms</strong>
        </span>
      </div>
    </section>
  );
}

function severityLabel(severity: Severity) {
  switch (severity) {
    case "critical":
      return "Critical";
    case "major":
      return "Major";
    case "minor":
      return "Minor";
    default:
      return "Change";
  }
}

function IncidentFeed({
  selectedIncidentId,
  acknowledged,
  onSelect,
  onAcknowledge,
}: {
  selectedIncidentId: string;
  acknowledged: Set<string>;
  onSelect: (item: FeedItem, trigger: HTMLElement) => void;
  onAcknowledge: (item: FeedItem) => void;
}) {
  return (
    <section
      className="panel incident-panel"
      id="incidents"
      aria-labelledby="incidents-title"
    >
      <div className="panel-heading compact-heading">
        <div>
          <p className="eyebrow">03 / activity</p>
          <h2 id="incidents-title">Incident & change log</h2>
        </div>
        <span className="feed-live">
          <span className="live-indicator" aria-hidden="true" />
          live
        </span>
      </div>
      <div className="incident-list">
        {feedItems.map((item) => {
          const isSelected = item.id === selectedIncidentId;
          const isAcknowledged = acknowledged.has(item.id);
          return (
            <article
              className={`incident-item${isSelected ? " is-selected" : ""}`}
              key={item.id}
            >
              <button
                className="incident-main"
                type="button"
                aria-pressed={isSelected}
                onClick={(event) => onSelect(item, event.currentTarget)}
              >
                <span
                  className={`severity-mark severity-${item.severity}`}
                  aria-hidden="true"
                />
                <span className="incident-copy">
                  <span className="incident-meta">
                    <span className={`severity-text severity-${item.severity}`}>
                      {severityLabel(item.severity)}
                    </span>
                    <span>{item.relative}</span>
                  </span>
                  <strong>{item.title}</strong>
                  <span>{item.summary}</span>
                </span>
                <Icon name="chevron-right" size={16} />
              </button>
              <div className="incident-actions">
                <span className="incident-source">
                  <Icon
                    name={item.kind === "change" ? "activity" : "trace"}
                    size={13}
                  />
                  {item.source}
                </span>
                {item.kind === "incident" ? (
                  <button
                    className={`ack-button${isAcknowledged ? " is-acknowledged" : ""}`}
                    type="button"
                    disabled={isAcknowledged}
                    onClick={() => onAcknowledge(item)}
                  >
                    {isAcknowledged ? (
                      <>
                        <Icon name="check" size={13} />
                        Acknowledged
                      </>
                    ) : (
                      "Acknowledge"
                    )}
                  </button>
                ) : (
                  <span className="event-state">Observed</span>
                )}
              </div>
              {isAcknowledged ? (
                <span className="inline-feedback">
                  <Icon name="check" size={12} />
                  Acknowledged for this workspace
                </span>
              ) : null}
            </article>
          );
        })}
      </div>
      <div className="panel-foot">
        <span>Showing 2 incidents and 1 change</span>
        <a className="text-action" href="#trace-desk">
          View trace desk <Icon name="arrow-up-right" size={14} />
        </a>
      </div>
    </section>
  );
}

function statusLabel(status: ServiceStatus) {
  switch (status) {
    case "critical":
      return "Critical";
    case "degraded":
      return "Degraded";
    default:
      return "Healthy";
  }
}

function serviceForEnvironment(
  service: Service,
  environment: Environment,
): Service {
  if (environment === "production") return service;
  if (environment === "staging") {
    return {
      ...service,
      status:
        service.id === "checkout-api" || service.id === "payment-gateway"
          ? "healthy"
          : service.status,
      p95: Math.max(18, Math.round(service.p95 * 0.68)),
      errorRate:
        service.id === "checkout-api"
          ? "0.04%"
          : service.id === "payment-gateway"
            ? "0.03%"
            : service.errorRate,
      budget: service.id === "checkout-api" ? "94%" : service.budget,
      nextAction:
        service.id === "checkout-api"
          ? "Ready for comparison"
          : service.nextAction,
    };
  }
  return {
    ...service,
    status:
      service.id === "checkout-api" || service.id === "payment-gateway"
        ? "critical"
        : service.status,
    p95: service.id === "checkout-api" ? 468 : Math.round(service.p95 * 1.14),
    errorRate: service.id === "checkout-api" ? "0.31%" : service.errorRate,
    budget: service.id === "checkout-api" ? "48%" : service.budget,
    nextAction:
      service.id === "checkout-api"
        ? "Hold rollout at 10%"
        : service.nextAction,
  };
}

function ServiceEvidence({
  environment,
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
  selectedServiceId,
  expandedServiceId,
  onToggleExpanded,
  onSelectService,
  onClear,
}: {
  environment: Environment;
  query: string;
  onQueryChange: (value: string) => void;
  statusFilter: "all" | "attention" | "healthy";
  onStatusFilterChange: (value: "all" | "attention" | "healthy") => void;
  selectedServiceId: string;
  expandedServiceId: string | null;
  onToggleExpanded: (id: string) => void;
  onSelectService: (service: Service, trigger: HTMLElement) => void;
  onClear: () => void;
}) {
  const services = useMemo(() => {
    return baseServices
      .map((service) => serviceForEnvironment(service, environment))
      .filter((service) => {
        const matchesQuery = `${service.name} ${service.role} ${service.owner}`
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "attention"
            ? service.status !== "healthy"
            : service.status === "healthy");
        return matchesQuery && matchesStatus;
      });
  }, [environment, query, statusFilter]);

  return (
    <section
      className="panel service-panel"
      id="services"
      aria-labelledby="services-title"
    >
      <div className="panel-heading service-heading">
        <div>
          <p className="eyebrow">04 / evidence</p>
          <h2 id="services-title">Service evidence</h2>
          <p className="panel-caption">
            The smallest set of services needed to explain checkout health.
          </p>
        </div>
        <span className="service-count" role="status">
          {services.length} of {baseServices.length} services
        </span>
      </div>
      <div className="service-toolbar">
        <label className="search-field">
          <span className="sr-only">Search services</span>
          <Icon name="search" size={17} />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search services, owners, roles"
          />
          {query ? (
            <button
              className="clear-search"
              type="button"
              aria-label="Clear service search"
              onClick={onClear}
            >
              ×
            </button>
          ) : null}
        </label>
        <div className="filter-group" aria-label="Filter services by status">
          <Icon name="filter" size={14} />
          {(["all", "attention", "healthy"] as const).map((filter) => (
            <button
              className={`filter-button${statusFilter === filter ? " is-active" : ""}`}
              aria-pressed={statusFilter === filter}
              type="button"
              key={filter}
              onClick={() => onStatusFilterChange(filter)}
            >
              {filter === "all"
                ? "All"
                : filter === "attention"
                  ? "Needs attention"
                  : "Healthy"}
            </button>
          ))}
        </div>
      </div>
      {services.length === 0 ? (
        <div className="no-results">
          <Icon name="search" size={20} />
          <strong>No services match this view.</strong>
          <span>
            Clear the search or show all statuses to restore the evidence list.
          </span>
          <button
            className="button button-quiet"
            type="button"
            onClick={() => {
              onClear();
              onStatusFilterChange("all");
            }}
          >
            Reset service view
          </button>
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="service-table">
              <caption className="sr-only">
                Checkout services and endpoints with status, owner, latest
                deploy, latency, error rate, and next action.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Service</th>
                  <th scope="col">Status</th>
                  <th scope="col">Owner</th>
                  <th scope="col">Latest deploy</th>
                  <th scope="col" className="numeric">
                    p95
                  </th>
                  <th scope="col" className="numeric">
                    Errors
                  </th>
                  <th scope="col">Next action</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr
                    className={
                      selectedServiceId === service.id ? "is-selected" : ""
                    }
                    key={service.id}
                  >
                    <td>
                      <button
                        className="service-name-button"
                        type="button"
                        onClick={(event) =>
                          onSelectService(service, event.currentTarget)
                        }
                      >
                        <span
                          className={`status-dot status-${service.status}`}
                          aria-hidden="true"
                        />
                        <span>
                          <strong>{service.name}</strong>
                          <small>{service.endpoint}</small>
                          <small>{service.role}</small>
                        </span>
                        <Icon name="arrow-up-right" size={14} />
                      </button>
                    </td>
                    <td>
                      <span className={`status-label status-${service.status}`}>
                        <span className="status-dot" aria-hidden="true" />
                        {statusLabel(service.status)}
                      </span>
                    </td>
                    <td>{service.owner}</td>
                    <td className="deploy-cell">{service.deploy}</td>
                    <td className="numeric mono-value">{service.p95}ms</td>
                    <td className="numeric mono-value">{service.errorRate}</td>
                    <td>
                      <button
                        className="table-action"
                        type="button"
                        onClick={(event) =>
                          onSelectService(service, event.currentTarget)
                        }
                      >
                        {service.nextAction}
                        <Icon name="chevron-right" size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mobile-service-list">
            {services.map((service) => {
              const isExpanded = expandedServiceId === service.id;
              return (
                <article
                  className={`mobile-service-card${selectedServiceId === service.id ? " is-selected" : ""}`}
                  key={service.id}
                >
                  <button
                    className="mobile-service-summary"
                    type="button"
                    aria-expanded={isExpanded}
                    aria-controls={`${service.id}-details`}
                    onClick={() => onToggleExpanded(service.id)}
                  >
                    <span
                      className={`status-dot status-${service.status}`}
                      aria-hidden="true"
                    />
                    <span className="mobile-service-title">
                      <strong>{service.name}</strong>
                      <small>{service.endpoint}</small>
                      <small>{service.role}</small>
                    </span>
                    <span className={`status-label status-${service.status}`}>
                      {statusLabel(service.status)}
                    </span>
                    <Icon name="chevron-down" size={16} />
                  </button>
                  {isExpanded ? (
                    <div
                      className="mobile-service-details"
                      id={`${service.id}-details`}
                    >
                      <dl className="mobile-detail-grid">
                        <div>
                          <dt>Endpoint</dt>
                          <dd>{service.endpoint}</dd>
                        </div>
                        <div>
                          <dt>Owner</dt>
                          <dd>{service.owner}</dd>
                        </div>
                        <div>
                          <dt>p95</dt>
                          <dd>{service.p95}ms</dd>
                        </div>
                        <div>
                          <dt>Errors</dt>
                          <dd>{service.errorRate}</dd>
                        </div>
                        <div>
                          <dt>Deploy</dt>
                          <dd>{service.deploy}</dd>
                        </div>
                      </dl>
                      <p>{service.evidence}</p>
                      <button
                        className="button button-quiet"
                        type="button"
                        onClick={(event) =>
                          onSelectService(service, event.currentTarget)
                        }
                      >
                        Open trace evidence{" "}
                        <Icon name="arrow-up-right" size={14} />
                      </button>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </>
      )}
      <div className="panel-foot service-foot">
        <span>Evidence refreshed at 14:16 UTC</span>
        <span>Click a service for linked traces and deploy context.</span>
      </div>
    </section>
  );
}

function EvidenceDrawer({
  open,
  subject,
  acknowledged,
  onClose,
  onAcknowledge,
}: {
  open: boolean;
  subject: DrawerSubject | null;
  acknowledged: Set<string>;
  onClose: () => void;
  onAcknowledge: (item: FeedItem) => void;
}) {
  const drawerRef = useRef<HTMLElement>(null);
  useFocusTrap(open, drawerRef, onClose);
  if (!open || !subject) return null;

  const event =
    subject.type === "service"
      ? feedItems.find((item) => item.affectedServices.includes(subject.id))
      : subject.type === "event"
        ? feedItems.find((item) => item.id === subject.id)
        : feedItems.find((item) => item.traceId === subject.id);
  const service =
    subject.type === "service"
      ? baseServices.find((item) => item.id === subject.id)
      : undefined;
  const title = service?.name ?? event?.title ?? "Trace evidence";
  const eyebrow = service
    ? "Service evidence"
    : subject.type === "trace"
      ? "Selected trace"
      : event?.kind === "change"
        ? "Change evidence"
        : "Incident evidence";
  const summary =
    service?.evidence ??
    event?.summary ??
    "A selected trace with linked operational evidence.";
  const isAcknowledged = event ? acknowledged.has(event.id) : false;

  return (
    <>
      <button
        className="drawer-scrim"
        type="button"
        aria-label="Close evidence drawer"
        onClick={onClose}
      />
      <aside
        className="evidence-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        aria-describedby="drawer-summary"
        ref={drawerRef}
      >
        <header className="drawer-header">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2 id="drawer-title">{title}</h2>
          </div>
          <button
            className="icon-button"
            type="button"
            aria-label="Close evidence drawer"
            onClick={onClose}
            data-autofocus
          >
            <Icon name="close" size={18} />
          </button>
        </header>
        <div className="drawer-body">
          <p id="drawer-summary" className="drawer-summary">
            {summary}
          </p>
          {event ? (
            <div className="drawer-tags">
              <span className={`severity-chip severity-${event.severity}`}>
                <span className="severity-mark" aria-hidden="true" />
                {severityLabel(event.severity)}
              </span>
              <span className="trace-id">
                <Icon name="trace" size={13} />
                {event.traceId}
              </span>
              <span className="drawer-time">
                <Icon name="clock" size={13} />
                {event.time}
              </span>
            </div>
          ) : null}
          <section
            className="drawer-section"
            aria-labelledby="drawer-services-title"
          >
            <div className="drawer-section-head">
              <h3 id="drawer-services-title">Affected services</h3>
              <span>
                {service
                  ? "Linked incident"
                  : `${event?.affectedServices.length ?? 0} services`}
              </span>
            </div>
            <div className="affected-service-list">
              {(service ? [service.id] : (event?.affectedServices ?? [])).map(
                (serviceId) => {
                  const item = baseServices.find(
                    (candidate) => candidate.id === serviceId,
                  );
                  return item ? (
                    <span className="affected-service" key={serviceId}>
                      <span
                        className={`status-dot status-${item.status}`}
                        aria-hidden="true"
                      />
                      {item.name}
                    </span>
                  ) : null;
                },
              )}
            </div>
          </section>
          <section
            className="drawer-section"
            aria-labelledby="drawer-timeline-title"
          >
            <div className="drawer-section-head">
              <h3 id="drawer-timeline-title">Evidence timeline</h3>
              <span>{event?.owner ?? "Service owner"}</span>
            </div>
            {event ? (
              <ol className="evidence-timeline">
                {event.timeline.map((entry, index) => (
                  <li
                    key={`${entry.time}-${entry.title}`}
                    className={
                      index === event.timeline.length - 1 ? "is-current" : ""
                    }
                  >
                    <span className="timeline-node" aria-hidden="true" />
                    <div>
                      <span className="timeline-time">{entry.time} UTC</span>
                      <strong>{entry.title}</strong>
                      <p>{entry.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="drawer-empty">
                No incident timeline is attached to this service yet. Open the
                linked trace to compare its spans.
              </p>
            )}
          </section>
          <section
            className="drawer-section"
            aria-labelledby="drawer-snippet-title"
          >
            <div className="drawer-section-head">
              <h3 id="drawer-snippet-title">Trace note</h3>
              <span>Read-only demo evidence</span>
            </div>
            <pre className="evidence-snippet">
              <code>
                <span className="code-muted">span.service</span> ={" "}
                <span className="code-string">
                  "
                  {service?.name ??
                    event?.affectedServices[0] ??
                    "checkout-api"}
                  "
                </span>
                <span className="code-muted">span.trace_id</span> ={" "}
                <span className="code-accent">
                  "{event?.traceId ?? subject.id}"
                </span>
                <span className="code-muted">latency.delta_ms</span> ={" "}
                <span className="code-warn">+91</span>
                <span className="code-muted">deploy.version</span> ={" "}
                <span className="code-string">
                  "{event?.deploy ?? "v2.18.0"}"
                </span>
              </code>
            </pre>
          </section>
          <div className="drawer-next-action">
            <span className="eyebrow">Suggested next step</span>
            <p>
              {service?.nextAction ??
                event?.nextAction ??
                "Compare the selected trace with the baseline."}
            </p>
          </div>
        </div>
        {event?.kind === "incident" ? (
          <footer className="drawer-footer">
            {isAcknowledged ? (
              <span className="drawer-feedback" role="status">
                <Icon name="check" size={14} />
                Acknowledged for this workspace
              </span>
            ) : (
              <span className="drawer-footer-note">
                Acknowledging keeps the incident visible in the log.
              </span>
            )}
            <button
              className={`button ${isAcknowledged ? "button-quiet" : "button-signal"}`}
              type="button"
              disabled={isAcknowledged}
              onClick={() => onAcknowledge(event)}
            >
              {isAcknowledged ? (
                <>
                  <Icon name="check" size={14} />
                  Acknowledged
                </>
              ) : (
                "Acknowledge incident"
              )}
            </button>
          </footer>
        ) : null}
      </aside>
    </>
  );
}

function App() {
  const [environment, setEnvironment] = useState<Environment>("production");
  const [timeRange, setTimeRange] = useState<TimeRange>("6h");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [productIdentity] = useState("Checkout");
  const [productMenuOpen, setProductMenuOpen] = useState(false);
  const [selectedIncidentId, setSelectedIncidentId] = useState("inc-218");
  const [selectedTraceId, setSelectedTraceId] = useState("tr_7fa2");
  const [selectedServiceId, setSelectedServiceId] = useState("checkout-api");
  const [drawerSubject, setDrawerSubject] = useState<DrawerSubject | null>(
    null,
  );
  const [acknowledged, setAcknowledged] = useState<Set<string>>(
    () => new Set(["inc-216"]),
  );
  const [serviceQuery, setServiceQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "attention" | "healthy"
  >("all");
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(
    null,
  );
  const [statusMessage, setStatusMessage] = useState(
    "Live checkout data refreshed at 14:16 UTC.",
  );
  const drawerTriggerRef = useRef<HTMLElement | null>(null);

  const meta = environmentMeta[environment];

  useEffect(() => {
    document.title = `${productIdentity} Observatory — Lattice Signal`;
  }, [productIdentity]);

  const announce = useCallback((message: string) => {
    setStatusMessage("");
    window.setTimeout(() => setStatusMessage(message), 20);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setDrawerSubject(null);
  }, []);

  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

  const openEvent = useCallback((item: FeedItem, trigger: HTMLElement) => {
    drawerTriggerRef.current = trigger;
    setSelectedIncidentId(item.kind === "change" ? "inc-218" : item.id);
    setSelectedTraceId(item.traceId);
    setSelectedServiceId(item.affectedServices[0] ?? "checkout-api");
    setDrawerSubject({ type: "event", id: item.id });
    setDrawerOpen(true);
  }, []);

  const openTrace = useCallback((span: TraceSpan, trigger: HTMLElement) => {
    drawerTriggerRef.current = trigger;
    setSelectedTraceId(span.traceId);
    if (span.incidentId) {
      setSelectedIncidentId(span.incidentId);
      setSelectedServiceId(span.service);
    }
    setDrawerSubject({ type: "trace", id: span.traceId });
    setDrawerOpen(true);
  }, []);

  const openService = useCallback((service: Service, trigger: HTMLElement) => {
    drawerTriggerRef.current = trigger;
    setSelectedServiceId(service.id);
    setDrawerSubject({ type: "service", id: service.id });
    setDrawerOpen(true);
  }, []);

  const handleAcknowledge = useCallback(
    (item: FeedItem) => {
      setAcknowledged((current) => {
        const next = new Set(current);
        next.add(item.id);
        return next;
      });
      announce(`${item.title} acknowledged for this workspace.`);
    },
    [announce],
  );

  const handleEnvironmentChange = (nextEnvironment: Environment) => {
    setEnvironment(nextEnvironment);
    announce(
      `Environment changed to ${environmentMeta[nextEnvironment].label}.`,
    );
  };

  const handleRangeChange = (nextRange: TimeRange) => {
    setTimeRange(nextRange);
    announce(`Time range changed to ${rangeMeta[nextRange].label}.`);
  };

  const handleExport = () => {
    const snapshot = `Lattice Signal — ${meta.label} checkout brief\n${meta.insight}\nAvailability ${meta.availability}, p95 ${meta.p95}, errors ${meta.errors}, error budget ${meta.budget} remaining.`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(snapshot).then(
        () => announce("Checkout brief copied to the clipboard."),
        () => announce("Checkout brief prepared for export in this demo."),
      );
    } else {
      announce("Checkout brief prepared for export in this demo.");
    }
  };

  return (
    <>
      <div className="app-shell">
        <DesktopRail />
        <div className="app-canvas">
          <header className="workspace-header">
            <div className="header-topline">
              <button
                className="mobile-menu-button"
                type="button"
                aria-label="Open navigation"
                aria-expanded={mobileNavOpen}
                onClick={() => setMobileNavOpen(true)}
              >
                <Icon name="menu" size={20} />
              </button>
              <div className="header-identity">
                <span className="header-kicker">Workspace /</span>
                <span className="header-product">{productIdentity}</span>
                <span className="header-separator" aria-hidden="true">
                  /
                </span>
                <span className="header-subproduct">Checkout health</span>
              </div>
              <div className="header-actions">
                <div className="product-switcher">
                  <button
                    className="product-switcher-button"
                    type="button"
                    aria-expanded={productMenuOpen}
                    aria-haspopup="menu"
                    onClick={() => setProductMenuOpen((current) => !current)}
                  >
                    <LogoMark />
                    <span>
                      <strong>Lattice Signal</strong>
                      <small>Checkout workspace</small>
                    </span>
                    <Icon name="chevron-down" size={14} />
                  </button>
                  {productMenuOpen ? (
                    <div
                      className="product-menu"
                      role="menu"
                      aria-label="Product workspaces"
                    >
                      <button
                        className="product-option is-current"
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setProductMenuOpen(false);
                          announce("Checkout is the active workspace.");
                        }}
                      >
                        <span className="workspace-dot">C</span>
                        <span>
                          <strong>Checkout</strong>
                          <small>Payments · active</small>
                        </span>
                        <Icon name="check" size={14} />
                      </button>
                      <button
                        className="product-option"
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setProductMenuOpen(false);
                          announce(
                            "Identity workspace is not included in this demo.",
                          );
                        }}
                      >
                        <span className="workspace-dot muted">I</span>
                        <span>
                          <strong>Identity</strong>
                          <small>Preview workspace</small>
                        </span>
                      </button>
                      <button
                        className="product-option"
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setProductMenuOpen(false);
                          announce(
                            "Catalog workspace is not included in this demo.",
                          );
                        }}
                      >
                        <span className="workspace-dot muted">C</span>
                        <span>
                          <strong>Catalog</strong>
                          <small>Preview workspace</small>
                        </span>
                      </button>
                    </div>
                  ) : null}
                </div>
                <span className="freshness">
                  <span className="live-indicator" aria-hidden="true" />
                  Fresh 14:16 UTC
                </span>
                <button
                  className="icon-button header-icon"
                  type="button"
                  aria-label="View alert center"
                  onClick={() => {
                    document
                      .getElementById("incidents")
                      ?.scrollIntoView({ behavior: "smooth" });
                    announce(
                      "Alert center is represented by the incident log below.",
                    );
                  }}
                >
                  <Icon name="bell" size={16} />
                  <span className="notification-dot" aria-hidden="true" />
                </button>
                <button
                  className="avatar"
                  type="button"
                  aria-label="Open MK profile menu"
                  onClick={() =>
                    announce("Profile menu is not included in this demo.")
                  }
                >
                  MK
                </button>
              </div>
            </div>
            <div className="workspace-controls">
              <label className="select-control">
                <span>Environment</span>
                <select
                  value={environment}
                  onChange={(event) =>
                    handleEnvironmentChange(event.target.value as Environment)
                  }
                >
                  <option value="production">Production</option>
                  <option value="staging">Staging</option>
                  <option value="canary">Canary</option>
                </select>
                <Icon name="chevron-down" size={14} />
              </label>
              <div className="header-context">
                <span className="context-label">Region</span>
                <strong>{meta.region}</strong>
              </div>
              <label className="select-control range-control">
                <span>Time range</span>
                <select
                  value={timeRange}
                  onChange={(event) =>
                    handleRangeChange(event.target.value as TimeRange)
                  }
                >
                  <option value="6h">Last 6 hours</option>
                  <option value="24h">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
                </select>
                <Icon name="chevron-down" size={14} />
              </label>
              <button
                className="button button-quiet export-button"
                type="button"
                onClick={handleExport}
              >
                <Icon name="arrow-up-right" size={14} />
                Copy brief
              </button>
            </div>
          </header>

          <main className="workspace-main" id="overview">
            <section className="insight-band" aria-labelledby="insight-title">
              <div className="insight-index">
                <span className="eyebrow">Live operational read</span>
                <span className="insight-line" aria-hidden="true" />
                <span>01</span>
              </div>
              <div className="insight-copy">
                <h1 id="insight-title">{meta.insight}</h1>
                <p>{meta.detail}</p>
              </div>
              <div className="insight-status">
                <span className="status-stamp">
                  <span
                    className="status-dot status-healthy"
                    aria-hidden="true"
                  />
                  {meta.label} / nominal
                </span>
                <span>{rangeMeta[timeRange].window}</span>
              </div>
            </section>

            <section
              className="kpi-grid"
              aria-label={`${meta.label} checkout health metrics`}
            >
              <KpiCard
                label="Availability"
                value={meta.availability}
                detail="30-day rolling SLO"
                delta={meta.availabilityDelta}
                tone={meta.availabilityTone}
                trend={[98, 98.7, 99.1, 98.9, 99.5, 99.6, 99.8]}
              />
              <KpiCard
                label="p95 latency"
                value={meta.p95}
                detail="Checkout request"
                delta={meta.p95Delta}
                tone={meta.p95Tone}
                trend={[45, 48, 47, 55, 58, 69, 77]}
              />
              <KpiCard
                label="Error rate"
                value={meta.errors}
                detail="Across checkout"
                delta={meta.errorsDelta}
                tone={meta.errorsTone}
                trend={[34, 30, 32, 22, 19, 15, 13]}
              />
              <KpiCard
                label="Error budget"
                value={`${meta.budget} left`}
                detail="Current period"
                delta={meta.budgetDelta}
                tone={meta.budgetTone}
                progress={Number.parseInt(meta.budget, 10)}
                trend={[
                  78,
                  76,
                  74,
                  73,
                  72,
                  72,
                  Number.parseInt(meta.budget, 10),
                ]}
              />
            </section>

            <TraceDesk
              selectedTraceId={selectedTraceId}
              selectedIncidentId={selectedIncidentId}
              onSelectSpan={openTrace}
              onOpenIncident={openEvent}
            />

            <div className="analysis-grid">
              <ChartPanel
                environment={environment}
                timeRange={timeRange}
                onOpenIncident={openEvent}
              />
              <IncidentFeed
                selectedIncidentId={selectedIncidentId}
                acknowledged={acknowledged}
                onSelect={openEvent}
                onAcknowledge={handleAcknowledge}
              />
            </div>

            <ServiceEvidence
              environment={environment}
              query={serviceQuery}
              onQueryChange={setServiceQuery}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              selectedServiceId={selectedServiceId}
              expandedServiceId={expandedServiceId}
              onToggleExpanded={(id) =>
                setExpandedServiceId((current) => (current === id ? null : id))
              }
              onSelectService={openService}
              onClear={() => setServiceQuery("")}
            />
          </main>
          <footer className="workspace-footer">
            <span>Lattice Signal / Checkout workspace</span>
            <span>
              {rangeMeta[timeRange].suffix} · demo data · no telemetry leaves
              this browser
            </span>
          </footer>
        </div>
      </div>
      <MobileNavigation open={mobileNavOpen} onClose={closeMobileNav} />
      <EvidenceDrawer
        open={drawerOpen}
        subject={drawerSubject}
        acknowledged={acknowledged}
        onClose={closeDrawer}
        onAcknowledge={handleAcknowledge}
      />
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {statusMessage}
      </div>
    </>
  );
}

export default App;
