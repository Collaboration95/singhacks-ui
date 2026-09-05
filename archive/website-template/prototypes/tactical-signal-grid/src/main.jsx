import { StrictMode, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const NAV_ITEMS = [
  { label: "Overview", icon: "grid", href: "#overview" },
  { label: "Incidents", icon: "activity", href: "#incident-queue" },
  { label: "Services", icon: "server", href: "#service-evidence" },
  { label: "Deploys", icon: "deploy", href: "#service-evidence" },
  { label: "Traces", icon: "trace", href: "#anomaly-ribbon" },
];

const SECONDARY_NAV_ITEMS = [
  { label: "Runbooks", icon: "book", href: "#incident-queue" },
  { label: "Settings", icon: "settings", href: "#overview" },
];

const INCIDENTS = [
  {
    id: "INC-284",
    severity: "warning",
    severityLabel: "SEV-2",
    state: "Live",
    stateTone: "warning",
    title: "Payment auth latency over threshold",
    service: "payments-api",
    window: "11:42–12:18",
    updated: "now",
    ribbonStart: 432,
    ribbonEnd: 636,
    summary:
      "p95 authorization latency is holding above the 450 ms SLO threshold in us-east-1. The regression started after the 12:06 UTC payments-api deploy.",
    affected: ["payments-api", "checkout-web", "order-orchestrator"],
    timeline: [
      {
        time: "12:18 UTC",
        actor: "Signal monitor",
        event: "Threshold sustained for 38 minutes",
        detail: "p95 528 ms · error rate 1.8%",
        tone: "warning",
      },
      {
        time: "12:06 UTC",
        actor: "Deploy system",
        event: "payments-api v2026.09.04.7 rolled out",
        detail: "25% canary → 100% · us-east-1",
        tone: "info",
      },
      {
        time: "11:42 UTC",
        actor: "Signal monitor",
        event: "Regression opened from baseline drift",
        detail: "baseline 241 ms · threshold 450 ms",
        tone: "danger",
      },
    ],
    evidence: [
      "gateway.route=POST /v1/authorize",
      "region=us-east-1 · cohort=card-present",
      "trace.sample=tr_7f92…a81c · p95=528ms",
    ],
  },
  {
    id: "INC-281",
    severity: "danger",
    severityLabel: "SEV-1",
    state: "Acknowledged",
    stateTone: "success",
    title: "Checkout error spike contained",
    service: "order-orchestrator",
    window: "09:16–09:31",
    updated: "42m ago",
    ribbonStart: 228,
    ribbonEnd: 326,
    summary:
      "A short-lived order creation spike was contained by the retry budget. No new errors have been observed for 42 minutes.",
    affected: ["order-orchestrator", "checkout-web"],
    timeline: [
      {
        time: "09:31 UTC",
        actor: "Maya Chen",
        event: "Incident acknowledged",
        detail: "Retry budget returned below 10%",
        tone: "success",
      },
      {
        time: "09:24 UTC",
        actor: "Signal monitor",
        event: "Error rate peaked at 4.2%",
        detail: "POST /v1/orders · us-west-2",
        tone: "danger",
      },
    ],
    evidence: [
      "gateway.route=POST /v1/orders",
      "region=us-west-2 · retry_budget=healthy",
      "trace.sample=tr_6a10…b201 · status=resolved",
    ],
  },
  {
    id: "INC-279",
    severity: "info",
    severityLabel: "SEV-3",
    state: "Monitoring",
    stateTone: "info",
    title: "Webhook delivery retries elevated",
    service: "notification-worker",
    window: "08:02–now",
    updated: "1h ago",
    ribbonStart: 126,
    ribbonEnd: 196,
    summary:
      "Partner webhook responses are slower than the seven-day baseline, but delivery remains inside the recovery window.",
    affected: ["notification-worker", "payments-api"],
    timeline: [
      {
        time: "11:11 UTC",
        actor: "Signal monitor",
        event: "Retry volume remains above baseline",
        detail: "+18% retries · delivery SLO intact",
        tone: "info",
      },
      {
        time: "10:42 UTC",
        actor: "On-call rotation",
        event: "Monitoring note added",
        detail: "Partner endpoint review queued",
        tone: "success",
      },
    ],
    evidence: [
      "queue=partner-webhooks · age_p95=94s",
      "region=global · provider=acme-payments",
      "trace.sample=tr_4c09…e77d · retry=2",
    ],
  },
];

const SERVICE_ROWS = [
  {
    name: "payments-api",
    role: "Critical path · authorization",
    owner: "Jules Chen",
    initials: "JC",
    deploy: "api-2026.09.04.7",
    deployTime: "12:06 UTC",
    status: "failing",
    statusLabel: "Failing",
    nextAction: "Inspect regression",
    incidentId: "INC-284",
    source: "APM",
  },
  {
    name: "order-orchestrator",
    role: "Critical path · order create",
    owner: "Maya Chen",
    initials: "MC",
    deploy: "orders-2026.09.04.3",
    deployTime: "09:02 UTC",
    status: "degraded",
    statusLabel: "Degraded",
    nextAction: "Open incident",
    incidentId: "INC-281",
    source: "Logs",
  },
  {
    name: "checkout-web",
    role: "Edge · checkout shell",
    owner: "Noah Patel",
    initials: "NP",
    deploy: "web-2026.09.04.2",
    deployTime: "10:18 UTC",
    status: "healthy",
    statusLabel: "Healthy",
    nextAction: "Trace path",
    incidentId: "INC-284",
    source: "RUM",
  },
  {
    name: "risk-engine",
    role: "Decisioning · fraud checks",
    owner: "Rina Okafor",
    initials: "RO",
    deploy: "risk-2026.09.03.8",
    deployTime: "Yesterday",
    status: "healthy",
    statusLabel: "Healthy",
    nextAction: "No action",
    source: "APM",
  },
  {
    name: "notification-worker",
    role: "Async · partner webhooks",
    owner: "Sam Rivera",
    initials: "SR",
    deploy: "worker-2026.09.04.1",
    deployTime: "08:44 UTC",
    status: "degraded",
    statusLabel: "Degraded",
    nextAction: "Review retries",
    incidentId: "INC-279",
    source: "Queue",
  },
  {
    name: "session-edge",
    role: "Edge · session handoff",
    owner: "Lea Fischer",
    initials: "LF",
    deploy: "edge-2026.09.02.5",
    deployTime: "Sep 2",
    status: "healthy",
    statusLabel: "Healthy",
    nextAction: "No action",
    source: "RUM",
  },
];

const ENVIRONMENT_DATA = {
  production: {
    label: "Production",
    statusLabel: "LIVE / PRODUCTION",
    headline: "Checkout is healthy, with one regression worth opening.",
    copy: "Payment authorization p95 has held above the 450 ms threshold for 38 minutes. The path is contained to us-east-1.",
    tone: "warning",
    indicator: "1 active regression",
  },
  staging: {
    label: "Staging",
    statusLabel: "STABLE / STAGING",
    headline: "Staging is within thresholds; production signal stays visible.",
    copy: "No new regression is present in the staging checkout path. Use the queue below to review the production signal before promoting.",
    tone: "success",
    indicator: "0 staging regressions",
  },
  preview: {
    label: "Preview",
    statusLabel: "OBSERVE / PREVIEW",
    headline: "Preview is quiet; the production regression remains contained.",
    copy: "Synthetic checkout traffic is below the incident threshold. Compare the selected production window before shipping the next candidate.",
    tone: "info",
    indicator: "preview sample",
  },
};

const METRICS = {
  production: [
    {
      label: "Availability",
      value: "99.94%",
      delta: "+0.02%",
      hint: "vs. 7-day baseline",
      tone: "success",
      data: [82, 84, 83, 87, 89, 91, 95],
    },
    {
      label: "p95 latency",
      value: "428 ms",
      delta: "+86 ms",
      hint: "threshold 450 ms",
      tone: "warning",
      data: [38, 42, 39, 47, 52, 61, 74],
    },
    {
      label: "Error rate",
      value: "1.8%",
      delta: "+0.7 pts",
      hint: "checkout path",
      tone: "danger",
      data: [26, 23, 30, 28, 38, 42, 50],
    },
    {
      label: "Error budget",
      value: "62%",
      delta: "14m burned",
      hint: "remaining this window",
      tone: "warning",
      data: [76, 73, 70, 68, 66, 64, 62],
    },
  ],
  staging: [
    {
      label: "Availability",
      value: "99.99%",
      delta: "+0.01%",
      hint: "vs. 7-day baseline",
      tone: "success",
      data: [84, 85, 86, 88, 90, 92, 96],
    },
    {
      label: "p95 latency",
      value: "238 ms",
      delta: "−14 ms",
      hint: "threshold 450 ms",
      tone: "success",
      data: [46, 44, 42, 41, 39, 38, 37],
    },
    {
      label: "Error rate",
      value: "0.2%",
      delta: "−0.1 pts",
      hint: "checkout path",
      tone: "success",
      data: [38, 35, 32, 30, 28, 25, 22],
    },
    {
      label: "Error budget",
      value: "91%",
      delta: "+6 pts",
      hint: "remaining this window",
      tone: "success",
      data: [72, 77, 80, 83, 85, 88, 91],
    },
  ],
  preview: [
    {
      label: "Availability",
      value: "100%",
      delta: "steady",
      hint: "synthetic path",
      tone: "success",
      data: [87, 88, 88, 89, 90, 90, 91],
    },
    {
      label: "p95 latency",
      value: "204 ms",
      delta: "−48 ms",
      hint: "threshold 450 ms",
      tone: "success",
      data: [64, 59, 57, 53, 49, 45, 42],
    },
    {
      label: "Error rate",
      value: "0.0%",
      delta: "steady",
      hint: "no failed samples",
      tone: "success",
      data: [12, 12, 11, 11, 10, 10, 10],
    },
    {
      label: "Error budget",
      value: "100%",
      delta: "full",
      hint: "remaining this window",
      tone: "success",
      data: [89, 91, 93, 94, 96, 98, 100],
    },
  ],
};

const TREND_DATA = {
  "24h": {
    labels: ["00", "04", "08", "12", "16", "20", "now"],
    current: [236, 218, 282, 412, 528, 492, 428],
    baseline: [248, 234, 264, 328, 388, 362, 344],
    incidentStart: 354,
    incidentEnd: 560,
  },
  "6h": {
    labels: ["−6h", "−5h", "−4h", "−3h", "−2h", "−1h", "now"],
    current: [286, 302, 338, 468, 542, 516, 428],
    baseline: [274, 278, 286, 304, 318, 326, 332],
    incidentStart: 354,
    incidentEnd: 590,
  },
  "7d": {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    current: [312, 328, 306, 352, 382, 405, 428],
    baseline: [298, 304, 302, 310, 318, 326, 335],
    incidentStart: 570,
    incidentEnd: 684,
  },
};

function Icon({ name, size = 16 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.7",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
    focusable: "false",
  };

  const paths = {
    menu: (
      <>
        <path d="M4 7h16" />
        <path d="M4 12h16" />
        <path d="M4 17h16" />
      </>
    ),
    grid: (
      <>
        <rect x="4" y="4" width="6" height="6" />
        <rect x="14" y="4" width="6" height="6" />
        <rect x="4" y="14" width="6" height="6" />
        <rect x="14" y="14" width="6" height="6" />
      </>
    ),
    activity: (
      <>
        <path d="M3 12h4l2.2-6 4.3 12 2.2-6H21" />
      </>
    ),
    server: (
      <>
        <rect x="4" y="4" width="16" height="6" rx="1" />
        <rect x="4" y="14" width="16" height="6" rx="1" />
        <path d="M8 7h.01M8 17h.01M12 7h5M12 17h5" />
      </>
    ),
    deploy: (
      <>
        <path d="M12 3v13" />
        <path d="m7 8 5-5 5 5" />
        <path d="M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
      </>
    ),
    trace: (
      <>
        <circle cx="6" cy="6" r="2" />
        <circle cx="18" cy="12" r="2" />
        <circle cx="7" cy="19" r="2" />
        <path d="m8 7 8 4M16.5 13.5 8.5 18" />
      </>
    ),
    book: (
      <>
        <path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v17H7.5A2.5 2.5 0 0 0 5 21.5z" />
        <path d="M5 4.5v17M9 6h7M9 10h7" />
      </>
    ),
    settings: (
      <>
        <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
        <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.5-2.4 1a7 7 0 0 0-2-1.2L14.2 3h-4.1l-.4 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.5 2 1.5A7 7 0 0 0 5.2 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.5 2.4-1a7 7 0 0 0 2 1.2l.4 2.6h4.1l.4-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.5-2-1.5c.1-.4.1-.8.1-1.2Z" />
      </>
    ),
    search: (
      <>
        <circle cx="10.8" cy="10.8" r="6.5" />
        <path d="m16 16 4.5 4.5" />
      </>
    ),
    x: (
      <>
        <path d="m6 6 12 12M18 6 6 18" />
      </>
    ),
    "chevron-down": <path d="m7 10 5 5 5-5" />,
    "chevron-right": <path d="m9 6 6 6-6 6" />,
    download: (
      <>
        <path d="M12 3v12" />
        <path d="m7 10 5 5 5-5" />
        <path d="M4 20h16" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    "alert-triangle": (
      <>
        <path d="m12 3 9 17H3L12 3Z" />
        <path d="M12 9v4M12 17h.01" />
      </>
    ),
    "arrow-up-right": (
      <>
        <path d="M7 17 17 7M9 7h8v8" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    filter: (
      <>
        <path d="M4 6h16M7 12h10M10 18h4" />
      </>
    ),
    pulse: (
      <>
        <path d="M3 12h4l2-6 4 12 2-6h6" />
      </>
    ),
    layers: (
      <>
        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
        <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
      </>
    ),
    eye: (
      <>
        <path d="M3 12s3.2-5 9-5 9 5 9 5-3.2 5-9 5-9-5-9-5Z" />
        <circle cx="12" cy="12" r="2" />
      </>
    ),
  };

  return <svg {...common}>{paths[name] ?? paths.grid}</svg>;
}

function Sparkline({ data, tone }) {
  const width = 92;
  const height = 28;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - 3 - ((value - min) / range) * (height - 8);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      className={`sparkline sparkline-${tone}`}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
    >
      <polyline points={points} fill="none" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function SideRail({
  activeNav,
  mobileOpen,
  onClose,
  onNavigate,
  closeRef,
  railRef,
}) {
  const renderNav = (items) => (
    <ul className="rail-nav-list">
      {items.map((item) => (
        <li key={item.label}>
          <a
            href={item.href}
            className={`rail-link ${activeNav === item.label ? "is-active" : ""}`}
            aria-current={activeNav === item.label ? "page" : undefined}
            onClick={() => onNavigate(item.label)}
          >
            <Icon name={item.icon} size={16} />
            <span>{item.label}</span>
            {item.label === "Incidents" ? (
              <span className="rail-count">3</span>
            ) : null}
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      ref={railRef}
      className={`side-rail ${mobileOpen ? "is-mobile-open" : ""}`}
      aria-label="Primary navigation"
      onKeyDown={(event) => {
        if (event.key === "Escape" && mobileOpen) onClose();
        if (event.key !== "Tab" || !mobileOpen) return;
        const focusable = event.currentTarget.querySelectorAll(
          "a[href], button:not([disabled])",
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }}
    >
      <div className="rail-head">
        <a
          className="brand-lockup"
          href="#overview"
          onClick={() => onNavigate("Overview")}
        >
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className="brand-wordmark">Lattice Signal</span>
        </a>
        <button
          ref={closeRef}
          className="icon-button rail-close"
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
        >
          <Icon name="x" />
        </button>
      </div>

      <div className="rail-context">
        <span className="rail-context-label">Workspace</span>
        <strong>checkout / core</strong>
        <span className="rail-context-meta">
          <span className="state-dot state-success" /> production stream
        </span>
      </div>

      <div className="rail-section">
        <span className="rail-section-label">Control surface</span>
        <nav>{renderNav(NAV_ITEMS)}</nav>
      </div>

      <div className="rail-section rail-section-secondary">
        <span className="rail-section-label">Reference</span>
        <nav>{renderNav(SECONDARY_NAV_ITEMS)}</nav>
      </div>

      <div className="rail-foot">
        <div className="rail-foot-rule" />
        <span className="rail-section-label">On-call context</span>
        <div className="on-call-row">
          <span className="avatar avatar-lime">MC</span>
          <span>
            <strong>Maya Chen</strong>
            <small>Primary · UTC−5</small>
          </span>
          <span className="presence-dot" aria-label="Maya Chen is online" />
        </div>
        <span className="rail-foot-meta">
          <Icon name="clock" size={13} /> next handoff in 02:14:08
        </span>
      </div>
    </aside>
  );
}

function CommandHeader({
  environment,
  setEnvironment,
  range,
  setRange,
  onExport,
  onOpenMenu,
  menuOpen,
  menuButtonRef,
}) {
  return (
    <header className="command-header">
      <div className="mobile-header-start">
        <button
          ref={menuButtonRef}
          className="icon-button mobile-menu-button"
          type="button"
          aria-label="Open navigation"
          aria-expanded={menuOpen}
          onClick={onOpenMenu}
        >
          <Icon name="menu" />
        </button>
        <span className="mobile-wordmark">Lattice Signal</span>
      </div>

      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li>
            <a href="#overview">Signal control</a>
          </li>
          <li>
            <a href="#overview">Checkout</a>
          </li>
          <li aria-current="page">Overview</li>
        </ol>
      </nav>

      <div className="header-actions">
        <div className="select-control">
          <label htmlFor="environment-select">Environment</label>
          <select
            id="environment-select"
            aria-label="Environment"
            value={environment}
            onChange={(event) => setEnvironment(event.target.value)}
          >
            <option value="production">Production</option>
            <option value="staging">Staging</option>
            <option value="preview">Preview</option>
          </select>
        </div>
        <div className="select-control range-control">
          <label htmlFor="range-select">Time range</label>
          <select
            id="range-select"
            aria-label="Time range"
            value={range}
            onChange={(event) => setRange(event.target.value)}
          >
            <option value="24h">Last 24 hours</option>
            <option value="6h">Last 6 hours</option>
            <option value="7d">Last 7 days</option>
          </select>
        </div>
        <div
          className="freshness"
          aria-label="Data is live, updated 14 seconds ago"
        >
          <span className="freshness-dot" />
          <span>Live</span>
          <span className="freshness-time">14s ago</span>
        </div>
        <button
          className="button button-ghost export-button"
          type="button"
          onClick={onExport}
        >
          <Icon name="download" size={15} />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
}

function StatusBanner({ environmentData, onInspect }) {
  return (
    <section
      className={`status-banner status-${environmentData.tone}`}
      aria-labelledby="status-heading"
    >
      <div className="status-signal" aria-hidden="true">
        <span className="status-signal-ring" />
        <span className="status-signal-core" />
      </div>
      <div className="status-copy">
        <div className="eyebrow-row">
          <span className="eyebrow">
            System status / {environmentData.statusLabel}
          </span>
          <span className={`semantic-tag tag-${environmentData.tone}`}>
            <span className="tag-dot" />
            {environmentData.indicator}
          </span>
        </div>
        <h1 id="status-heading">{environmentData.headline}</h1>
        <p>{environmentData.copy}</p>
        <div className="status-facts">
          <span>
            <span className="state-dot state-success" /> 5 of 6 services nominal
          </span>
          <span>
            <span className="state-dot state-warning" /> us-east-1 elevated
          </span>
          <span>
            <Icon name="clock" size={13} /> Last evaluated 12:20:14 UTC
          </span>
        </div>
      </div>
      <div className="status-action">
        <span className="status-action-label">
          <span className="live-pulse" /> remediation path ready
        </span>
        <button
          className="button button-dark"
          type="button"
          onClick={onInspect}
        >
          Inspect regression
          <Icon name="arrow-up-right" size={15} />
        </button>
      </div>
    </section>
  );
}

function KpiCard({ metric }) {
  return (
    <article className="kpi-card">
      <div className="kpi-topline">
        <span className="eyebrow">{metric.label}</span>
        <span className={`delta delta-${metric.tone}`}>{metric.delta}</span>
      </div>
      <strong className="kpi-value">{metric.value}</strong>
      <div className="kpi-bottomline">
        <span>{metric.hint}</span>
        <Sparkline data={metric.data} tone={metric.tone} />
      </div>
    </article>
  );
}

function KpiGrid({ metrics }) {
  return (
    <section
      className="kpi-grid"
      aria-label="Checkout key performance indicators"
    >
      {metrics.map((metric) => (
        <KpiCard key={metric.label} metric={metric} />
      ))}
    </section>
  );
}

function chartPath(
  values,
  width,
  height,
  maxValue = 620,
  padding = { left: 48, right: 16, top: 18, bottom: 38 },
) {
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  return values
    .map((value, index) => {
      const x = padding.left + (index / (values.length - 1)) * plotWidth;
      const y = padding.top + plotHeight - (value / maxValue) * plotHeight;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function TrendChart({ range }) {
  const data = TREND_DATA[range];
  const width = 760;
  const height = 306;
  const padding = { left: 48, right: 18, top: 20, bottom: 42 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const thresholdY = padding.top + plotHeight - (450 / 620) * plotHeight;
  const currentPath = chartPath(data.current, width, height, 620, padding);
  const baselinePath = chartPath(data.baseline, width, height, 620, padding);
  const currentEndX = padding.left + plotWidth;
  const currentEndY =
    padding.top +
    plotHeight -
    (data.current[data.current.length - 1] / 620) * plotHeight;
  const gridValues = [0, 150, 300, 450, 600];

  return (
    <article className="panel trend-panel" aria-labelledby="trend-heading">
      <div className="panel-head trend-panel-head">
        <div>
          <span className="eyebrow">Latency telemetry / p95</span>
          <h2 id="trend-heading">Observed against threshold</h2>
        </div>
        <span className="threshold-label">
          <span className="threshold-swatch" /> threshold 450 ms
        </span>
      </div>
      <div className="trend-stats" aria-label="Current latency summary">
        <span>
          <strong>428 ms</strong> current
        </span>
        <span>
          <strong>344 ms</strong> baseline
        </span>
        <span>
          <strong>+84 ms</strong> drift
        </span>
      </div>
      <figure className="chart-figure">
        <svg
          className="trend-chart"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-labelledby="trend-chart-title trend-chart-desc"
        >
          <title id="trend-chart-title">
            p95 latency compared with seven-day baseline
          </title>
          <desc id="trend-chart-desc">
            The observed line crosses the 450 millisecond threshold during the
            selected incident window while the baseline remains below it.
          </desc>
          <rect
            x={data.incidentStart}
            y={padding.top}
            width={data.incidentEnd - data.incidentStart}
            height={plotHeight}
            className="chart-incident-band"
          />
          {gridValues.map((value) => {
            const y = padding.top + plotHeight - (value / 620) * plotHeight;
            return (
              <g key={value}>
                <line
                  x1={padding.left}
                  x2={currentEndX}
                  y1={y}
                  y2={y}
                  className={
                    value === 450 ? "chart-threshold-line" : "chart-grid-line"
                  }
                />
                <text
                  x={padding.left - 12}
                  y={y + 4}
                  textAnchor="end"
                  className="chart-axis-label"
                >
                  {value}
                </text>
              </g>
            );
          })}
          <line
            x1={padding.left}
            x2={currentEndX}
            y1={thresholdY}
            y2={thresholdY}
            className="chart-threshold-line"
          />
          <path d={baselinePath} className="chart-baseline" />
          <path d={currentPath} className="chart-current" />
          <circle
            cx={currentEndX}
            cy={currentEndY}
            r="5"
            className="chart-current-dot"
          />
          <text
            x={data.incidentStart + 10}
            y={padding.top + 19}
            className="chart-window-label"
          >
            INC-284 / LIVE
          </text>
          <text
            x={currentEndX - 4}
            y={thresholdY - 8}
            textAnchor="end"
            className="chart-threshold-label"
          >
            450 ms limit
          </text>
          {data.labels.map((label, index) => {
            const x =
              padding.left + (index / (data.labels.length - 1)) * plotWidth;
            return (
              <text
                key={label}
                x={x}
                y={height - 13}
                textAnchor="middle"
                className="chart-axis-label"
              >
                {label}
              </text>
            );
          })}
        </svg>
        <figcaption className="chart-legend">
          <span>
            <i className="legend-line legend-line-current" /> observed
          </span>
          <span>
            <i className="legend-line legend-line-baseline" /> 7-day baseline
          </span>
          <span>
            <i className="legend-window" /> selected incident window
          </span>
        </figcaption>
      </figure>
    </article>
  );
}

function BreakdownPanel() {
  return (
    <article
      className="panel breakdown-panel"
      aria-labelledby="breakdown-heading"
    >
      <div className="panel-head">
        <div>
          <span className="eyebrow">Signal composition</span>
          <h2 id="breakdown-heading">Severity / source</h2>
        </div>
        <span className="panel-meta">last 24h</span>
      </div>
      <div className="breakdown-total">
        <strong>17</strong>
        <span>signals in checkout path</span>
      </div>
      <div className="breakdown-section">
        <div className="breakdown-section-head">
          <span className="eyebrow">By severity</span>
          <span className="breakdown-note">active first</span>
        </div>
        <div className="severity-stack" aria-label="Severity distribution">
          <span
            className="severity-segment severity-danger"
            style={{ width: "9%" }}
            title="1 critical"
          />
          <span
            className="severity-segment severity-warning"
            style={{ width: "28%" }}
            title="4 warnings"
          />
          <span
            className="severity-segment severity-info"
            style={{ width: "63%" }}
            title="12 informational"
          />
        </div>
        <div className="breakdown-rows">
          <div>
            <span className="breakdown-label">
              <i className="dot dot-danger" /> Critical
            </span>
            <strong>1</strong>
            <span>9%</span>
          </div>
          <div>
            <span className="breakdown-label">
              <i className="dot dot-warning" /> Warning
            </span>
            <strong>4</strong>
            <span>24%</span>
          </div>
          <div>
            <span className="breakdown-label">
              <i className="dot dot-info" /> Info
            </span>
            <strong>12</strong>
            <span>67%</span>
          </div>
        </div>
      </div>
      <div className="breakdown-section source-section">
        <div className="breakdown-section-head">
          <span className="eyebrow">By source</span>
          <span className="breakdown-note">ingestion share</span>
        </div>
        <div className="source-rows">
          <div className="source-row">
            <span>
              <i className="source-marker source-apm" /> APM
            </span>
            <strong>44%</strong>
          </div>
          <div className="source-row">
            <span>
              <i className="source-marker source-rum" /> RUM
            </span>
            <strong>31%</strong>
          </div>
          <div className="source-row">
            <span>
              <i className="source-marker source-logs" /> Logs + queue
            </span>
            <strong>25%</strong>
          </div>
        </div>
      </div>
      <div className="breakdown-foot">
        <span className="state-dot state-warning" /> 1 signal needs an operator
      </div>
    </article>
  );
}

function AnalysisGrid({ range }) {
  return (
    <section className="analysis-grid" aria-label="Checkout signal analysis">
      <TrendChart range={range} />
      <BreakdownPanel />
    </section>
  );
}

function AnomalyRibbon({ range, incident, onOpen }) {
  const data = TREND_DATA[range];
  const width = 920;
  const height = 166;
  const plotLeft = 18;
  const plotRight = 902;
  const plotTop = 24;
  const plotBottom = 124;
  const plotWidth = plotRight - plotLeft;
  const current = data.current;
  const baseline = data.baseline;
  const linePath = current
    .map((value, index) => {
      const x = plotLeft + (index / (current.length - 1)) * plotWidth;
      const y = plotBottom - (value / 620) * (plotBottom - plotTop);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
  const baselinePath = baseline
    .map((value, index) => {
      const x = plotLeft + (index / (baseline.length - 1)) * plotWidth;
      const y = plotBottom - (value / 620) * (plotBottom - plotTop);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
  const thresholdY = plotBottom - (450 / 620) * (plotBottom - plotTop);
  const incidentStart = incident?.ribbonStart ?? data.incidentStart;
  const incidentEnd = incident?.ribbonEnd ?? data.incidentEnd;
  const lastValue = current[current.length - 1];
  const lastY = plotBottom - (lastValue / 620) * (plotBottom - plotTop);

  return (
    <section
      id="anomaly-ribbon"
      className="anomaly-card"
      aria-labelledby="anomaly-heading"
    >
      <div className="anomaly-head">
        <div>
          <div className="eyebrow-row">
            <span className="eyebrow eyebrow-bright">
              <span className="live-pulse" /> Live anomaly ribbon
            </span>
            <span className="stream-label">streaming 4 signals</span>
          </div>
          <h2 id="anomaly-heading">The signal has a shape</h2>
          <p>
            Baseline, limit, and selected incident window stay in one line of
            sight.
          </p>
        </div>
        <div className="anomaly-readout">
          <span className="eyebrow">Selected incident</span>
          <strong>{incident?.id ?? "INC-284"}</strong>
          <span>
            {incident?.service ?? "payments-api"} ·{" "}
            {incident?.window ?? "11:42–12:18"}
          </span>
        </div>
      </div>
      <figure className="ribbon-figure">
        <svg
          className="ribbon-chart"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-labelledby="ribbon-title ribbon-desc"
        >
          <title id="ribbon-title">
            Live anomaly ribbon for {incident?.id ?? "INC-284"}
          </title>
          <desc id="ribbon-desc">
            A pale baseline, lime threshold marker, and observed signal rise
            through the selected incident window.
          </desc>
          <rect
            x={plotLeft}
            y={plotTop}
            width={plotWidth}
            height={plotBottom - plotTop}
            className="ribbon-track"
          />
          <rect
            x={incidentStart}
            y={plotTop}
            width={incidentEnd - incidentStart}
            height={plotBottom - plotTop}
            className="ribbon-selected-window"
          />
          {[0, 1, 2, 3, 4, 5, 6].map((tick) => {
            const x = plotLeft + (tick / 6) * plotWidth;
            return (
              <line
                key={tick}
                x1={x}
                x2={x}
                y1={plotTop}
                y2={plotBottom}
                className="ribbon-grid-line"
              />
            );
          })}
          <line
            x1={plotLeft}
            x2={plotRight}
            y1={thresholdY}
            y2={thresholdY}
            className="ribbon-threshold"
          />
          <line
            x1={plotLeft}
            x2={plotRight}
            y1={plotBottom - (320 / 620) * (plotBottom - plotTop)}
            y2={plotBottom - (320 / 620) * (plotBottom - plotTop)}
            className="ribbon-baseline-guide"
          />
          <path d={baselinePath} className="ribbon-baseline" />
          <path d={linePath} className="ribbon-signal" />
          <circle cx={plotRight} cy={lastY} r="5" className="ribbon-live-dot" />
          <line
            x1={incidentStart}
            x2={incidentStart}
            y1={plotTop - 7}
            y2={plotBottom + 8}
            className="ribbon-window-edge"
          />
          <line
            x1={incidentEnd}
            x2={incidentEnd}
            y1={plotTop - 7}
            y2={plotBottom + 8}
            className="ribbon-window-edge"
          />
          <text
            x={incidentStart + 10}
            y={plotTop + 17}
            className="ribbon-window-label"
          >
            {incident?.id ?? "INC-284"} /{" "}
            {incident?.state?.toUpperCase() ?? "LIVE"}
          </text>
          <text
            x={plotRight - 4}
            y={thresholdY - 7}
            textAnchor="end"
            className="ribbon-threshold-label"
          >
            450 ms threshold
          </text>
          <text x={plotLeft} y={height - 15} className="ribbon-axis-label">
            −24h
          </text>
          <text
            x={plotRight}
            y={height - 15}
            textAnchor="end"
            className="ribbon-axis-label"
          >
            now
          </text>
        </svg>
        <figcaption className="ribbon-caption">
          <span>
            <i className="ribbon-key ribbon-key-baseline" /> 7-day baseline ·
            241 ms
          </span>
          <span>
            <i className="ribbon-key ribbon-key-threshold" /> threshold tick ·
            450 ms
          </span>
          <span>
            <i className="ribbon-key ribbon-key-window" /> selected window ·{" "}
            {incident?.window ?? "11:42–12:18"}
          </span>
        </figcaption>
      </figure>
      <div className="anomaly-foot">
        <div className="anomaly-foot-facts">
          <span>
            <span className="state-dot state-warning" /> current 428 ms
          </span>
          <span>
            <span className="state-dot state-danger" /> peak 542 ms
          </span>
          <span>
            <Icon name="trace" size={13} /> 16 sampled traces
          </span>
        </div>
        <button className="button button-acid" type="button" onClick={onOpen}>
          Open {incident?.id ?? "incident"}
          <Icon name="arrow-up-right" size={15} />
        </button>
      </div>
    </section>
  );
}

function IncidentQueue({ incidents, selectedId, onSelect }) {
  const selectedIndex = Math.max(
    0,
    incidents.findIndex((incident) => incident.id === selectedId),
  );

  const handleKeyDown = (event, index) => {
    let nextIndex = index;
    if (event.key === "ArrowDown")
      nextIndex = Math.min(incidents.length - 1, index + 1);
    if (event.key === "ArrowUp") nextIndex = Math.max(0, index - 1);
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = incidents.length - 1;
    if (nextIndex !== index) {
      event.preventDefault();
      const next = incidents[nextIndex];
      onSelect(next.id, event.currentTarget);
      requestAnimationFrame(() =>
        document.querySelector(`[data-incident-id="${next.id}"]`)?.focus(),
      );
    }
  };

  return (
    <section
      id="incident-queue"
      className="panel queue-panel"
      aria-labelledby="queue-heading"
    >
      <div className="panel-head queue-head">
        <div>
          <span className="eyebrow">Operator queue</span>
          <h2 id="queue-heading">Incidents</h2>
        </div>
        <span className="queue-count">
          <strong>{incidents.length}</strong> signals
        </span>
      </div>
      <div className="queue-helper">
        <Icon name="activity" size={13} /> Select a signal to pin its evidence
      </div>
      <div className="incident-list" role="listbox" aria-label="Incident queue">
        {incidents.map((incident, index) => (
          <button
            key={incident.id}
            type="button"
            role="option"
            aria-selected={incident.id === selectedId}
            tabIndex={index === selectedIndex ? 0 : -1}
            data-incident-id={incident.id}
            className={`incident-item ${incident.id === selectedId ? "is-selected" : ""}`}
            onClick={(event) => onSelect(incident.id, event.currentTarget)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            <span
              className={`incident-severity incident-severity-${incident.severity}`}
              aria-hidden="true"
            />
            <span className="incident-item-main">
              <span className="incident-id-row">
                <strong>{incident.id}</strong>
                <span
                  className={`severity-label severity-label-${incident.severity}`}
                >
                  {incident.severityLabel}
                </span>
              </span>
              <span className="incident-title">{incident.title}</span>
              <span className="incident-meta">
                <span>{incident.service}</span>
                <span>·</span>
                <span>{incident.window}</span>
              </span>
            </span>
            <span className="incident-item-side">
              <span className={`state-tag state-tag-${incident.stateTone}`}>
                <span className="tag-dot" />
                {incident.state}
              </span>
              <span className="incident-updated">{incident.updated}</span>
            </span>
            <span className="incident-open-icon">
              <Icon name="chevron-right" size={15} />
            </span>
          </button>
        ))}
      </div>
      <div className="queue-foot">
        <span>Arrow keys navigate</span>
        <span>Enter opens evidence</span>
      </div>
    </section>
  );
}

function StatusCell({ status, label }) {
  return (
    <span className={`service-status service-status-${status}`}>
      <span className="status-marker" />
      {label}
    </span>
  );
}

function ServiceTable({ services, onAction, notify }) {
  const [query, setQuery] = useState("");
  const [committedQuery, setCommittedQuery] = useState("");
  const [composing, setComposing] = useState(false);
  const [showOnlyFailing, setShowOnlyFailing] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (composing) return undefined;
    const timer = window.setTimeout(
      () => setCommittedQuery(query.trim().toLowerCase()),
      300,
    );
    return () => window.clearTimeout(timer);
  }, [query, composing]);

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const haystack =
        `${service.name} ${service.role} ${service.owner} ${service.deploy} ${service.source}`.toLowerCase();
      const matchesQuery = !committedQuery || haystack.includes(committedQuery);
      const matchesStatus = !showOnlyFailing || service.status !== "healthy";
      return matchesQuery && matchesStatus;
    });
  }, [services, committedQuery, showOnlyFailing]);

  const clearSearch = () => {
    setQuery("");
    setCommittedQuery("");
    inputRef.current?.focus();
  };

  return (
    <section
      id="service-evidence"
      className="panel service-panel"
      aria-labelledby="services-heading"
    >
      <div className="panel-head service-head">
        <div>
          <span className="eyebrow">Evidence surface</span>
          <h2 id="services-heading">Service health</h2>
        </div>
        <span className="service-total">
          {services.length} services / checkout path
        </span>
      </div>
      <div className="service-toolbar">
        <div className="search-field">
          <label htmlFor="service-search">Search services</label>
          <Icon name="search" size={15} />
          <input
            ref={inputRef}
            id="service-search"
            type="text"
            value={query}
            placeholder="Search service, owner, deploy…"
            onChange={(event) => setQuery(event.target.value)}
            onCompositionStart={() => setComposing(true)}
            onCompositionEnd={(event) => {
              setComposing(false);
              setQuery(event.currentTarget.value);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                event.preventDefault();
                setCommittedQuery(query.trim().toLowerCase());
              }
            }}
            aria-describedby="service-results"
          />
          {query ? (
            <button
              type="button"
              className="search-clear"
              aria-label="Clear service search"
              onClick={clearSearch}
            >
              <Icon name="x" size={14} />
            </button>
          ) : null}
        </div>
        <button
          type="button"
          className={`filter-toggle ${showOnlyFailing ? "is-active" : ""}`}
          aria-pressed={showOnlyFailing}
          onClick={() => setShowOnlyFailing((current) => !current)}
        >
          <Icon name="filter" size={15} />
          <span>Show only failing</span>
        </button>
        <span
          id="service-results"
          className="service-results"
          role="status"
          aria-live="polite"
        >
          {filteredServices.length} of {services.length} shown
        </span>
      </div>
      {filteredServices.length ? (
        <div className="table-scroll">
          <table className="service-table">
            <caption className="sr-only">
              Checkout services with owner, latest deploy, status, and next
              action
            </caption>
            <thead>
              <tr>
                <th scope="col">Service</th>
                <th scope="col">Owner</th>
                <th scope="col">Latest deploy</th>
                <th scope="col">Status</th>
                <th scope="col">Next action</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map((service) => (
                <tr key={service.name}>
                  <th scope="row" data-label="Service">
                    <div className="service-name-cell">
                      <span className="service-glyph">
                        <Icon name="server" size={14} />
                      </span>
                      <span>
                        <strong>{service.name}</strong>
                        <small>{service.role}</small>
                      </span>
                    </div>
                  </th>
                  <td data-label="Owner">
                    <span className="owner-cell">
                      <span className="avatar avatar-neutral">
                        {service.initials}
                      </span>
                      <span>{service.owner}</span>
                    </span>
                  </td>
                  <td data-label="Latest deploy">
                    <span className="deploy-cell">
                      <strong>{service.deploy}</strong>
                      <small>{service.deployTime}</small>
                    </span>
                  </td>
                  <td data-label="Status">
                    <StatusCell
                      status={service.status}
                      label={service.statusLabel}
                    />
                  </td>
                  <td data-label="Next action">
                    {service.nextAction === "No action" ? (
                      <span className="muted-action">No action</span>
                    ) : (
                      <button
                        className="table-action"
                        type="button"
                        onClick={(event) => {
                          if (service.incidentId)
                            onAction(service.incidentId, event.currentTarget);
                          else
                            notify(
                              "Trace path queued from the service row",
                              "info",
                            );
                        }}
                      >
                        {service.nextAction}
                        <Icon name="arrow-up-right" size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-results" role="status">
          <span className="no-results-icon">
            <Icon name="search" size={17} />
          </span>
          <strong>No matching services</strong>
          <p>Try a different service, owner, or deploy name.</p>
          <button
            className="button button-ghost"
            type="button"
            onClick={() => {
              clearSearch();
              setShowOnlyFailing(false);
            }}
          >
            Clear filters
          </button>
        </div>
      )}
      <div className="service-foot">
        <span>
          <Icon name="layers" size={13} /> Data sources: APM, RUM, logs, queue
        </span>
        <span>Refreshed 14s ago</span>
      </div>
    </section>
  );
}

function IncidentDrawer({ incident, open, onClose, onAcknowledge }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;
    const frame = window.requestAnimationFrame(() => closeRef.current?.focus());
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!open || !incident) return null;

  const acknowledged = incident.acknowledged;

  return (
    <div className="drawer-layer">
      <button
        className="drawer-backdrop"
        type="button"
        aria-label="Close incident details"
        tabIndex={-1}
        onClick={onClose}
      />
      <aside
        ref={dialogRef}
        className="incident-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-heading"
        aria-describedby="drawer-summary"
      >
        <div className="drawer-head">
          <div>
            <div className="drawer-id-row">
              <span className={`state-tag state-tag-${incident.stateTone}`}>
                <span className="tag-dot" />
                {incident.state}
              </span>
              <span className="drawer-id">{incident.id}</span>
            </div>
            <h2 id="drawer-heading">{incident.title}</h2>
          </div>
          <button
            ref={closeRef}
            className="icon-button"
            type="button"
            aria-label="Close incident details"
            onClick={onClose}
          >
            <Icon name="x" />
          </button>
        </div>
        <div className="drawer-scroll">
          <p id="drawer-summary" className="drawer-summary">
            {incident.summary}
          </p>
          <div className="drawer-facts">
            <span>
              <span className="eyebrow">Opened</span>
              <strong>{incident.window}</strong>
            </span>
            <span>
              <span className="eyebrow">Service</span>
              <strong>{incident.service}</strong>
            </span>
            <span>
              <span className="eyebrow">Severity</span>
              <strong>{incident.severityLabel}</strong>
            </span>
          </div>

          <section
            className="drawer-section"
            aria-labelledby="timeline-heading"
          >
            <div className="drawer-section-head">
              <span className="eyebrow">01 / sequence</span>
              <h3 id="timeline-heading">Timeline</h3>
            </div>
            <ol className="timeline-list">
              {incident.timeline.map((item) => (
                <li key={`${item.time}-${item.event}`}>
                  <span
                    className={`timeline-marker timeline-marker-${item.tone}`}
                    aria-hidden="true"
                  />
                  <div>
                    <time>{item.time}</time>
                    <strong>{item.event}</strong>
                    <span>
                      {item.actor} · {item.detail}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section
            className="drawer-section"
            aria-labelledby="affected-heading"
          >
            <div className="drawer-section-head">
              <span className="eyebrow">02 / blast radius</span>
              <h3 id="affected-heading">Affected services</h3>
            </div>
            <ul className="affected-list">
              {incident.affected.map((service) => (
                <li key={service}>
                  <span className="state-dot state-warning" />
                  {service}
                </li>
              ))}
            </ul>
          </section>

          <section
            className="drawer-section"
            aria-labelledby="evidence-heading"
          >
            <div className="drawer-section-head">
              <span className="eyebrow">03 / sampled evidence</span>
              <h3 id="evidence-heading">Trace excerpts</h3>
            </div>
            <div className="evidence-snippets">
              {incident.evidence.map((line) => (
                <code key={line}>{line}</code>
              ))}
            </div>
            <p className="evidence-note">
              <Icon name="eye" size={14} /> Values are deterministic demo
              evidence; open the runbook before changing production.
            </p>
          </section>
        </div>
        <div className="drawer-foot">
          <div
            className={`ack-feedback ${acknowledged ? "is-visible" : ""}`}
            role="status"
            aria-live="polite"
          >
            <Icon name="check" size={15} />
            <span>
              {acknowledged
                ? "Acknowledged by you · just now"
                : "Acknowledge to hand off this signal"}
            </span>
          </div>
          {acknowledged ? (
            <button
              className="button button-acknowledged"
              type="button"
              disabled
            >
              <Icon name="check" size={15} /> Incident acknowledged
            </button>
          ) : (
            <button
              className="button button-acid button-full"
              type="button"
              onClick={() => onAcknowledge(incident.id)}
            >
              <Icon name="check" size={15} /> Acknowledge incident
            </button>
          )}
          <span className="drawer-foot-note">
            This action writes an operator note to the incident timeline.
          </span>
        </div>
      </aside>
    </div>
  );
}

function ToastRegion({ toast }) {
  return (
    <div className="toast-region" aria-live="polite" aria-atomic="true">
      {toast ? (
        <div className={`toast toast-${toast.tone}`}>
          <span className="toast-icon">
            <Icon
              name={
                toast.tone === "success"
                  ? "check"
                  : toast.tone === "warning"
                    ? "alert-triangle"
                    : "activity"
              }
              size={15}
            />
          </span>
          <span>{toast.message}</span>
        </div>
      ) : null}
    </div>
  );
}

function App() {
  const [environment, setEnvironment] = useState("production");
  const [range, setRange] = useState("24h");
  const [incidents, setIncidents] = useState(INCIDENTS);
  const [selectedIncidentId, setSelectedIncidentId] = useState("INC-284");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Overview");
  const [toast, setToast] = useState(null);
  const appShellRef = useRef(null);
  const contentShellRef = useRef(null);
  const railRef = useRef(null);
  const menuCloseRef = useRef(null);
  const menuButtonRef = useRef(null);
  const drawerReturnFocusRef = useRef(null);
  const toastTimerRef = useRef(null);

  const selectedIncident =
    incidents.find((incident) => incident.id === selectedIncidentId) ??
    incidents[0];
  const environmentData = ENVIRONMENT_DATA[environment];

  useEffect(() => {
    document.title = "Checkout observability — Lattice Signal";
  }, []);

  useEffect(() => {
    const layerOpen = drawerOpen || mobileMenuOpen;
    if (appShellRef.current) {
      appShellRef.current.inert = drawerOpen;
      appShellRef.current.setAttribute(
        "aria-hidden",
        drawerOpen ? "true" : "false",
      );
    }
    if (contentShellRef.current) contentShellRef.current.inert = layerOpen;
    document.body.classList.toggle("is-layer-open", layerOpen);
    return () => document.body.classList.remove("is-layer-open");
  }, [drawerOpen, mobileMenuOpen]);

  useEffect(
    () => () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const frame = window.requestAnimationFrame(() =>
      menuCloseRef.current?.focus(),
    );
    return () => window.cancelAnimationFrame(frame);
  }, [mobileMenuOpen]);

  const notify = (message, tone = "info") => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setToast({ message, tone });
    toastTimerRef.current = window.setTimeout(() => setToast(null), 3200);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    window.requestAnimationFrame(() => menuButtonRef.current?.focus());
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    window.requestAnimationFrame(() => drawerReturnFocusRef.current?.focus());
  };

  const openIncident = (incidentId, trigger) => {
    setSelectedIncidentId(incidentId);
    drawerReturnFocusRef.current = trigger;
    setDrawerOpen(true);
  };

  const handleAcknowledge = (incidentId) => {
    setIncidents((current) =>
      current.map((incident) =>
        incident.id === incidentId
          ? {
              ...incident,
              acknowledged: true,
              state: "Acknowledged",
              stateTone: "success",
            }
          : incident,
      ),
    );
    notify(`${incidentId} acknowledged`, "success");
  };

  const exportSnapshot = () => {
    const rows = [
      ["service", "owner", "deploy", "status", "next_action"],
      ...SERVICE_ROWS.map((service) => [
        service.name,
        service.owner,
        service.deploy,
        service.statusLabel,
        service.nextAction,
      ]),
    ];
    const csv = rows
      .map((row) =>
        row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `lattice-signal-${environment}-snapshot.csv`;
    link.click();
    URL.revokeObjectURL(url);
    notify("Service snapshot exported", "success");
  };

  const handleNav = (label) => {
    setActiveNav(label);
    if (mobileMenuOpen) closeMobileMenu();
  };

  return (
    <div className="app-root">
      <div ref={appShellRef} className="app-shell">
        <SideRail
          activeNav={activeNav}
          mobileOpen={mobileMenuOpen}
          onClose={closeMobileMenu}
          onNavigate={handleNav}
          closeRef={menuCloseRef}
          railRef={railRef}
        />
        <div ref={contentShellRef} className="content-shell">
          <CommandHeader
            environment={environment}
            setEnvironment={setEnvironment}
            range={range}
            setRange={setRange}
            onExport={exportSnapshot}
            onOpenMenu={() => setMobileMenuOpen(true)}
            menuOpen={mobileMenuOpen}
            menuButtonRef={menuButtonRef}
          />
          <main className="main-content">
            <div className="page-intro">
              <div>
                <span className="eyebrow">Workspace overview / checkout</span>
                <p className="page-subtitle">
                  A high-signal read of availability, latency, and the next safe
                  intervention.
                </p>
              </div>
              <span className="snapshot-label">
                <span className="state-dot state-success" /> snapshot stable
              </span>
            </div>
            <StatusBanner
              environmentData={environmentData}
              onInspect={(event) =>
                openIncident("INC-284", event.currentTarget)
              }
            />
            <KpiGrid metrics={METRICS[environment]} />
            <AnomalyRibbon
              range={range}
              incident={selectedIncident}
              onOpen={(event) =>
                openIncident(selectedIncident.id, event.currentTarget)
              }
            />
            <AnalysisGrid range={range} />
            <section
              className="lower-grid"
              aria-label="Incident queue and service evidence"
            >
              <IncidentQueue
                incidents={incidents}
                selectedId={selectedIncidentId}
                onSelect={openIncident}
              />
              <ServiceTable
                services={SERVICE_ROWS}
                onAction={openIncident}
                notify={notify}
              />
            </section>
            <footer className="page-footer">
              <span>Lattice Signal / tactical signal grid</span>
              <span>All systems instrumented · build 2026.09.04</span>
              <span>UTC</span>
            </footer>
          </main>
        </div>
      </div>
      {mobileMenuOpen ? (
        <button
          className="mobile-menu-scrim"
          type="button"
          aria-label="Close navigation"
          onClick={closeMobileMenu}
        />
      ) : null}
      <IncidentDrawer
        incident={selectedIncident}
        open={drawerOpen}
        onClose={closeDrawer}
        onAcknowledge={handleAcknowledge}
      />
      <ToastRegion toast={toast} />
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
