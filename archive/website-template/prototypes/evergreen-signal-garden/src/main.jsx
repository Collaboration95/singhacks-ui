import { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const ENVIRONMENTS = {
  production: {
    label: "Production",
    region: "us-east-1",
    freshness: "2 min ago",
    health: "Checkout is healthy, with one regression worth opening.",
    healthDetail:
      "Core checkout paths are responding normally. Payment edge latency is above its baseline; orders are still writing cleanly.",
    metrics: [
      {
        label: "Availability",
        value: "99.98%",
        delta: "+0.02%",
        tone: "success",
        caption: "last 6 hours",
        spark: "M2 24 C16 23, 22 18, 32 20 S48 16, 58 17 S72 12, 88 13",
      },
      {
        label: "p95 latency",
        value: "412 ms",
        delta: "+38 ms",
        tone: "warning",
        caption: "vs 30-day baseline",
        spark: "M2 22 C15 21, 20 18, 31 19 S45 11, 55 16 S70 9, 88 10",
      },
      {
        label: "Error rate",
        value: "0.18%",
        delta: "-0.04%",
        tone: "success",
        caption: "of checkout requests",
        spark: "M2 12 C16 14, 22 8, 34 11 S49 17, 60 12 S73 13, 88 7",
      },
      {
        label: "Error budget",
        value: "76%",
        delta: "18 days left",
        tone: "neutral",
        caption: "monthly budget remaining",
        spark: "M2 9 C18 9, 22 10, 34 11 S48 12, 59 14 S75 16, 88 18",
      },
    ],
  },
  staging: {
    label: "Staging",
    region: "us-east-1",
    freshness: "11 min ago",
    health:
      "Staging is quiet, with the same payment signal mirrored for review.",
    healthDetail:
      "Synthetic checkout is passing end to end. The payment edge remains slower than baseline, so the production evidence is kept in view.",
    metrics: [
      {
        label: "Availability",
        value: "100.00%",
        delta: "+0.08%",
        tone: "success",
        caption: "last 6 hours",
        spark: "M2 22 C16 21, 22 16, 32 18 S48 14, 58 16 S72 10, 88 11",
      },
      {
        label: "p95 latency",
        value: "286 ms",
        delta: "-12 ms",
        tone: "success",
        caption: "vs 30-day baseline",
        spark: "M2 20 C15 17, 20 18, 31 16 S45 14, 55 15 S70 10, 88 12",
      },
      {
        label: "Error rate",
        value: "0.04%",
        delta: "-0.11%",
        tone: "success",
        caption: "of checkout requests",
        spark: "M2 11 C16 12, 22 10, 34 12 S49 10, 60 9 S73 10, 88 6",
      },
      {
        label: "Error budget",
        value: "94%",
        delta: "24 days left",
        tone: "neutral",
        caption: "monthly budget remaining",
        spark: "M2 8 C18 9, 22 9, 34 10 S48 11, 59 12 S75 13, 88 15",
      },
    ],
  },
};

const RANGE_DATA = {
  "1h": {
    label: "Last hour",
    shortLabel: "1 hour",
    current: [356, 370, 364, 382, 395, 410, 426, 412, 438, 446, 461, 472],
    baseline: [342, 344, 347, 350, 353, 355, 357, 360, 362, 364, 366, 369],
    labels: [
      "08:00",
      "08:05",
      "08:10",
      "08:15",
      "08:20",
      "08:25",
      "08:30",
      "08:35",
      "08:40",
      "08:45",
      "08:50",
      "08:55",
    ],
    annotation: "Payment edge deploy",
    annotationIndex: 7,
    summary: "p95 is 103 ms above baseline at the latest sample.",
  },
  "6h": {
    label: "Last 6 hours",
    shortLabel: "6 hours",
    current: [342, 350, 348, 363, 371, 368, 385, 392, 388, 402, 418, 412],
    baseline: [332, 334, 337, 340, 343, 346, 349, 352, 355, 358, 361, 365],
    labels: [
      "03:00",
      "03:30",
      "04:00",
      "04:30",
      "05:00",
      "05:30",
      "06:00",
      "06:30",
      "07:00",
      "07:30",
      "08:00",
      "08:30",
    ],
    annotation: "Payment edge deploy",
    annotationIndex: 7,
    summary:
      "The current trace finishes 47 ms over baseline after the payment deploy.",
  },
  "24h": {
    label: "Last 24 hours",
    shortLabel: "24 hours",
    current: [318, 327, 322, 330, 338, 345, 341, 353, 361, 367, 359, 372],
    baseline: [320, 321, 322, 324, 326, 328, 330, 332, 334, 336, 338, 340],
    labels: [
      "Yesterday 09:00",
      "11:00",
      "13:00",
      "15:00",
      "17:00",
      "19:00",
      "21:00",
      "23:00",
      "Today 01:00",
      "03:00",
      "05:00",
      "07:00",
    ],
    annotation: "Payment edge deploy",
    annotationIndex: 7,
    summary: "Latency stayed near baseline until the latest deployment window.",
  },
};

const SERVICES = [
  {
    id: "checkout-web",
    name: "Checkout web",
    kind: "frontend",
    status: "healthy",
    p95: "182 ms",
    owner: "Mina Park",
    deploy: "web-2026.09.04.2",
    deployTime: "28 min ago",
    next: "No action needed",
    detail:
      "Browser-to-edge requests and cart hydration are within their normal envelope.",
    evidence: "route=/checkout · cache-hit=94.2% · hydration=18ms",
  },
  {
    id: "checkout-api",
    name: "Checkout API",
    kind: "service",
    status: "warning",
    p95: "412 ms",
    owner: "Alex Chen",
    deploy: "api-2026.09.04.7",
    deployTime: "42 min ago",
    next: "Compare edge timeout traces",
    detail:
      "The API is healthy at the boundary, but waits longer when it hands off to payments.",
    evidence: "route=POST /checkout · upstream_wait=231ms · retries=0.8%",
  },
  {
    id: "payments-api",
    name: "Payments API",
    kind: "dependency",
    status: "failing",
    p95: "812 ms",
    owner: "Rhea Iyer",
    deploy: "payments-2026.09.04.3",
    deployTime: "58 min ago",
    next: "Open the payment edge trace",
    detail:
      "The card authorization edge is the only service crossing its red latency threshold.",
    evidence: "provider=stripe · auth_p95=812ms · timeout_rate=0.31%",
  },
  {
    id: "risk-engine",
    name: "Risk engine",
    kind: "service",
    status: "healthy",
    p95: "96 ms",
    owner: "Noah Williams",
    deploy: "risk-2026.09.03.5",
    deployTime: "18 hr ago",
    next: "No action needed",
    detail:
      "Fraud scoring is steady and does not explain the payment edge regression.",
    evidence: "decision=allow · score_p95=96ms · queue_depth=12",
  },
  {
    id: "inventory",
    name: "Inventory",
    kind: "service",
    status: "healthy",
    p95: "118 ms",
    owner: "Jules Martin",
    deploy: "inventory-2026.09.04.1",
    deployTime: "2 hr ago",
    next: "No action needed",
    detail:
      "Stock reservations are completing on time and remain independent of the incident.",
    evidence: "reservations=1,842 · conflicts=0 · p95=118ms",
  },
  {
    id: "order-writer",
    name: "Order writer",
    kind: "worker",
    status: "healthy",
    p95: "74 ms",
    owner: "Theo Grant",
    deploy: "orders-2026.09.02.8",
    deployTime: "2 days ago",
    next: "No action needed",
    detail:
      "Orders are durable after authorization; no write failures have appeared in the window.",
    evidence: "writes=3,209 · lag=74ms · dead_letters=0",
  },
];

const INCIDENTS = [
  {
    id: "inc-payment-latency",
    title: "Payment edge is slower than baseline",
    serviceId: "payments-api",
    severity: "warning",
    age: "18 min ago",
    owner: "Rhea Iyer",
    acknowledged: false,
    summary: "p95 rose 2.1× after payments-2026.09.04.3 reached production.",
    next: "Open the edge trace, then compare provider response headers with the previous deploy.",
    deploy: "payments-2026.09.04.3",
    deployMeta: "58 min ago · Rhea Iyer",
    timeline: [
      {
        time: "09:14",
        label: "Regression detected",
        detail: "Payment authorization crossed the 700 ms warning threshold.",
      },
      {
        time: "09:19",
        label: "Deploy correlated",
        detail: "Latency shift overlaps the payments edge rollout.",
      },
      {
        time: "09:27",
        label: "Owner assigned",
        detail: "Rhea Iyer is reviewing provider timings.",
      },
    ],
    evidence: "trace=pay_7f91a · provider_wait=604ms · region=us-east-1",
  },
  {
    id: "inc-checkout-errors",
    title: "Checkout API errors recovered after rollback",
    serviceId: "checkout-api",
    severity: "acknowledged",
    age: "2 hr ago",
    owner: "Alex Chen",
    acknowledged: true,
    summary:
      "A short error spike ended after the API rollback; monitoring remains in place.",
    next: "Keep the rollback pinned until the next canary window.",
    deploy: "api-2026.09.04.6 → .7",
    deployMeta: "2 hr ago · Alex Chen",
    timeline: [
      {
        time: "07:31",
        label: "Error spike detected",
        detail: "Checkout 5xx reached 0.9% for three minutes.",
      },
      {
        time: "07:38",
        label: "Rollback complete",
        detail: "Error rate returned below 0.2% within two samples.",
      },
      {
        time: "07:45",
        label: "Incident acknowledged",
        detail: "Alex Chen accepted ownership for follow-up.",
      },
    ],
    evidence: "trace=chk_41ce2 · status=200 · rollback=confirmed",
  },
];

const SERVICE_POSITIONS = {
  "checkout-web": { x: 14, y: 26 },
  "checkout-api": { x: 40, y: 16 },
  "payments-api": { x: 72, y: 27 },
  "risk-engine": { x: 23, y: 70 },
  inventory: { x: 52, y: 73 },
  "order-writer": { x: 82, y: 68 },
};

const CONNECTIONS = [
  ["checkout-web", "checkout-api"],
  ["checkout-api", "payments-api"],
  ["checkout-web", "risk-engine"],
  ["checkout-api", "inventory"],
  ["risk-engine", "inventory"],
  ["inventory", "order-writer"],
  ["payments-api", "order-writer"],
];

function Icon({ name, size = 18, strokeWidth = 1.8, ...props }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
    ...props,
  };
  const paths = {
    arrow: (
      <>
        <path d="M5 12h13" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m7 10 5 5 5-5" />,
    close: (
      <>
        <path d="M6 6l12 12" />
        <path d="M18 6 6 18" />
      </>
    ),
    filter: (
      <>
        <path d="M4 6h16" />
        <path d="M7 12h10" />
        <path d="M10 18h4" />
      </>
    ),
    leaf: (
      <>
        <path d="M20 4C11 4 5 8 5 15c0 3 2 5 5 5 7 0 10-6 10-16Z" />
        <path d="M4 21c3-5 7-8 12-10" />
      </>
    ),
    menu: (
      <>
        <path d="M4 7h16" />
        <path d="M4 12h16" />
        <path d="M4 17h16" />
      </>
    ),
    pulse: <path d="M3 12h4l2-7 4 14 2-7h6" />,
    search: (
      <>
        <circle cx="10.8" cy="10.8" r="6.4" />
        <path d="m16 16 4.2 4.2" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 20 6v5c0 5-3.2 8.3-8 10-4.8-1.7-8-5-8-10V6l8-3Z" />
        <path d="m8.5 12 2.2 2.2 4.8-5" />
      </>
    ),
    spark: (
      <>
        <path d="m12 3 1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4L12 3Z" />
        <path d="m19 16 .5 2.1L22 19l-2.5.9L19 22l-.5-2.1L16 19l2.5-.9L19 16Z" />
      </>
    ),
    trend: (
      <>
        <path d="M4 17 10 11l4 4 6-8" />
        <path d="M15 7h5v5" />
      </>
    ),
    x: (
      <>
        <path d="M7 7h10v10H7z" />
        <path d="m9 9 6 6" />
        <path d="m15 9-6 6" />
      </>
    ),
  };
  return <svg {...common}>{paths[name] || paths.spark}</svg>;
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(media.matches);
    onChange();
    media.addEventListener?.("change", onChange);
    return () => media.removeEventListener?.("change", onChange);
  }, []);

  return reduced;
}

function StatusMark({ status }) {
  return (
    <span className={`status-mark status-${status}`} aria-hidden="true">
      <span />
    </span>
  );
}

function StatusChip({ status }) {
  const labels = {
    healthy: "Healthy",
    warning: "Warning",
    failing: "Failing",
    acknowledged: "Acknowledged",
  };
  return (
    <span className={`status-chip status-${status}`}>
      <StatusMark status={status} />
      {labels[status] || status}
    </span>
  );
}

function MetricSpark({ path, tone }) {
  return (
    <svg
      className={`metric-spark spark-${tone}`}
      viewBox="0 0 90 26"
      role="img"
      aria-label="Metric trend"
    >
      <path d={path} />
    </svg>
  );
}

function RangeControl({ range, onChange }) {
  return (
    <div className="range-control" role="group" aria-label="Time range">
      {Object.entries(RANGE_DATA).map(([key, value]) => (
        <button
          key={key}
          type="button"
          className={`range-button ${range === key ? "is-selected" : ""}`}
          aria-pressed={range === key}
          onClick={() => onChange(key)}
        >
          {value.shortLabel}
        </button>
      ))}
    </div>
  );
}

function TrendChart({ range, environment }) {
  const data = RANGE_DATA[range];
  const width = 760;
  const height = 300;
  const left = 48;
  const right = width - 16;
  const top = 26;
  const bottom = height - 42;
  const values = [...data.current, ...data.baseline];
  const min = Math.floor((Math.min(...values) - 20) / 20) * 20;
  const max = Math.ceil((Math.max(...values) + 20) / 20) * 20;
  const xFor = (index) =>
    left + (index / (data.current.length - 1)) * (right - left);
  const yFor = (value) =>
    bottom - ((value - min) / (max - min)) * (bottom - top);
  const buildPath = (points) =>
    points
      .map(
        (value, index) =>
          `${index === 0 ? "M" : "L"} ${xFor(index).toFixed(1)} ${yFor(value).toFixed(1)}`,
      )
      .join(" ");
  const currentPath = buildPath(data.current);
  const baselinePath = buildPath(data.baseline);
  const areaPath = `${currentPath} L ${right} ${bottom} L ${left} ${bottom} Z`;
  const gridValues = [0, 1, 2, 3].map((step) => min + ((max - min) * step) / 3);
  const annotationX = xFor(data.annotationIndex);
  const latest = data.current[data.current.length - 1];

  return (
    <div className="chart-region">
      <svg
        className="trend-chart"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Current p95 latency versus baseline for ${environment.label}, ${data.label}. Latest current value is ${latest} milliseconds.`}
      >
        <defs>
          <linearGradient id="coral-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#e87863" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#e87863" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g className="chart-grid">
          {gridValues.map((value) => {
            const y = yFor(value);
            return (
              <g key={value}>
                <line x1={left} x2={right} y1={y} y2={y} />
                <text x="0" y={y + 4}>
                  {Math.round(value)} ms
                </text>
              </g>
            );
          })}
          <line
            className="chart-axis"
            x1={left}
            x2={right}
            y1={bottom}
            y2={bottom}
          />
        </g>
        <path className="chart-area" d={areaPath} fill="url(#coral-area)" />
        <path className="chart-baseline" d={baselinePath} />
        <path className="chart-current" d={currentPath} />
        <line
          className="chart-annotation-line"
          x1={annotationX}
          x2={annotationX}
          y1={top}
          y2={bottom}
        />
        <g
          className="chart-annotation"
          transform={`translate(${Math.min(annotationX + 10, right - 110)} ${top + 8})`}
        >
          <rect width="108" height="25" rx="8" />
          <text x="10" y="16">
            {data.annotation}
          </text>
        </g>
        {data.labels.map((label, index) => (
          <text
            className="chart-label"
            key={label}
            x={xFor(index)}
            y={height - 15}
            textAnchor={
              index === 0
                ? "start"
                : index === data.labels.length - 1
                  ? "end"
                  : "middle"
            }
          >
            {label}
          </text>
        ))}
        <circle
          className="chart-end-point"
          cx={xFor(data.current.length - 1)}
          cy={yFor(latest)}
          r="4.5"
        />
      </svg>
      <div className="chart-caption">
        <p>
          <span className="caption-dot coral" />
          Current <strong>{latest} ms</strong>
          <span className="caption-dot baseline" />
          Baseline <strong>{data.baseline[data.baseline.length - 1]} ms</strong>
        </p>
        <p className="chart-summary">
          <Icon name="pulse" size={15} />
          {data.summary}
        </p>
      </div>
    </div>
  );
}

function IncidentTimeline({
  incidents,
  selectedIncidentId,
  attentionOnly,
  onOpen,
  onAcknowledge,
}) {
  const visibleIncidents = incidents.filter(
    (incident) => !attentionOnly || !incident.acknowledged,
  );

  return (
    <section
      className="panel incident-panel"
      id="incidents"
      aria-labelledby="incident-title"
    >
      <div className="panel-heading compact-heading">
        <div>
          <p className="eyebrow">Response queue</p>
          <h2 id="incident-title">Signals needing a look</h2>
        </div>
        <span className="panel-count">
          {visibleIncidents.length}{" "}
          {visibleIncidents.length === 1 ? "open" : "visible"}
        </span>
      </div>
      <p className="panel-subcopy">
        A short, ordered timeline for this checkout workspace.
      </p>
      {visibleIncidents.length ? (
        <div className="incident-list">
          {visibleIncidents.map((incident) => (
            <article
              key={incident.id}
              className={`incident-item ${selectedIncidentId === incident.id ? "is-selected" : ""}`}
            >
              <div className="incident-row">
                <button
                  type="button"
                  className="incident-main"
                  onClick={(event) => onOpen(incident.id, event.currentTarget)}
                  aria-label={`Open evidence for ${incident.title}`}
                >
                  <div className="incident-topline">
                    <StatusChip
                      status={
                        incident.acknowledged
                          ? "acknowledged"
                          : incident.severity
                      }
                    />
                    <span>{incident.age}</span>
                  </div>
                  <h3>{incident.title}</h3>
                  <p>{incident.summary}</p>
                  <span className="incident-owner">
                    <span className="owner-avatar">
                      {incident.owner
                        .split(" ")
                        .map((word) => word[0])
                        .join("")}
                    </span>
                    {incident.owner} ·{" "}
                    {
                      SERVICES.find(
                        (service) => service.id === incident.serviceId,
                      )?.name
                    }
                  </span>
                </button>
                {!incident.acknowledged && (
                  <button
                    type="button"
                    className="ack-button"
                    onClick={() => onAcknowledge(incident.id)}
                    aria-label={`Acknowledge ${incident.title}`}
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state small-empty">
          <span className="empty-icon">
            <Icon name="check" size={16} />
          </span>
          <strong>No open signals in this view</strong>
          <span>
            Turn off the attention filter to see acknowledged history.
          </span>
        </div>
      )}
      <div className="incident-footnote">
        <Icon name="shield" size={15} />
        Acknowledged incidents remain in the audit trail.
      </div>
    </section>
  );
}

function SignalGarden({
  services,
  selectedServiceId,
  selectedIncident,
  attentionOnly,
  reducedMotion,
  onSelect,
}) {
  const selectedTargetId = selectedServiceId || selectedIncident?.serviceId;
  const positions = SERVICE_POSITIONS;
  const selectedPosition = positions[selectedIncident?.serviceId];
  const findPoint = (id) => {
    const point = positions[id];
    return { x: (point.x / 100) * 900, y: (point.y / 100) * 410 };
  };

  return (
    <div
      className="garden-stage"
      data-motion={reducedMotion ? "reduced" : "live"}
    >
      <div
        className="map-stage"
        role="group"
        aria-label="Signal garden service constellation"
      >
        <svg
          className="constellation-svg"
          viewBox="0 0 900 410"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="garden-grid"
              width="54"
              height="54"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M54 0H0V54"
                fill="none"
                stroke="#b8d4c5"
                strokeOpacity="0.07"
                strokeWidth="1"
              />
            </pattern>
            <radialGradient id="garden-glow">
              <stop offset="0" stopColor="#dcefd7" stopOpacity="0.18" />
              <stop offset="1" stopColor="#dcefd7" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="900" height="410" fill="url(#garden-grid)" />
          <ellipse
            cx="450"
            cy="200"
            rx="230"
            ry="145"
            fill="url(#garden-glow)"
          />
          {CONNECTIONS.map(([from, to]) => {
            const a = findPoint(from);
            const b = findPoint(to);
            const isActive =
              from === selectedTargetId || to === selectedTargetId;
            return (
              <line
                key={`${from}-${to}`}
                className={`constellation-link ${isActive ? "is-active" : ""}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
              />
            );
          })}
          {selectedPosition && (
            <path
              className="incident-link"
              d={`M450 204 C540 176 596 182 ${selectedPosition.x} ${selectedPosition.y}`}
            />
          )}
          <circle className="garden-center" cx="450" cy="204" r="12" />
          <circle className="garden-center-ring" cx="450" cy="204" r="24" />
          {services.map((service) => {
            const point = findPoint(service.id);
            return (
              <g key={service.id}>
                <circle
                  className={`svg-service-node node-${service.status}`}
                  cx={point.x}
                  cy={point.y}
                  r="8"
                />
                <circle
                  className={`svg-service-core node-${service.status}`}
                  cx={point.x}
                  cy={point.y}
                  r="3"
                />
              </g>
            );
          })}
        </svg>
        <div className="map-center-label">
          <span className="center-kicker">Selected signal</span>
          <strong>{selectedIncident ? "Payment edge" : "Checkout path"}</strong>
          <span>
            {selectedIncident
              ? "Connected to Payments API"
              : "All dependencies"}
          </span>
        </div>
        {services.map((service) => {
          const point = positions[service.id];
          const selected = selectedTargetId === service.id;
          return (
            <button
              key={service.id}
              type="button"
              className={`map-node node-${service.status} ${selected ? "is-selected" : ""}`}
              style={{ "--node-x": `${point.x}%`, "--node-y": `${point.y}%` }}
              onClick={(event) => onSelect(service.id, event.currentTarget)}
              aria-pressed={selected}
              aria-label={`Open ${service.name} evidence. Status ${service.status}. p95 ${service.p95}.`}
            >
              <span className="map-node-name">
                <StatusMark status={service.status} />
                {service.name}
              </span>
              <span className="map-node-detail">
                {service.status === "failing"
                  ? "Threshold crossed"
                  : service.status === "warning"
                    ? "Needs a look"
                    : "Within baseline"}
              </span>
              <span className="map-node-p95">
                p95 <strong>{service.p95}</strong>
              </span>
            </button>
          );
        })}
        <div className="map-orientation">
          <span>
            <Icon name="leaf" size={14} />
            Live constellation
          </span>
          <span>{attentionOnly ? "Attention view" : "All services"}</span>
        </div>
      </div>
      <ol
        className="mobile-service-list"
        aria-label="Services in the signal garden"
      >
        {services.map((service, index) => (
          <li key={service.id}>
            <button
              type="button"
              className={`mobile-service-item node-${service.status} ${selectedTargetId === service.id ? "is-selected" : ""}`}
              onClick={(event) => onSelect(service.id, event.currentTarget)}
              aria-pressed={selectedTargetId === service.id}
            >
              <span className="mobile-service-index">0{index + 1}</span>
              <span className="mobile-service-main">
                <span className="mobile-service-name">
                  <StatusMark status={service.status} />
                  {service.name}
                </span>
                <span>
                  {service.status === "failing"
                    ? "Threshold crossed"
                    : service.status === "warning"
                      ? "Needs a look"
                      : "Within baseline"}
                </span>
              </span>
              <span className="mobile-service-metric">
                <small>p95</small>
                {service.p95}
              </span>
              <Icon name="arrow" size={16} />
            </button>
          </li>
        ))}
      </ol>
      <p className="motion-note">
        <Icon name={reducedMotion ? "shield" : "spark"} size={14} />
        {reducedMotion
          ? "Static mode is on. Labels and status shapes carry every signal."
          : "Live dots pulse softly when the system is changing; labels carry every signal."}
      </p>
    </div>
  );
}

function ServiceEvidence({
  services,
  filter,
  onFilterChange,
  onClearFilter,
  selectedServiceId,
  selectedIncident,
  attentionOnly,
  reducedMotion,
  onSelect,
}) {
  const filteredServices = services.filter((service) => {
    if (attentionOnly && service.status === "healthy") return false;
    const query = filter.trim().toLowerCase();
    return (
      !query ||
      [service.name, service.kind, service.owner, service.status]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  });

  return (
    <section className="panel garden-panel" aria-labelledby="garden-title">
      <div className="panel-heading garden-heading">
        <div>
          <p className="eyebrow">System shape</p>
          <h2 id="garden-title">Signal garden</h2>
          <p className="panel-subcopy">
            A service constellation that keeps state, ownership, and the next
            useful action together.
          </p>
        </div>
        <div className="garden-controls">
          <label className="filter-field">
            <span className="sr-only">Filter services</span>
            <Icon name="search" size={16} />
            <input
              type="search"
              value={filter}
              onChange={(event) => onFilterChange(event.target.value)}
              placeholder="Filter services"
              aria-describedby="service-filter-hint"
            />
            {filter && (
              <button
                type="button"
                className="clear-search"
                onClick={onClearFilter}
                aria-label="Clear service filter"
              >
                <Icon name="close" size={14} />
              </button>
            )}
          </label>
          <span id="service-filter-hint" className="filter-count">
            {filteredServices.length} of {services.length} services
          </span>
        </div>
      </div>
      <div className="garden-meta-row">
        <div className="map-legend" aria-label="Service status legend">
          <span>
            <StatusMark status="healthy" />
            Healthy
          </span>
          <span>
            <StatusMark status="warning" />
            Warning
          </span>
          <span>
            <StatusMark status="failing" />
            Failing
          </span>
        </div>
        <span className="map-helper">
          <Icon name="spark" size={14} />
          Select a service for its evidence trail
        </span>
      </div>
      {filteredServices.length ? (
        <SignalGarden
          services={filteredServices}
          selectedServiceId={selectedServiceId}
          selectedIncident={selectedIncident}
          attentionOnly={attentionOnly}
          reducedMotion={reducedMotion}
          onSelect={onSelect}
        />
      ) : (
        <div className="empty-state">
          <span className="empty-icon">
            <Icon name="search" size={17} />
          </span>
          <strong>No services match “{filter}”.</strong>
          <span>Clear the filter to restore the full constellation.</span>
          <button type="button" className="text-button" onClick={onClearFilter}>
            Clear filter <Icon name="arrow" size={14} />
          </button>
        </div>
      )}
    </section>
  );
}

function ServiceRoster({ services, filter, attentionOnly, onSelect }) {
  const visibleServices = services.filter((service) => {
    if (attentionOnly && service.status === "healthy") return false;
    const query = filter.trim().toLowerCase();
    return (
      !query ||
      [service.name, service.kind, service.owner, service.status]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  });

  return (
    <section
      className="panel roster-panel"
      id="evidence"
      aria-labelledby="roster-title"
    >
      <div className="panel-heading compact-heading">
        <div>
          <p className="eyebrow">Evidence index</p>
          <h2 id="roster-title">Service evidence</h2>
        </div>
        <span className="panel-count">{visibleServices.length} services</span>
      </div>
      <p className="panel-subcopy">
        The same state map, in a handoff-ready format for the next person on
        call.
      </p>
      <div className="service-table-wrap">
        <table className="service-table">
          <caption className="sr-only">Checkout service evidence</caption>
          <thead>
            <tr>
              <th scope="col">Service</th>
              <th scope="col">State</th>
              <th scope="col">Owner</th>
              <th scope="col">p95</th>
              <th scope="col">Last deploy</th>
              <th scope="col">Next step</th>
            </tr>
          </thead>
          <tbody>
            {visibleServices.map((service) => (
              <tr key={service.id}>
                <th scope="row">
                  <button
                    type="button"
                    className="table-service-link"
                    onClick={(event) =>
                      onSelect(service.id, event.currentTarget)
                    }
                  >
                    <StatusMark status={service.status} />
                    <span>
                      <strong>{service.name}</strong>
                      <small>{service.kind}</small>
                    </span>
                    <Icon name="arrow" size={14} />
                  </button>
                </th>
                <td>
                  <StatusChip status={service.status} />
                </td>
                <td>{service.owner}</td>
                <td
                  className={
                    service.status === "failing"
                      ? "critical-value"
                      : service.status === "warning"
                        ? "attention-value"
                        : ""
                  }
                >
                  {service.p95}
                </td>
                <td>
                  <span className="deploy-name">{service.deploy}</span>
                  <small className="cell-subcopy">{service.deployTime}</small>
                </td>
                <td>{service.next}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="service-cards">
        {visibleServices.map((service) => (
          <article
            className={`service-card node-${service.status}`}
            key={service.id}
          >
            <div className="service-card-head">
              <div>
                <StatusChip status={service.status} />
                <h3>{service.name}</h3>
                <p>
                  {service.kind} · {service.owner}
                </p>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={(event) => onSelect(service.id, event.currentTarget)}
                aria-label={`Open ${service.name} evidence`}
              >
                <Icon name="arrow" size={16} />
              </button>
            </div>
            <div className="service-card-details">
              <span>
                <small>p95</small>
                <strong
                  className={
                    service.status === "failing"
                      ? "critical-value"
                      : service.status === "warning"
                        ? "attention-value"
                        : ""
                  }
                >
                  {service.p95}
                </strong>
              </span>
              <span>
                <small>Last deploy</small>
                <strong>{service.deployTime}</strong>
              </span>
            </div>
            <p className="service-card-next">
              <Icon name="spark" size={14} />
              <span>{service.next}</span>
            </p>
          </article>
        ))}
      </div>
      {!visibleServices.length && (
        <div className="empty-state">
          <span className="empty-icon">
            <Icon name="check" size={16} />
          </span>
          <strong>No secondary evidence in this view.</strong>
          <span>Turn off the attention filter to see healthy services.</span>
        </div>
      )}
    </section>
  );
}

function EvidenceDrawer({
  open,
  selectedIncident,
  selectedService,
  onClose,
  onAcknowledge,
  acknowledging,
}) {
  const closeRef = useRef(null);
  const titleId = "evidence-drawer-title";

  useEffect(() => {
    if (open) window.requestAnimationFrame(() => closeRef.current?.focus());
  }, [open]);

  if (!open || (!selectedIncident && !selectedService)) return null;

  const service =
    selectedService ||
    SERVICES.find((item) => item.id === selectedIncident?.serviceId);
  const incident = selectedIncident;
  const status = incident
    ? incident.acknowledged
      ? "acknowledged"
      : incident.severity
    : service.status;

  return (
    <aside
      className="evidence-drawer"
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
    >
      <header className="drawer-header">
        <div>
          <p className="eyebrow">Evidence drawer</p>
          <span className="drawer-context">
            {incident ? "Incident signal" : "Service detail"} · {service?.name}
          </span>
        </div>
        <button
          ref={closeRef}
          type="button"
          className="icon-button drawer-close"
          onClick={onClose}
          aria-label="Close evidence drawer"
        >
          <Icon name="close" size={19} />
        </button>
      </header>
      <div className="drawer-body">
        <div className="drawer-title-block">
          <StatusChip status={status} />
          <h2 id={titleId}>{incident ? incident.title : service.name}</h2>
          <p>{incident ? incident.summary : service.detail}</p>
        </div>
        {incident && (
          <section className="drawer-section">
            <div className="drawer-section-heading">
              <h3>Timeline</h3>
              <span>{incident.age}</span>
            </div>
            <ol className="evidence-timeline">
              {incident.timeline.map((event, index) => (
                <li key={event.time}>
                  <span className="timeline-dot" aria-hidden="true" />
                  <div>
                    <time>
                      {event.time} ·{" "}
                      {index === 0
                        ? "detected"
                        : index === 1
                          ? "correlated"
                          : "owned"}
                    </time>
                    <strong>{event.label}</strong>
                    <p>{event.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}
        <section className="drawer-section">
          <div className="drawer-facts">
            <div>
              <span className="fact-label">Owner</span>
              <strong>{incident?.owner || service.owner}</strong>
              <span className="fact-sub">Primary responder</span>
            </div>
            <div>
              <span className="fact-label">Current p95</span>
              <strong
                className={
                  service.status === "failing"
                    ? "critical-value"
                    : service.status === "warning"
                      ? "attention-value"
                      : ""
                }
              >
                {service.p95}
              </strong>
              <span className="fact-sub">
                {service.status === "healthy"
                  ? "within baseline"
                  : "needs attention"}
              </span>
            </div>
          </div>
        </section>
        <section className="drawer-section next-step-section">
          <div className="drawer-section-heading">
            <h3>Suggested next step</h3>
            <Icon name="arrow" size={16} />
          </div>
          <div className="next-step">
            <span className="next-step-number">01</span>
            <p>{incident?.next || service.next}</p>
          </div>
        </section>
        <section className="drawer-section">
          <div className="drawer-section-heading">
            <h3>Related deploy</h3>
            <span>{incident?.deployMeta || service.deployTime}</span>
          </div>
          <div className="deploy-evidence">
            <div>
              <Icon name="spark" size={17} />
              <strong>{incident?.deploy || service.deploy}</strong>
            </div>
            <p>
              {incident
                ? "Latency changed inside the rollout window. Compare this version against the previous edge configuration."
                : "Latest change attached to this service in the selected workspace."}
            </p>
          </div>
        </section>
        <section className="drawer-section">
          <div className="drawer-section-heading">
            <h3>Evidence snapshot</h3>
            <span>deterministic demo data</span>
          </div>
          <code className="evidence-code">
            {incident?.evidence || service.evidence}
          </code>
        </section>
      </div>
      <footer className="drawer-footer">
        {incident && !incident.acknowledged ? (
          <button
            type="button"
            className="button primary drawer-action"
            onClick={() => onAcknowledge(incident.id)}
            disabled={acknowledging}
            aria-busy={acknowledging}
          >
            {acknowledging ? "Acknowledging…" : "Acknowledge incident"}
          </button>
        ) : (
          <span className="acknowledged-note">
            <Icon name="check" size={15} />
            {incident ? "Incident acknowledged" : "No action required"}
          </span>
        )}
        <button type="button" className="button quiet" onClick={onClose}>
          Close evidence
        </button>
      </footer>
    </aside>
  );
}

function App() {
  const [environment, setEnvironment] = useState("production");
  const [range, setRange] = useState("6h");
  const [filter, setFilter] = useState("");
  const [attentionOnly, setAttentionOnly] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedIncidentId, setSelectedIncidentId] = useState(
    "inc-payment-latency",
  );
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [acknowledgedIds, setAcknowledgedIds] = useState(
    () =>
      new Set(
        INCIDENTS.filter((incident) => incident.acknowledged).map(
          (incident) => incident.id,
        ),
      ),
  );
  const [acknowledgingId, setAcknowledgingId] = useState(null);
  const [feedback, setFeedback] = useState("");
  const drawerTriggerRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const env = ENVIRONMENTS[environment];
  const selectedIncident = INCIDENTS.find(
    (incident) => incident.id === selectedIncidentId,
  );
  const selectedService = SERVICES.find(
    (service) => service.id === selectedServiceId,
  );
  const incidents = useMemo(
    () =>
      INCIDENTS.map((incident) => ({
        ...incident,
        acknowledged: acknowledgedIds.has(incident.id),
      })),
    [acknowledgedIds],
  );

  useEffect(() => {
    document.title = `${env.label} checkout health · Lattice Signal`;
  }, [env.label]);

  const announce = (message) => setFeedback(message);

  const handleEnvironmentChange = (nextEnvironment) => {
    setEnvironment(nextEnvironment);
    announce(
      `${ENVIRONMENTS[nextEnvironment].label} workspace loaded for ${RANGE_DATA[range].label}.`,
    );
  };

  const handleRangeChange = (nextRange) => {
    setRange(nextRange);
    announce(
      `Showing ${ENVIRONMENTS[environment].label.toLowerCase()} checkout data for ${RANGE_DATA[nextRange].label}.`,
    );
  };

  const openIncident = (incidentId, trigger) => {
    const incident = incidents.find((item) => item.id === incidentId);
    setSelectedIncidentId(incidentId);
    setSelectedServiceId(incident.serviceId);
    setDrawerOpen(true);
    drawerTriggerRef.current = trigger;
    announce(`Evidence opened for ${incident.title}.`);
  };

  const openService = (serviceId, trigger) => {
    const service = SERVICES.find((item) => item.id === serviceId);
    const relatedIncident = incidents.find(
      (incident) => incident.serviceId === serviceId,
    );
    setSelectedServiceId(serviceId);
    if (relatedIncident) setSelectedIncidentId(relatedIncident.id);
    setDrawerOpen(true);
    drawerTriggerRef.current = trigger;
    announce(`${service.name} evidence opened.`);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    window.requestAnimationFrame(() => drawerTriggerRef.current?.focus());
  };

  const acknowledge = (incidentId) => {
    const incident = incidents.find((item) => item.id === incidentId);
    if (!incident || incident.acknowledged) return;
    setAcknowledgingId(incidentId);
    window.setTimeout(
      () => {
        setAcknowledgedIds((current) => new Set([...current, incidentId]));
        setAcknowledgingId(null);
        announce(
          `${incident.title} acknowledged. The signal remains available in the audit trail.`,
        );
      },
      reducedMotion ? 0 : 260,
    );
  };

  const handleAttentionToggle = (event) => {
    const next = event.target.checked;
    setAttentionOnly(next);
    announce(
      next
        ? "Attention view on. Healthy services and acknowledged history are hidden."
        : "Attention view off. Showing all checkout services.",
    );
  };

  return (
    <div className="app-shell">
      <header className="workspace-header">
        <div className="header-inner">
          <div className="brand-row">
            <button
              type="button"
              className="menu-toggle"
              aria-expanded={menuOpen}
              aria-controls="primary-navigation"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            >
              <Icon name={menuOpen ? "close" : "menu"} size={20} />
            </button>
            <a
              className="brand"
              href="#overview"
              aria-label="Lattice Signal overview"
            >
              <span className="brand-mark">
                <Icon name="leaf" size={16} />
              </span>
              <span className="brand-name">
                <strong>Lattice</strong>
                <em>Signal</em>
              </span>
            </a>
            <nav
              className={`primary-nav ${menuOpen ? "is-open" : ""}`}
              id="primary-navigation"
              aria-label="Primary navigation"
            >
              <a
                className="nav-link active"
                href="#overview"
                aria-current="page"
                onClick={() => setMenuOpen(false)}
              >
                Overview
              </a>
              <a
                className="nav-link"
                href="#services"
                onClick={() => setMenuOpen(false)}
              >
                Services
              </a>
              <a
                className="nav-link"
                href="#incidents"
                onClick={() => setMenuOpen(false)}
              >
                Incidents <span className="nav-count">1</span>
              </a>
              <a
                className="nav-link"
                href="#evidence"
                onClick={() => setMenuOpen(false)}
              >
                Evidence
              </a>
            </nav>
          </div>
          <div className="header-context" aria-label="Workspace context">
            <div className="context-block">
              <span className="context-label">Workspace</span>
              <strong>Commerce / checkout</strong>
            </div>
            <label className="environment-control">
              <span className="context-label">Environment</span>
              <select
                value={environment}
                onChange={(event) =>
                  handleEnvironmentChange(event.target.value)
                }
                aria-label="Environment"
              >
                <option value="production">Production</option>
                <option value="staging">Staging</option>
              </select>
            </label>
            <span className="freshness-pill">
              <span className="freshness-dot" />
              Fresh data · {env.freshness}
            </span>
            <button
              type="button"
              className="icon-button header-icon"
              aria-label="Notifications"
              onClick={() =>
                announce(
                  "No new notifications. The response queue is up to date.",
                )
              }
            >
              <Icon name="bell" size={17} />
            </button>
            <span
              className="header-avatar"
              aria-label="Signed in as Grace Osei"
            >
              GO
            </span>
          </div>
        </div>
      </header>

      <main className="page" id="overview">
        <section className="intro-section">
          <div className="intro-copy">
            <p className="eyebrow">
              Checkout workspace <span className="eyebrow-slash">/</span>{" "}
              {env.label} <span className="eyebrow-slash">/</span> {env.region}
            </p>
            <h1>Good morning, Grace.</h1>
            <p className="insight">
              <span className="insight-marker">
                <Icon name="pulse" size={15} />
              </span>
              {env.health}
            </p>
            <p className="intro-detail">{env.healthDetail}</p>
          </div>
          <div className="intro-actions">
            <span className="updated-note">
              <span className="freshness-dot" />
              Updated {env.freshness}
            </span>
            <button
              type="button"
              className="button primary"
              onClick={(event) =>
                openIncident("inc-payment-latency", event.currentTarget)
              }
            >
              Open active signal <Icon name="arrow" size={16} />
            </button>
          </div>
        </section>

        <div className="workspace-toolbar">
          <div className="toolbar-scope">
            <span className="toolbar-label">Scope</span>
            <strong>Checkout path</strong>
            <span className="toolbar-divider" />
            <span className="toolbar-caption">
              Fresh deterministic demo data
            </span>
          </div>
          <label className="attention-toggle">
            <input
              type="checkbox"
              checked={attentionOnly}
              onChange={handleAttentionToggle}
            />
            <span className="toggle-track">
              <span className="toggle-thumb" />
            </span>
            <span>Show only what needs attention</span>
            <strong>{attentionOnly ? "On" : "Off"}</strong>
          </label>
        </div>
        <div
          className="feedback-region"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {feedback && (
            <>
              <Icon name="check" size={15} />
              <span>{feedback}</span>
            </>
          )}
        </div>

        <section className="kpi-grid" aria-label="Checkout health metrics">
          {env.metrics.map((metric) => (
            <article
              className={`kpi-card metric-${metric.tone}`}
              key={metric.label}
            >
              <div className="kpi-topline">
                <span>{metric.label}</span>
                <Icon
                  name={
                    metric.label === "p95 latency"
                      ? "pulse"
                      : metric.label === "Error budget"
                        ? "shield"
                        : "trend"
                  }
                  size={16}
                />
              </div>
              <div className="kpi-value-row">
                <strong>{metric.value}</strong>
                <MetricSpark path={metric.spark} tone={metric.tone} />
              </div>
              <div className="kpi-bottomline">
                <span className={`metric-delta delta-${metric.tone}`}>
                  {metric.delta}
                </span>
                <span>{metric.caption}</span>
              </div>
            </article>
          ))}
        </section>

        <div className="overview-grid">
          <section className="panel trend-panel" aria-labelledby="trend-title">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Current vs baseline</p>
                <h2 id="trend-title">Where checkout is stretching</h2>
                <p className="panel-subcopy">
                  p95 latency · {RANGE_DATA[range].label} · {env.label}
                </p>
              </div>
              <RangeControl range={range} onChange={handleRangeChange} />
            </div>
            <TrendChart range={range} environment={env} />
            <div className="chart-actions">
              <span>
                <Icon name="spark" size={15} />
                Baseline is the trailing 30-day median.
              </span>
              <button
                type="button"
                className="text-button"
                onClick={(event) =>
                  openService("payments-api", event.currentTarget)
                }
              >
                Inspect payment edge <Icon name="arrow" size={14} />
              </button>
            </div>
          </section>
          <IncidentTimeline
            incidents={incidents}
            selectedIncidentId={selectedIncidentId}
            attentionOnly={attentionOnly}
            onOpen={openIncident}
            onAcknowledge={acknowledge}
          />
        </div>

        <ServiceEvidence
          services={SERVICES}
          filter={filter}
          onFilterChange={setFilter}
          onClearFilter={() => {
            setFilter("");
            announce("Service filter cleared.");
          }}
          selectedServiceId={selectedServiceId}
          selectedIncident={selectedIncident}
          attentionOnly={attentionOnly}
          reducedMotion={reducedMotion}
          onSelect={openService}
        />
        <ServiceRoster
          services={SERVICES}
          filter={filter}
          attentionOnly={attentionOnly}
          onSelect={openService}
        />
        <footer className="page-footer">
          <span>
            <span className="brand-mark mini">
              <Icon name="leaf" size={13} />
            </span>
            Lattice Signal
          </span>
          <span>
            Observability workspace · {env.label} · {RANGE_DATA[range].label}
          </span>
          <span className="footer-right">
            No live data connected · demo workspace
          </span>
        </footer>
      </main>

      <EvidenceDrawer
        open={drawerOpen}
        selectedIncident={selectedIncident}
        selectedService={selectedService}
        onClose={closeDrawer}
        onAcknowledge={acknowledge}
        acknowledging={acknowledgingId === selectedIncident?.id}
      />
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
