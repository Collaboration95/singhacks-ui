import { useEffect, useMemo, useRef, useState } from "react";

const STATUS_META = {
  degraded: { label: "Degraded", tone: "danger", icon: "alert" },
  watch: { label: "Watch", tone: "warning", icon: "eye" },
  healthy: { label: "Healthy", tone: "success", icon: "check" },
};

const ENVIRONMENTS = {
  Production: {
    region: "us-east-1",
    freshness: "12s ago",
    availability: "99.96%",
    availabilityDelta: "+0.02%",
    latency: "842ms",
    latencyDelta: "+18%",
    errorRate: "0.34%",
    errorDelta: "+0.12pp",
    budget: "62%",
    budgetDelta: "14m burned",
    summary: "One checkout path is slower than its baseline.",
  },
  Staging: {
    region: "us-east-1",
    freshness: "18s ago",
    availability: "99.99%",
    availabilityDelta: "+0.04%",
    latency: "296ms",
    latencyDelta: "−6%",
    errorRate: "0.08%",
    errorDelta: "−0.03pp",
    budget: "88%",
    budgetDelta: "3m burned",
    summary: "Staging is calm; the production regression is isolated.",
  },
  Development: {
    region: "local",
    freshness: "demo data",
    availability: "100%",
    availabilityDelta: "steady",
    latency: "118ms",
    latencyDelta: "−12%",
    errorRate: "0.01%",
    errorDelta: "steady",
    budget: "96%",
    budgetDelta: "no burn",
    summary: "Development traffic is below the alerting threshold.",
  },
};

const TIME_RANGES = ["Last 24 hours", "Last 7 days", "Last 30 days"];

const RANGE_PRESETS = [
  {
    id: "checkout-regression",
    label: "12:00–12:15 UTC",
    shortLabel: "15m window",
    start: 50,
    end: 63,
    services: ["checkout-api", "payment-worker", "fraud-gateway"],
    title: "Checkout latency regression",
    traces: ["trace-7f2d9c", "trace-4a81c0", "trace-bc118e"],
    deploy: "checkout-api v2.18.0",
  },
  {
    id: "payment-retry",
    label: "08:40–09:05 UTC",
    shortLabel: "25m window",
    start: 35,
    end: 48,
    services: ["payment-worker", "checkout-api"],
    title: "Payment retry burst",
    traces: ["trace-1ee8a5", "trace-998a4d"],
    deploy: "payment-worker v4.6.2",
  },
  {
    id: "tax-baseline",
    label: "03:20–03:35 UTC",
    shortLabel: "15m window",
    start: 14,
    end: 22,
    services: ["tax-service"],
    title: "Tax quote variance",
    traces: ["trace-a910d2"],
    deploy: "tax-service v1.12.4",
  },
];

const SERVICE_DATA = [
  {
    id: "checkout-api",
    name: "checkout-api",
    role: "Edge orchestration",
    status: "degraded",
    owner: "Maya Chen",
    initials: "MC",
    deploy: "14 min ago",
    version: "v2.18.0",
    p95: 842,
    errorBudget: 18,
    errorRate: "1.8%",
    region: "us-east-1",
    traceCount: "1,842",
  },
  {
    id: "payment-worker",
    name: "payment-worker",
    role: "Payment capture",
    status: "watch",
    owner: "Sam Rivera",
    initials: "SR",
    deploy: "2h ago",
    version: "v4.6.2",
    p95: 624,
    errorBudget: 42,
    errorRate: "0.9%",
    region: "us-east-1",
    traceCount: "624",
  },
  {
    id: "fraud-gateway",
    name: "fraud-gateway",
    role: "Risk scoring",
    status: "watch",
    owner: "Noah Williams",
    initials: "NW",
    deploy: "Yesterday",
    version: "v3.1.9",
    p95: 518,
    errorBudget: 57,
    errorRate: "0.5%",
    region: "us-east-1",
    traceCount: "407",
  },
  {
    id: "tax-service",
    name: "tax-service",
    role: "Tax calculation",
    status: "healthy",
    owner: "Priya Nair",
    initials: "PN",
    deploy: "3d ago",
    version: "v1.12.4",
    p95: 241,
    errorBudget: 79,
    errorRate: "0.08%",
    region: "us-east-1",
    traceCount: "198",
  },
  {
    id: "cart-service",
    name: "cart-service",
    role: "Cart state",
    status: "healthy",
    owner: "Eli Brooks",
    initials: "EB",
    deploy: "6d ago",
    version: "v6.4.1",
    p95: 188,
    errorBudget: 91,
    errorRate: "0.03%",
    region: "us-east-1",
    traceCount: "92",
  },
  {
    id: "catalog-service",
    name: "catalog-service",
    role: "Inventory lookup",
    status: "healthy",
    owner: "Ava Patel",
    initials: "AP",
    deploy: "8d ago",
    version: "v2.9.8",
    p95: 154,
    errorBudget: 94,
    errorRate: "0.02%",
    region: "us-east-1",
    traceCount: "64",
  },
  {
    id: "profile-service",
    name: "profile-service",
    role: "Customer profile",
    status: "healthy",
    owner: "Jon Bell",
    initials: "JB",
    deploy: "11d ago",
    version: "v5.3.0",
    p95: 123,
    errorBudget: 97,
    errorRate: "0.01%",
    region: "us-east-1",
    traceCount: "38",
  },
];

const TREND_CURRENT = [
  42, 39, 38, 40, 45, 50, 55, 58, 56, 61, 66, 72, 78, 76, 73, 70, 67, 62, 60,
  58, 57, 55, 54, 53,
];

const TREND_BASELINE = [
  40, 39, 38, 38, 40, 43, 46, 48, 50, 52, 54, 57, 59, 60, 59, 58, 56, 54, 52,
  51, 50, 49, 48, 47,
];

const NAV_GROUPS = [
  {
    label: "Observe",
    items: [
      { label: "Overview", icon: "grid", href: "#overview", current: true },
      { label: "Services", icon: "service", href: "#service-evidence" },
      { label: "Traces", icon: "traces", href: "#evidence-rail" },
    ],
  },
  {
    label: "Investigate",
    items: [
      {
        label: "Incidents",
        icon: "incident",
        href: "#open-signals",
        count: "1",
      },
      { label: "Deployments", icon: "deploy", href: "#recent-activity" },
      { label: "Runbooks", icon: "runbook", href: "#runbooks" },
    ],
  },
];

function Icon({ name, size = 16, strokeWidth = 1.8 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    focusable: false,
  };

  const shapes = {
    grid: (
      <>
        <rect x="3.5" y="3.5" width="7" height="7" rx="1" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="1" />
      </>
    ),
    service: (
      <>
        <rect x="3.5" y="4" width="17" height="5" rx="1" />
        <rect x="3.5" y="15" width="17" height="5" rx="1" />
        <path d="M7 9v6M17 9v6" />
      </>
    ),
    traces: (
      <>
        <path d="M4 7h5l3 5h8" />
        <path d="M4 17h5l3-5" />
        <circle cx="4" cy="7" r="1.5" />
        <circle cx="20" cy="12" r="1.5" />
        <circle cx="4" cy="17" r="1.5" />
      </>
    ),
    incident: (
      <>
        <path d="M12 3.5 20.5 19a1 1 0 0 1-.87 1.5H4.37A1 1 0 0 1 3.5 19L12 3.5Z" />
        <path d="M12 9v4.5M12 17.2h.01" />
      </>
    ),
    deploy: (
      <>
        <path d="M4 19.5h16M6 17V8.5h12V17M8.5 8.5V5h7v3.5M10 12h4M10 14.5h4" />
      </>
    ),
    runbook: (
      <>
        <path d="M5 4.5h11a3 3 0 0 1 3 3v12H8a3 3 0 0 1-3-3v-12Z" />
        <path d="M8 4.5v12a3 3 0 0 0 3 3M9 9h6M9 12h6" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path
          d="m19.4 15 .1.1a1.6 1.6 0 0 1-2.3 2.3l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.2a1.6 1.6 0 0 1-3.2 0v-.2a1.6 1.6 0 0 0-2.7-1.1l-.1.1a1.6 1.6 0 0 1-2.3-2.3l.1-.1A1.6 1.6 0 0 0 5.1 12a1.6 1.6 0 0 0-1.1-2.7h-.2a1.6 1.6 0 0 1 0-3.2H4A1.6 1.6 0 0 0 5.1 3.4L5 3.3A1.6 1.6 0 0 1 7.3 1l.1.1a1.6 1.6 0 0 0 2.7-1.1v-.2a1.6 1.6 0 0 1 3.2 0V0a1.6 1.6 0 0 0 2.7 1.1l.1-.1a1.6 1.6 0 0 1 2.3 2.3l-.1.1A1.6 1.6 0 0 0 19.5 6c.3.5.8.8 1.4.8h.2a1.6 1.6 0 0 1 0 3.2h-.2a1.6 1.6 0 0 0-1.5 1.1 1.6 1.6 0 0 0 0 1.9Z"
          transform="scale(.82) translate(2.6 2.6)"
        />
      </>
    ),
    search: (
      <>
        <circle cx="10.8" cy="10.8" r="6.3" />
        <path d="m16 16 4.5 4.5" />
      </>
    ),
    chevronDown: <path d="m7 9 5 5 5-5" />,
    chevronRight: <path d="m9 6 6 6-6 6" />,
    arrowUpRight: <path d="M7 17 17 7M9 7h8v8" />,
    arrowRight: <path d="M5 12h14m-6-6 6 6-6 6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7v5l3.5 2" />
      </>
    ),
    refresh: (
      <>
        <path d="M19 8.5A7.5 7.5 0 1 0 19.2 15" />
        <path d="M19 4v4.5h-4.5" />
      </>
    ),
    export: (
      <>
        <path d="M12 3v11M8 7l4-4 4 4M5 13v6h14v-6" />
      </>
    ),
    menu: (
      <>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </>
    ),
    x: <path d="m6 6 12 12M18 6 6 18" />,
    check: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="m8 12 2.7 2.7L16.5 9" />
      </>
    ),
    alert: (
      <>
        <path d="M12 3.5 20.5 19a1 1 0 0 1-.87 1.5H4.37A1 1 0 0 1 3.5 19L12 3.5Z" />
        <path d="M12 9v4.5M12 17.2h.01" />
      </>
    ),
    eye: (
      <>
        <path d="M3.5 12s3-5 8.5-5 8.5 5 8.5 5-3 5-8.5 5-8.5-5-8.5-5Z" />
        <circle cx="12" cy="12" r="2" />
      </>
    ),
    filter: (
      <>
        <path d="M4 6h16M7 12h10M10 18h4" />
      </>
    ),
    dots: (
      <>
        <circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" />
      </>
    ),
    activity: (
      <>
        <path d="M3.5 12h4l2-6 4.5 12 2-6h4.5" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3.5 19 6v5.5c0 4.5-2.8 7.5-7 9-4.2-1.5-7-4.5-7-9V6l7-2.5Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    bolt: <path d="m13 2-8 11h6l-1 9 8-11h-6l1-9Z" />,
    database: (
      <>
        <ellipse cx="12" cy="5.5" rx="7.5" ry="3" />
        <path d="M4.5 5.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6M4.5 11.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M3.8 12h16.4M12 3.5c2.3 2.4 3.5 5.2 3.5 8.5s-1.2 6.1-3.5 8.5c-2.3-2.4-3.5-5.2-3.5-8.5S9.7 5.9 12 3.5Z" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="3" />
        <path d="M5.5 20c.7-3 2.8-4.5 6.5-4.5s5.8 1.5 6.5 4.5" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="10" rx="1.5" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    spark: (
      <>
        <path d="m12 3 1.2 5.8L19 10l-5.8 1.2L12 17l-1.2-5.8L5 10l5.8-1.2L12 3Z" />
        <path d="m19 16 .5 2.5L22 19l-2.5.5L19 22l-.5-2.5L16 19l2.5-.5L19 16Z" />
      </>
    ),
  };

  return <svg {...common}>{shapes[name] ?? shapes.spark}</svg>;
}

function StatusBadge({ status, compact = false }) {
  const meta = STATUS_META[status] ?? STATUS_META.healthy;
  return (
    <span
      className={`status-badge status-${meta.tone} ${compact ? "is-compact" : ""}`}
    >
      <Icon name={meta.icon} size={compact ? 12 : 13} />
      <span>{meta.label}</span>
    </span>
  );
}

function Sparkline({ values, tone = "cobalt" }) {
  const width = 104;
  const height = 34;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const path = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - 5 - ((value - min) / (max - min || 1)) * (height - 10);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg
      className={`sparkline sparkline-${tone}`}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

function KpiCard({
  label,
  value,
  delta,
  note,
  icon,
  tone = "neutral",
  values,
}) {
  return (
    <article className="kpi-card">
      <div className="kpi-topline">
        <span className="kpi-label">{label}</span>
        <span className={`kpi-icon kpi-icon-${tone}`}>
          <Icon name={icon} size={15} />
        </span>
      </div>
      <div className="kpi-value-row">
        <span className="kpi-value">{value}</span>
        <Sparkline
          values={values}
          tone={
            tone === "warning"
              ? "amber"
              : tone === "success"
                ? "green"
                : "cobalt"
          }
        />
      </div>
      <div className="kpi-meta">
        <span className={`delta delta-${tone}`}>{delta}</span>
        <span>{note}</span>
      </div>
    </article>
  );
}

function buildChartPath(values, width, height, padding, min = 30, max = 85) {
  return values
    .map((value, index) => {
      const x = padding + (index / (values.length - 1)) * (width - padding * 2);
      const y =
        height -
        padding -
        ((value - min) / (max - min)) * (height - padding * 2);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function formatBudget(value) {
  return `${value}% left`;
}

function App() {
  const [environment, setEnvironment] = useState("Production");
  const [timeRange, setTimeRange] = useState("Last 24 hours");
  const [selectedRangeId, setSelectedRangeId] = useState("checkout-regression");
  const [selectedServiceId, setSelectedServiceId] = useState("checkout-api");
  const [panelOpen, setPanelOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showImpactedOnly, setShowImpactedOnly] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "p95",
    direction: "desc",
  });
  const [acknowledgeStates, setAcknowledgeStates] = useState({});
  const [acknowledgedRanges, setAcknowledgedRanges] = useState({});
  const [toast, setToast] = useState(null);
  const searchRef = useRef(null);
  const panelRef = useRef(null);
  const mobileNavRef = useRef(null);
  const menuButtonRef = useRef(null);
  const lastTriggerRef = useRef(null);
  const toastTimerRef = useRef(null);
  const acknowledgeTimerRef = useRef(null);

  const env = ENVIRONMENTS[environment];
  const selectedRange =
    RANGE_PRESETS.find((range) => range.id === selectedRangeId) ??
    RANGE_PRESETS[0];
  const selectedService =
    SERVICE_DATA.find((service) => service.id === selectedServiceId) ??
    SERVICE_DATA[0];
  const impactedServiceIds = selectedRange.services;
  const selectedRangeAcknowledged = Boolean(
    acknowledgedRanges[selectedRangeId],
  );
  const activeIncidentAcknowledged = Boolean(
    acknowledgedRanges["checkout-regression"],
  );
  const selectedRangeAcknowledgeState =
    acknowledgeStates[selectedRangeId] ?? "idle";

  const announce = (message, tone = "info") => {
    setToast({ message, tone });
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 3800);
  };

  useEffect(() => {
    document.title = "Checkout health — Lattice Signal";
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
      if (acknowledgeTimerRef.current)
        window.clearTimeout(acknowledgeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!mobileNavOpen) return undefined;
    const drawer = mobileNavRef.current;
    const focusable = drawer?.querySelectorAll("a, button");
    focusable?.[0]?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMobileNavOpen(false);
        window.setTimeout(() => menuButtonRef.current?.focus(), 0);
      }
      if (event.key !== "Tab" || !focusable?.length) return;
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
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileNavOpen]);

  useEffect(() => {
    if (!panelOpen) return undefined;
    const panel = panelRef.current;
    const focusable = panel?.querySelectorAll("a, button");
    focusable?.[0]?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closePanel();
      }
      if (event.key !== "Tab" || !focusable?.length) return;
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
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [panelOpen]);

  const filteredServices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const next = SERVICE_DATA.filter((service) => {
      const matchesQuery =
        !query ||
        [
          service.name,
          service.role,
          service.owner,
          service.status,
          service.version,
        ].some((value) => value.toLowerCase().includes(query));
      const matchesImpacted =
        !showImpactedOnly || impactedServiceIds.includes(service.id);
      return matchesQuery && matchesImpacted;
    });

    return [...next].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc"
          ? aValue - bValue
          : bValue - aValue;
      }
      return (
        String(aValue).localeCompare(String(bValue)) *
        (sortConfig.direction === "asc" ? 1 : -1)
      );
    });
  }, [impactedServiceIds, searchQuery, showImpactedOnly, sortConfig]);

  const closePanel = () => {
    setPanelOpen(false);
    window.setTimeout(() => lastTriggerRef.current?.focus?.(), 0);
  };

  const openRange = (range, trigger) => {
    setSelectedRangeId(range.id);
    const firstRelated = range.services[0];
    if (firstRelated) setSelectedServiceId(firstRelated);
    lastTriggerRef.current = trigger ?? null;
    setPanelOpen(true);
  };

  const openService = (service, trigger) => {
    setSelectedServiceId(service.id);
    const relatedRange = RANGE_PRESETS.find((range) =>
      range.services.includes(service.id),
    );
    if (relatedRange) setSelectedRangeId(relatedRange.id);
    lastTriggerRef.current = trigger ?? null;
    setPanelOpen(true);
  };

  const handleChartClick = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const ratio = Math.max(
      0,
      Math.min(1, (event.clientX - bounds.left) / bounds.width),
    );
    const nearest = RANGE_PRESETS.reduce(
      (best, range) => {
        const midpoint = (range.start + range.end) / 2 / 100;
        const distance = Math.abs(midpoint - ratio);
        return distance < best.distance ? { range, distance } : best;
      },
      { range: RANGE_PRESETS[0], distance: Infinity },
    );
    openRange(nearest.range, event.currentTarget);
  };

  const handleChartKeyDown = (event) => {
    if ((event.key === "Enter" || event.key === " ") && !event.isComposing) {
      event.preventDefault();
      openRange(selectedRange, event.currentTarget);
    }
  };

  const toggleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "desc" ? "asc" : "desc",
    }));
  };

  const handleAcknowledge = () => {
    if (
      selectedRangeAcknowledgeState === "pending" ||
      selectedRangeAcknowledged
    )
      return;
    const rangeId = selectedRangeId;
    setAcknowledgeStates((current) => ({ ...current, [rangeId]: "pending" }));
    acknowledgeTimerRef.current = window.setTimeout(() => {
      setAcknowledgeStates((current) => ({ ...current, [rangeId]: "success" }));
      setAcknowledgedRanges((current) => ({ ...current, [rangeId]: true }));
      announce(
        "Incident acknowledged · checkout-api remains under watch",
        "success",
      );
    }, 620);
  };

  const chartWidth = 920;
  const chartHeight = 260;
  const chartPadding = 32;
  const currentPath = buildChartPath(
    TREND_CURRENT,
    chartWidth,
    chartHeight,
    chartPadding,
  );
  const baselinePath = buildChartPath(
    TREND_BASELINE,
    chartWidth,
    chartHeight,
    chartPadding,
    30,
    85,
  );
  const selectedStart =
    chartPadding +
    (selectedRange.start / 100) * (chartWidth - chartPadding * 2);
  const selectedEnd =
    chartPadding + (selectedRange.end / 100) * (chartWidth - chartPadding * 2);
  const currentArea = `${currentPath} L ${chartWidth - chartPadding} ${chartHeight - chartPadding} L ${chartPadding} ${chartHeight - chartPadding} Z`;

  const handleClearSearch = () => {
    setSearchQuery("");
    searchRef.current?.focus();
  };

  const handleNavClick = () => {
    if (!mobileNavOpen) return;
    setMobileNavOpen(false);
    window.setTimeout(() => menuButtonRef.current?.focus(), 0);
  };

  return (
    <div className="app-shell">
      <div
        className="app-content"
        aria-hidden={mobileNavOpen || panelOpen ? "true" : undefined}
        inert={mobileNavOpen || panelOpen ? "" : undefined}
      >
        <aside className="desktop-rail" aria-label="Primary navigation">
          <div className="rail-brand">
            <div className="brand-mark" aria-hidden="true">
              LS
            </div>
            <div>
              <div className="brand-name">Lattice Signal</div>
              <div className="brand-caption">Systems observability</div>
            </div>
          </div>

          <button
            className="workspace-switcher"
            type="button"
            onClick={() =>
              announce("Lattice Signal is the active workspace", "info")
            }
          >
            <span className="workspace-avatar">L</span>
            <span className="workspace-switcher-copy">
              <strong>Checkout workspace</strong>
              <span>Production · us-east-1</span>
            </span>
            <Icon name="chevronDown" size={14} />
          </button>

          <nav className="nav-groups">
            {NAV_GROUPS.map((group) => (
              <div className="nav-group" key={group.label}>
                <div className="nav-group-label">{group.label}</div>
                {group.items.map((item) => (
                  <a
                    className={`nav-item ${item.current ? "is-current" : ""}`}
                    href={item.href}
                    key={item.label}
                    aria-current={item.current ? "page" : undefined}
                  >
                    <Icon name={item.icon} size={16} />
                    <span>{item.label}</span>
                    {item.count ? (
                      <span className="nav-count">{item.count}</span>
                    ) : null}
                  </a>
                ))}
              </div>
            ))}
          </nav>

          <div className="rail-footer">
            <a className="nav-item" href="#settings">
              <Icon name="settings" size={16} />
              <span>Settings</span>
            </a>
            <div className="ingest-card">
              <div className="ingest-card-topline">
                <span className="live-dot" aria-hidden="true" />
                <span>Live ingest</span>
                <span className="ingest-ok">OK</span>
              </div>
              <strong>2.4M events today</strong>
              <span>99.98% accepted</span>
            </div>
            <button
              className="rail-profile"
              type="button"
              onClick={() =>
                announce(
                  "Profile controls are available in the full workspace",
                  "info",
                )
              }
            >
              <span className="profile-avatar">MC</span>
              <span>
                <strong>Maya Chen</strong>
                <small>Staff engineer</small>
              </span>
              <Icon name="dots" size={14} />
            </button>
          </div>
        </aside>

        <div className="app-column">
          <header className="topbar">
            <button
              className="icon-button mobile-menu-button"
              type="button"
              aria-label="Open workspace navigation"
              aria-expanded={mobileNavOpen}
              ref={menuButtonRef}
              onClick={() => setMobileNavOpen(true)}
            >
              <Icon name="menu" size={19} />
            </button>
            <div className="breadcrumbs" aria-label="Breadcrumb">
              <a href="#overview">Workspaces</a>
              <span aria-hidden="true">/</span>
              <a href="#overview">Checkout</a>
              <span aria-hidden="true">/</span>
              <span aria-current="page">Overview</span>
            </div>
            <div className="topbar-actions">
              <div className="topbar-status">
                <span className="live-dot" aria-hidden="true" />
                <span>All systems operational</span>
              </div>
              <button
                className="topbar-icon-action"
                type="button"
                aria-label="Open command search"
                onClick={() => searchRef.current?.focus()}
              >
                <Icon name="search" size={16} />
                <span className="shortcut-hint">⌘ K</span>
              </button>
              <button
                className="profile-menu-button"
                type="button"
                onClick={() =>
                  announce(
                    "Profile controls are available in the full workspace",
                    "info",
                  )
                }
              >
                <span className="profile-avatar profile-avatar-small">MC</span>
                <span className="profile-menu-name">Maya Chen</span>
                <Icon name="chevronDown" size={13} />
              </button>
            </div>
          </header>

          <main
            className="workspace-main"
            id="overview"
            aria-labelledby="page-title"
          >
            <section className="page-heading">
              <div>
                <div className="eyebrow">
                  Workspace overview <span className="eyebrow-slash">/</span>{" "}
                  Checkout
                </div>
                <h1 id="page-title">Checkout health</h1>
                <p className="page-subtitle">
                  A live read on the path from cart to payment capture.
                </p>
              </div>
              <div className="page-actions">
                <span className="freshness-label">
                  <span className="freshness-pulse" aria-hidden="true" />
                  Updated {env.freshness}
                </span>
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={() => announce("Checkout view refreshed", "success")}
                >
                  <Icon name="refresh" size={14} />
                  Refresh
                </button>
                <button
                  className="button button-primary"
                  type="button"
                  onClick={() =>
                    announce(
                      "Export queued for the current checkout view",
                      "success",
                    )
                  }
                >
                  <Icon name="export" size={14} />
                  Export view
                </button>
              </div>
            </section>

            <section className="control-strip" aria-label="Workspace controls">
              <div className="control-group">
                <span className="control-label">Environment</span>
                <div className="select-shell">
                  <Icon name="globe" size={14} />
                  <select
                    value={environment}
                    onChange={(event) => setEnvironment(event.target.value)}
                    aria-label="Environment"
                  >
                    {Object.keys(ENVIRONMENTS).map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="control-divider" aria-hidden="true" />
              <div className="control-group">
                <span className="control-label">Time window</span>
                <div className="select-shell">
                  <Icon name="clock" size={14} />
                  <select
                    value={timeRange}
                    onChange={(event) => setTimeRange(event.target.value)}
                    aria-label="Time window"
                  >
                    {TIME_RANGES.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="control-summary">
                <span className="control-summary-mark">
                  <Icon name="database" size={14} />
                </span>
                <span>
                  <strong>{environment}</strong> · {env.region} ·{" "}
                  {timeRange.toLowerCase()}
                </span>
              </div>
            </section>

            <section
              className="insight-banner"
              aria-label="Current checkout insight"
            >
              <div className="insight-icon">
                <Icon name="spark" size={19} />
              </div>
              <div className="insight-copy">
                <div className="insight-kicker">
                  Signal readout <span className="insight-line" />
                </div>
                <h2>
                  Checkout is healthy{" "}
                  <span>with one regression worth opening.</span>
                </h2>
                <p>
                  {env.summary} The selected 12:00–12:15 UTC window maps to
                  three services and one introducing deployment.
                </p>
              </div>
              <button
                className="insight-action"
                type="button"
                onClick={(event) =>
                  openRange(selectedRange, event.currentTarget)
                }
              >
                Open evidence
                <Icon name="arrowUpRight" size={15} />
              </button>
            </section>

            <section className="kpi-grid" aria-label="Checkout health metrics">
              <KpiCard
                label="Availability"
                value={env.availability}
                delta={env.availabilityDelta}
                note="vs baseline"
                icon="shield"
                tone="success"
                values={[6, 6, 7, 6, 7, 8, 8, 9, 9, 10]}
              />
              <KpiCard
                label="p95 latency"
                value={env.latency}
                delta={env.latencyDelta}
                note="vs baseline"
                icon="activity"
                tone="warning"
                values={[5, 6, 5, 7, 9, 8, 12, 15, 16, 18]}
              />
              <KpiCard
                label="Error rate"
                value={env.errorRate}
                delta={env.errorDelta}
                note="vs baseline"
                icon="alert"
                tone="danger"
                values={[8, 7, 7, 8, 9, 8, 10, 12, 13, 14]}
              />
              <KpiCard
                label="Error budget"
                value={env.budget}
                delta={env.budgetDelta}
                note="remaining"
                icon="bolt"
                tone="cobalt"
                values={[18, 20, 22, 24, 26, 30, 34, 38, 40, 42]}
              />
            </section>

            <section
              className="hero-grid"
              aria-label="Checkout evidence overview"
            >
              <article className="panel overview-panel" id="evidence-rail">
                <div className="panel-header overview-header">
                  <div>
                    <div className="panel-kicker">
                      Overview signal <span className="panel-kicker-rule" />
                    </div>
                    <h2>p95 latency · current vs baseline</h2>
                  </div>
                  <div className="panel-header-meta">
                    <span className="mini-metric">
                      <strong>842ms</strong>
                      <span>current peak</span>
                    </span>
                    <span className="panel-menu" aria-hidden="true">
                      <Icon name="dots" size={17} />
                    </span>
                  </div>
                </div>
                <div className="chart-legend" aria-label="Chart legend">
                  <span>
                    <i className="legend-swatch legend-current" />
                    Current p95
                  </span>
                  <span>
                    <i className="legend-swatch legend-baseline" />
                    7-day baseline
                  </span>
                  <span className="legend-selection-label">
                    <i className="legend-window" />
                    Selected range
                  </span>
                </div>
                <figure className="chart-figure">
                  <svg
                    className="overview-chart"
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    role="img"
                    aria-label="Current p95 latency climbs above the seven day baseline between 12:00 and 12:15 UTC. Select a point to inspect the evidence."
                    tabIndex="0"
                    onClick={handleChartClick}
                    onKeyDown={handleChartKeyDown}
                  >
                    <defs>
                      <linearGradient
                        id="cobalt-area"
                        x1="0"
                        x2="0"
                        y1="0"
                        y2="1"
                      >
                        <stop
                          offset="0"
                          stopColor="#3746c9"
                          stopOpacity="0.18"
                        />
                        <stop offset="1" stopColor="#3746c9" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient
                        id="selected-range"
                        x1="0"
                        x2="1"
                        y1="0"
                        y2="0"
                      >
                        <stop
                          offset="0"
                          stopColor="#3645c8"
                          stopOpacity="0.1"
                        />
                        <stop
                          offset="1"
                          stopColor="#9f9afa"
                          stopOpacity="0.32"
                        />
                      </linearGradient>
                    </defs>
                    {[0, 1, 2, 3].map((line) => {
                      const y =
                        chartPadding +
                        line * ((chartHeight - chartPadding * 2) / 3);
                      return (
                        <line
                          className="chart-grid-line"
                          key={line}
                          x1={chartPadding}
                          x2={chartWidth - chartPadding}
                          y1={y}
                          y2={y}
                        />
                      );
                    })}
                    <rect
                      className="chart-selected-window"
                      x={selectedStart}
                      y={chartPadding - 10}
                      width={selectedEnd - selectedStart}
                      height={chartHeight - chartPadding * 2 + 20}
                      rx="3"
                      fill="url(#selected-range)"
                      role="button"
                      tabIndex="0"
                      aria-label={`Inspect ${selectedRange.title}, ${selectedRange.label}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        openRange(selectedRange, event.currentTarget);
                      }}
                      onKeyDown={(event) => {
                        if (
                          (event.key === "Enter" || event.key === " ") &&
                          !event.isComposing
                        ) {
                          event.preventDefault();
                          openRange(selectedRange, event.currentTarget);
                        }
                      }}
                    />
                    <path
                      className="chart-area"
                      d={currentArea}
                      fill="url(#cobalt-area)"
                    />
                    <path className="chart-baseline" d={baselinePath} />
                    <path className="chart-current" d={currentPath} />
                    <line
                      className="chart-selection-edge"
                      x1={selectedStart}
                      x2={selectedStart}
                      y1={chartPadding - 4}
                      y2={chartHeight - chartPadding + 4}
                    />
                    <line
                      className="chart-selection-edge"
                      x1={selectedEnd}
                      x2={selectedEnd}
                      y1={chartPadding - 4}
                      y2={chartHeight - chartPadding + 4}
                    />
                    <circle
                      className="chart-point"
                      cx={selectedStart}
                      cy={chartPadding + 50}
                      r="5"
                    />
                    <circle
                      className="chart-point chart-point-end"
                      cx={selectedEnd}
                      cy={chartPadding + 36}
                      r="5"
                    />
                    {["00:00", "06:00", "12:00", "18:00", "24:00"].map(
                      (label, index) => (
                        <text
                          className="chart-x-label"
                          key={label}
                          x={
                            chartPadding +
                            index * ((chartWidth - chartPadding * 2) / 4)
                          }
                          y={chartHeight - 3}
                          textAnchor={
                            index === 0
                              ? "start"
                              : index === 4
                                ? "end"
                                : "middle"
                          }
                        >
                          {label}
                        </text>
                      ),
                    )}
                    {["900", "600", "300", "0"].map((label, index) => (
                      <text
                        className="chart-y-label"
                        key={label}
                        x="0"
                        y={
                          chartPadding +
                          index * ((chartHeight - chartPadding * 2) / 3) +
                          4
                        }
                      >
                        {label}
                      </text>
                    ))}
                  </svg>
                  <figcaption className="sr-only">
                    Latency is measured in milliseconds. Current p95 rises to
                    842 milliseconds while the seven-day baseline stays near 520
                    milliseconds. The selected range is {selectedRange.label}.
                  </figcaption>
                </figure>
                <div className="chart-footer">
                  <div
                    className="range-actions"
                    aria-label="Evidence range presets"
                  >
                    <span className="range-label">Inspect window</span>
                    {RANGE_PRESETS.map((range) => (
                      <button
                        className={`range-button ${selectedRangeId === range.id ? "is-selected" : ""}`}
                        type="button"
                        key={range.id}
                        aria-pressed={selectedRangeId === range.id}
                        onClick={(event) =>
                          openRange(range, event.currentTarget)
                        }
                      >
                        {range.shortLabel}
                      </button>
                    ))}
                  </div>
                  <button
                    className="text-link"
                    type="button"
                    onClick={(event) =>
                      openRange(selectedRange, event.currentTarget)
                    }
                  >
                    Open trace set <Icon name="arrowRight" size={14} />
                  </button>
                </div>

                <div
                  className="evidence-rail-block"
                  aria-label="Linked evidence rail"
                >
                  <div className="evidence-rail-header">
                    <div>
                      <div className="panel-kicker rail-kicker">
                        <span className="cobalt-pip" /> Evidence rail
                      </div>
                      <h3>
                        {selectedRange.label}{" "}
                        <span>· {selectedRange.title}</span>
                      </h3>
                    </div>
                    <span className="rail-impact-label">
                      <strong>{selectedRange.services.length}</strong> services
                      linked
                    </span>
                  </div>
                  <div className="rail-axis" aria-hidden="true">
                    <span>00:00</span>
                    <span>06:00</span>
                    <span>12:00</span>
                    <span>18:00</span>
                    <span>24:00</span>
                  </div>
                  <div className="rail-lanes">
                    <div
                      className="rail-time-marker"
                      style={{ left: `${selectedRange.start}%` }}
                      aria-hidden="true"
                    >
                      <span>{selectedRange.shortLabel}</span>
                    </div>
                    {SERVICE_DATA.slice(0, 5).map((service) => {
                      const isAffected = impactedServiceIds.includes(
                        service.id,
                      );
                      const isSelected = selectedServiceId === service.id;
                      return (
                        <div
                          className={`rail-lane ${isAffected ? "is-affected" : ""} ${isSelected ? "is-selected" : ""}`}
                          key={service.id}
                        >
                          <button
                            className="rail-service-button"
                            type="button"
                            onClick={(event) =>
                              openService(service, event.currentTarget)
                            }
                          >
                            <span
                              className={`rail-node rail-node-${service.status}`}
                              aria-hidden="true"
                            />
                            <span>{service.name}</span>
                          </button>
                          <div className="rail-line" aria-hidden="true">
                            <span className="rail-baseline-line" />
                            <span
                              className="rail-trace-segment"
                              style={{
                                left: `${Math.max(5, selectedRange.start - (service.status === "degraded" ? 4 : 1))}%`,
                                width: `${selectedRange.end - selectedRange.start + (service.status === "degraded" ? 10 : 3)}%`,
                              }}
                            />
                            {isAffected ? (
                              <span
                                className="rail-trace-notch"
                                style={{ left: `${selectedRange.end}%` }}
                              />
                            ) : null}
                          </div>
                          <span className="rail-lane-status">
                            {isAffected ? "linked" : "baseline"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </article>

              <aside
                className="panel signals-panel"
                id="open-signals"
                aria-labelledby="signals-title"
              >
                <div className="panel-header">
                  <div>
                    <div className="panel-kicker">
                      Investigate <span className="panel-kicker-rule" />
                    </div>
                    <h2 id="signals-title">Open signals</h2>
                  </div>
                  <span className="signal-count">1 active</span>
                </div>
                <div className="signal-card signal-card-active">
                  <div className="signal-card-topline">
                    <StatusBadge status="degraded" />
                    <span className="signal-time">12 min ago</span>
                  </div>
                  <h3>Checkout latency regression</h3>
                  <p>
                    p95 rose 18% above the 7-day baseline after a checkout-api
                    deploy.
                  </p>
                  <div className="signal-stat-row">
                    <span>
                      <strong>3</strong> services
                    </span>
                    <span>
                      <strong>5,284</strong> traces
                    </span>
                  </div>
                  <button
                    className="signal-open-button"
                    type="button"
                    onClick={(event) =>
                      openRange(RANGE_PRESETS[0], event.currentTarget)
                    }
                  >
                    Review evidence <Icon name="arrowUpRight" size={14} />
                  </button>
                </div>
                <div className="signal-divider">
                  <span>Related change</span>
                </div>
                <button
                  className="deploy-card"
                  type="button"
                  onClick={() =>
                    announce(
                      "Deployment checkout-api v2.18.0 is selected in the evidence panel",
                      "info",
                    )
                  }
                >
                  <span className="deploy-icon">
                    <Icon name="deploy" size={15} />
                  </span>
                  <span className="deploy-copy">
                    <strong>checkout-api v2.18.0</strong>
                    <span>Deployed 14 min ago · Maya Chen</span>
                  </span>
                  <Icon name="chevronRight" size={15} />
                </button>
                <div className="signal-note">
                  <Icon name="lock" size={13} />
                  <span>Evidence is read-only in this demo workspace.</span>
                </div>
              </aside>
            </section>

            <section
              className="secondary-grid"
              aria-label="Supporting signal breakdowns"
            >
              <article className="panel secondary-panel error-panel">
                <div className="panel-header">
                  <div>
                    <div className="panel-kicker">
                      Where errors start <span className="panel-kicker-rule" />
                    </div>
                    <h2>Error-source mix</h2>
                  </div>
                  <button
                    className="panel-icon-button"
                    type="button"
                    aria-label="More error source options"
                    onClick={() =>
                      announce(
                        "Error source options are not available in the demo",
                        "info",
                      )
                    }
                  >
                    <Icon name="dots" size={17} />
                  </button>
                </div>
                <p className="panel-description">
                  Share of failed checkout spans in {environment.toLowerCase()}.
                </p>
                <div
                  className="mix-chart"
                  aria-label="Error sources: upstream timeout 52 percent, payment decline 27 percent, validation 13 percent, other 8 percent"
                >
                  <div className="mix-bar" aria-hidden="true">
                    <span
                      className="mix-segment mix-cobalt"
                      style={{ width: "52%" }}
                    />
                    <span
                      className="mix-segment mix-violet"
                      style={{ width: "27%" }}
                    />
                    <span
                      className="mix-segment mix-amber"
                      style={{ width: "13%" }}
                    />
                    <span
                      className="mix-segment mix-slate"
                      style={{ width: "8%" }}
                    />
                  </div>
                  <div className="mix-list">
                    {[
                      ["Upstream timeout", "52%", "cobalt"],
                      ["Payment decline", "27%", "violet"],
                      ["Validation", "13%", "amber"],
                      ["Other", "8%", "slate"],
                    ].map(([label, value, tone]) => (
                      <div className="mix-row" key={label}>
                        <span className="mix-label">
                          <i className={`mix-dot mix-dot-${tone}`} />
                          {label}
                        </span>
                        <strong>{value}</strong>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="panel-footer-link">
                  <button
                    className="text-link"
                    type="button"
                    onClick={(event) =>
                      openRange(selectedRange, event.currentTarget)
                    }
                  >
                    See related traces <Icon name="arrowRight" size={14} />
                  </button>
                  <span className="footnote">5,284 spans</span>
                </div>
              </article>

              <article className="panel secondary-panel latency-panel">
                <div className="panel-header">
                  <div>
                    <div className="panel-kicker">
                      Slowest paths <span className="panel-kicker-rule" />
                    </div>
                    <h2>Latency by service</h2>
                  </div>
                  <button
                    className="panel-icon-button"
                    type="button"
                    aria-label="More latency options"
                    onClick={() =>
                      announce(
                        "Latency options are not available in the demo",
                        "info",
                      )
                    }
                  >
                    <Icon name="dots" size={17} />
                  </button>
                </div>
                <p className="panel-description">
                  p95 response time · {timeRange.toLowerCase()}
                </p>
                <div className="latency-list">
                  {SERVICE_DATA.slice(0, 5).map((service) => (
                    <button
                      className="latency-row"
                      type="button"
                      key={service.id}
                      onClick={(event) =>
                        openService(service, event.currentTarget)
                      }
                    >
                      <span className="latency-service">
                        <span
                          className={`latency-node latency-node-${service.status}`}
                          aria-hidden="true"
                        />
                        {service.name}
                      </span>
                      <span className="latency-track" aria-hidden="true">
                        <span
                          style={{
                            width: `${Math.min(100, (service.p95 / 900) * 100)}%`,
                          }}
                        />
                      </span>
                      <strong>{service.p95}ms</strong>
                    </button>
                  ))}
                </div>
                <div className="panel-footer-link">
                  <button
                    className="text-link"
                    type="button"
                    onClick={() =>
                      document
                        .getElementById("service-evidence")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    View service ranking <Icon name="arrowRight" size={14} />
                  </button>
                  <span className="footnote">7 services</span>
                </div>
              </article>
            </section>

            <section
              className="panel service-panel"
              id="service-evidence"
              aria-labelledby="service-evidence-title"
            >
              <div className="service-panel-topline">
                <div>
                  <div className="panel-kicker">
                    Ranked evidence <span className="panel-kicker-rule" />
                  </div>
                  <h2 id="service-evidence-title">Service evidence</h2>
                  <p className="panel-description">
                    The rows most likely to explain the selected window.
                  </p>
                </div>
                <div className="service-panel-tools">
                  <div className="search-control">
                    <Icon name="search" size={15} />
                    <label className="sr-only" htmlFor="service-search">
                      Search services
                    </label>
                    <input
                      id="service-search"
                      ref={searchRef}
                      type="search"
                      value={searchQuery}
                      placeholder="Search services"
                      onChange={(event) => setSearchQuery(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.isComposing) {
                          announce(
                            `${filteredServices.length} services match ${searchQuery || "the current filters"}`,
                            "info",
                          );
                        }
                      }}
                    />
                    {searchQuery ? (
                      <button
                        className="search-clear"
                        type="button"
                        aria-label="Clear service search"
                        onClick={handleClearSearch}
                      >
                        <Icon name="x" size={13} />
                      </button>
                    ) : null}
                  </div>
                  <button
                    className={`filter-button ${showImpactedOnly ? "is-active" : ""}`}
                    type="button"
                    aria-pressed={showImpactedOnly}
                    onClick={() => setShowImpactedOnly((current) => !current)}
                  >
                    <Icon name="filter" size={14} />
                    {showImpactedOnly ? "Impacted only" : "All services"}
                  </button>
                </div>
              </div>
              <div
                className="service-table-status"
                role="status"
                aria-live="polite"
              >
                <span>
                  <strong>{filteredServices.length}</strong> of{" "}
                  {SERVICE_DATA.length} services
                </span>
                <span className="table-status-separator" aria-hidden="true" />
                <span>
                  {showImpactedOnly
                    ? "Affected by selected range"
                    : "Sorted by p95 latency"}
                </span>
              </div>

              {filteredServices.length ? (
                <>
                  <div className="table-scroll">
                    <table>
                      <caption className="sr-only">
                        Ranked checkout service evidence with status, owner,
                        deployment, p95 latency, and error budget.
                      </caption>
                      <thead>
                        <tr>
                          <th scope="col" className="rank-column">
                            #
                          </th>
                          <th scope="col">Service</th>
                          <th scope="col">Status</th>
                          <th scope="col">Owner</th>
                          <th scope="col">Last deploy</th>
                          <th
                            scope="col"
                            aria-sort={
                              sortConfig.key === "p95"
                                ? sortConfig.direction === "asc"
                                  ? "ascending"
                                  : "descending"
                                : "none"
                            }
                          >
                            <button
                              type="button"
                              className="sort-button"
                              onClick={() => toggleSort("p95")}
                            >
                              p95{" "}
                              <span aria-hidden="true">
                                {sortConfig.key === "p95"
                                  ? sortConfig.direction === "desc"
                                    ? "↓"
                                    : "↑"
                                  : "↕"}
                              </span>
                            </button>
                          </th>
                          <th
                            scope="col"
                            aria-sort={
                              sortConfig.key === "errorBudget"
                                ? sortConfig.direction === "asc"
                                  ? "ascending"
                                  : "descending"
                                : "none"
                            }
                          >
                            <button
                              type="button"
                              className="sort-button"
                              onClick={() => toggleSort("errorBudget")}
                            >
                              Error budget{" "}
                              <span aria-hidden="true">
                                {sortConfig.key === "errorBudget"
                                  ? sortConfig.direction === "desc"
                                    ? "↓"
                                    : "↑"
                                  : "↕"}
                              </span>
                            </button>
                          </th>
                          <th scope="col" className="action-column">
                            <span className="sr-only">Action</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredServices.map((service, index) => {
                          const isAffected = impactedServiceIds.includes(
                            service.id,
                          );
                          const isSelected = selectedServiceId === service.id;
                          return (
                            <tr
                              className={`${isAffected ? "is-affected" : ""} ${isSelected && panelOpen ? "is-selected" : ""}`}
                              key={service.id}
                            >
                              <td className="rank-column">
                                <span
                                  className={`rank-number ${isAffected ? "rank-number-active" : ""}`}
                                >
                                  {String(index + 1).padStart(2, "0")}
                                </span>
                              </td>
                              <td>
                                <button
                                  className="service-cell-button"
                                  type="button"
                                  onClick={(event) =>
                                    openService(service, event.currentTarget)
                                  }
                                >
                                  <span className="service-cell-name">
                                    <span
                                      className={`table-service-node table-node-${service.status}`}
                                      aria-hidden="true"
                                    />
                                    {service.name}
                                  </span>
                                  <span className="service-cell-role">
                                    {service.role}
                                  </span>
                                </button>
                              </td>
                              <td>
                                <StatusBadge status={service.status} compact />
                              </td>
                              <td>
                                <span className="owner-cell">
                                  <span className="owner-avatar">
                                    {service.initials}
                                  </span>
                                  {service.owner}
                                </span>
                              </td>
                              <td>
                                <span className="deploy-cell">
                                  <strong>{service.version}</strong>
                                  <span>{service.deploy}</span>
                                </span>
                              </td>
                              <td>
                                <strong
                                  className={`p95-value ${service.p95 > 700 ? "is-hot" : ""}`}
                                >
                                  {service.p95}ms
                                </strong>
                              </td>
                              <td>
                                <span className="budget-cell">
                                  <span className="budget-track">
                                    <span
                                      className={
                                        service.errorBudget < 30 ? "is-low" : ""
                                      }
                                      style={{
                                        width: `${service.errorBudget}%`,
                                      }}
                                    />
                                  </span>
                                  <span>
                                    {formatBudget(service.errorBudget)}
                                  </span>
                                </span>
                              </td>
                              <td className="action-column">
                                <button
                                  className="table-action"
                                  type="button"
                                  onClick={(event) =>
                                    openService(service, event.currentTarget)
                                  }
                                >
                                  View <Icon name="arrowUpRight" size={13} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div
                    className="mobile-service-cards"
                    aria-label="Service evidence priority cards"
                  >
                    <div className="mobile-table-cue">
                      <Icon name="arrowRight" size={14} /> Priority view keeps
                      status, timestamp, and next action together.
                    </div>
                    {filteredServices.map((service, index) => {
                      const isAffected = impactedServiceIds.includes(
                        service.id,
                      );
                      return (
                        <article
                          className={`service-card-mobile ${isAffected ? "is-affected" : ""}`}
                          key={service.id}
                        >
                          <div className="mobile-service-heading">
                            <span className="rank-number">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <button
                              className="mobile-service-name-button"
                              type="button"
                              onClick={(event) =>
                                openService(service, event.currentTarget)
                              }
                            >
                              <strong>{service.name}</strong>
                              <span>{service.role}</span>
                            </button>
                            <StatusBadge status={service.status} compact />
                          </div>
                          <div className="mobile-service-grid">
                            <span>
                              <small>Owner</small>
                              <strong>{service.owner}</strong>
                            </span>
                            <span>
                              <small>Last deploy</small>
                              <strong>{service.version}</strong>
                              <em>{service.deploy}</em>
                            </span>
                            <span>
                              <small>p95</small>
                              <strong
                                className={service.p95 > 700 ? "is-hot" : ""}
                              >
                                {service.p95}ms
                              </strong>
                            </span>
                            <span>
                              <small>Error budget</small>
                              <strong>
                                {formatBudget(service.errorBudget)}
                              </strong>
                            </span>
                          </div>
                          <button
                            className="mobile-view-evidence"
                            type="button"
                            onClick={(event) =>
                              openService(service, event.currentTarget)
                            }
                          >
                            Open evidence <Icon name="arrowUpRight" size={13} />
                          </button>
                        </article>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="no-results">
                  <span className="no-results-icon">
                    <Icon name="search" size={18} />
                  </span>
                  <strong>No services match these filters.</strong>
                  <span>
                    Clear the search or show all services to restore the
                    evidence set.
                  </span>
                  <button
                    className="button button-secondary"
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setShowImpactedOnly(false);
                      searchRef.current?.focus();
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              )}
              <div className="table-footer">
                <span>Showing {filteredServices.length} evidence rows</span>
                <span className="table-footer-note">
                  <span className="cobalt-pip" /> Selected range highlights
                  affected rows
                </span>
              </div>
            </section>

            <section
              className="lower-grid"
              aria-label="Recent activity and response notes"
            >
              <article className="panel activity-panel" id="recent-activity">
                <div className="panel-header">
                  <div>
                    <div className="panel-kicker">
                      Audit trail <span className="panel-kicker-rule" />
                    </div>
                    <h2>Recent activity</h2>
                  </div>
                  <button
                    className="filter-button"
                    type="button"
                    onClick={() =>
                      announce("Showing all checkout activity", "info")
                    }
                  >
                    <Icon name="filter" size={14} /> All events
                  </button>
                </div>
                <ol className="activity-list">
                  <li className="activity-item activity-item-active">
                    <span className="activity-icon">
                      <Icon name="deploy" size={14} />
                    </span>
                    <span className="activity-copy">
                      <strong>checkout-api v2.18.0 deployed</strong>
                      <span>
                        Introduced a new payment orchestration path · Maya Chen
                      </span>
                    </span>
                    <time>14 min ago</time>
                  </li>
                  <li className="activity-item">
                    <span className="activity-icon">
                      <Icon name="incident" size={14} />
                    </span>
                    <span className="activity-copy">
                      <strong>
                        {activeIncidentAcknowledged
                          ? "Checkout regression acknowledged"
                          : "Regression opened from trace window"}
                      </strong>
                      <span>
                        {activeIncidentAcknowledged
                          ? "Evidence stays linked for follow-up"
                          : "p95 crossed the expected band"}{" "}
                        · automated signal
                      </span>
                    </span>
                    <time>
                      {activeIncidentAcknowledged ? "now" : "12 min ago"}
                    </time>
                  </li>
                  <li className="activity-item">
                    <span className="activity-icon">
                      <Icon name="traces" size={14} />
                    </span>
                    <span className="activity-copy">
                      <strong>Trace sampling increased to 20%</strong>
                      <span>
                        Checkout evidence capture is elevated for review
                      </span>
                    </span>
                    <time>8 min ago</time>
                  </li>
                  <li className="activity-item">
                    <span className="activity-icon">
                      <Icon name="check" size={14} />
                    </span>
                    <span className="activity-copy">
                      <strong>Tax service returned to baseline</strong>
                      <span>Variance window closed without action</span>
                    </span>
                    <time>2h ago</time>
                  </li>
                </ol>
                <button
                  className="text-link activity-link"
                  type="button"
                  onClick={() =>
                    announce(
                      "The full activity feed is outside this demo",
                      "info",
                    )
                  }
                >
                  View full activity <Icon name="arrowRight" size={14} />
                </button>
              </article>

              <article className="panel runbook-panel" id="runbooks">
                <div className="runbook-accent" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="panel-kicker">
                  Next action <span className="panel-kicker-rule" />
                </div>
                <h2>Open the introducing deploy</h2>
                <p>
                  Compare checkout-api v2.18.0 against its predecessor, then
                  replay the three linked traces before rolling back.
                </p>
                <div className="runbook-deploy">
                  <span className="deploy-icon">
                    <Icon name="deploy" size={15} />
                  </span>
                  <span>
                    <strong>checkout-api v2.18.0</strong>
                    <small>14 min ago · Maya Chen</small>
                  </span>
                  <StatusBadge status="degraded" compact />
                </div>
                <div className="runbook-actions">
                  <button
                    className="button button-primary"
                    type="button"
                    onClick={(event) =>
                      openRange(selectedRange, event.currentTarget)
                    }
                  >
                    Inspect traces <Icon name="arrowUpRight" size={14} />
                  </button>
                  <button
                    className="button button-secondary"
                    type="button"
                    onClick={() =>
                      announce(
                        "Rollback steps are read-only in this demo workspace",
                        "info",
                      )
                    }
                  >
                    View runbook
                  </button>
                </div>
              </article>
            </section>

            <footer className="workspace-footer">
              <span>Lattice Signal · checkout workspace</span>
              <span>
                <Icon name="lock" size={12} /> Demo telemetry · all values
                simulated
              </span>
              <span>UTC · Last checked {env.freshness}</span>
            </footer>
          </main>
        </div>
      </div>

      {mobileNavOpen ? (
        <div className="mobile-nav-layer">
          <button
            className="drawer-scrim"
            type="button"
            aria-label="Close workspace navigation"
            onClick={() => {
              setMobileNavOpen(false);
              window.setTimeout(() => menuButtonRef.current?.focus(), 0);
            }}
          />
          <aside
            className="mobile-nav-drawer"
            ref={mobileNavRef}
            role="dialog"
            aria-modal="true"
            aria-label="Workspace navigation"
          >
            <div className="mobile-nav-header">
              <div className="rail-brand">
                <div className="brand-mark" aria-hidden="true">
                  LS
                </div>
                <div>
                  <div className="brand-name">Lattice Signal</div>
                  <div className="brand-caption">Systems observability</div>
                </div>
              </div>
              <button
                className="icon-button"
                type="button"
                aria-label="Close workspace navigation"
                onClick={() => {
                  setMobileNavOpen(false);
                  window.setTimeout(() => menuButtonRef.current?.focus(), 0);
                }}
              >
                <Icon name="x" size={18} />
              </button>
            </div>
            <button
              className="workspace-switcher"
              type="button"
              onClick={() =>
                announce("Lattice Signal is the active workspace", "info")
              }
            >
              <span className="workspace-avatar">L</span>
              <span className="workspace-switcher-copy">
                <strong>Checkout workspace</strong>
                <span>Production · us-east-1</span>
              </span>
              <Icon name="chevronDown" size={14} />
            </button>
            <nav className="nav-groups" onClick={handleNavClick}>
              {NAV_GROUPS.map((group) => (
                <div className="nav-group" key={group.label}>
                  <div className="nav-group-label">{group.label}</div>
                  {group.items.map((item) => (
                    <a
                      className={`nav-item ${item.current ? "is-current" : ""}`}
                      href={item.href}
                      key={item.label}
                      aria-current={item.current ? "page" : undefined}
                    >
                      <Icon name={item.icon} size={16} />
                      <span>{item.label}</span>
                      {item.count ? (
                        <span className="nav-count">{item.count}</span>
                      ) : null}
                    </a>
                  ))}
                </div>
              ))}
            </nav>
            <div className="mobile-nav-footer">
              <div className="ingest-card">
                <div className="ingest-card-topline">
                  <span className="live-dot" aria-hidden="true" />
                  <span>Live ingest</span>
                  <span className="ingest-ok">OK</span>
                </div>
                <strong>2.4M events today</strong>
                <span>99.98% accepted</span>
              </div>
            </div>
          </aside>
        </div>
      ) : null}

      {panelOpen ? (
        <div className="detail-layer">
          <button
            className="drawer-scrim"
            type="button"
            aria-label="Close evidence detail"
            onClick={closePanel}
          />
          <aside
            className="detail-panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-panel-title"
          >
            <div className="detail-panel-header">
              <div>
                <div className="panel-kicker">
                  Evidence detail <span className="panel-kicker-rule" />
                </div>
                <h2 id="detail-panel-title">{selectedRange.title}</h2>
              </div>
              <button
                className="icon-button"
                type="button"
                aria-label="Close evidence detail"
                onClick={closePanel}
              >
                <Icon name="x" size={18} />
              </button>
            </div>
            <div className="detail-status-row">
              {selectedRangeAcknowledged ? (
                <span className="acknowledged-badge">
                  <Icon name="check" size={13} /> Acknowledged
                </span>
              ) : (
                <StatusBadge status="degraded" />
              )}
              <span className="detail-timestamp">
                <Icon name="clock" size={13} /> {selectedRange.label}
              </span>
            </div>
            <div className="detail-lead">
              <strong>+18% p95 latency</strong>
              <span>
                Compared with the 7-day baseline in {environment.toLowerCase()}.
              </span>
            </div>
            <section className="detail-section">
              <div className="detail-section-heading">
                <span>Linked services</span>
                <strong>{selectedRange.services.length}</strong>
              </div>
              <div className="detail-service-list">
                {selectedRange.services.map((serviceId) => {
                  const service = SERVICE_DATA.find(
                    (item) => item.id === serviceId,
                  );
                  if (!service) return null;
                  return (
                    <button
                      className={`detail-service-row ${selectedServiceId === service.id ? "is-selected" : ""}`}
                      type="button"
                      key={service.id}
                      onClick={(event) =>
                        openService(service, event.currentTarget)
                      }
                    >
                      <span
                        className={`detail-service-node detail-node-${service.status}`}
                        aria-hidden="true"
                      />
                      <span>
                        <strong>{service.name}</strong>
                        <small>{service.role}</small>
                      </span>
                      <span className="detail-service-p95">
                        {service.p95}ms
                      </span>
                      <Icon name="chevronRight" size={14} />
                    </button>
                  );
                })}
              </div>
            </section>
            <section className="detail-section">
              <div className="detail-section-heading">
                <span>Trace evidence</span>
                <strong>{selectedRange.traces.length} exact traces</strong>
              </div>
              <div className="trace-list">
                {selectedRange.traces.map((trace, index) => (
                  <button
                    className="trace-row"
                    type="button"
                    key={trace}
                    onClick={() =>
                      announce(
                        `${trace} copied to the trace explorer`,
                        "success",
                      )
                    }
                  >
                    <span className="trace-index">0{index + 1}</span>
                    <span>
                      <strong>{trace}</strong>
                      <small>
                        {index === 0
                          ? "checkout → payment → fraud"
                          : index === 1
                            ? "checkout → payment"
                            : "checkout → tax → payment"}
                      </small>
                    </span>
                    <Icon name="arrowUpRight" size={13} />
                  </button>
                ))}
              </div>
              <p className="detail-helper">
                <Icon name="lock" size={12} /> Selecting a trace opens the
                read-only explorer in the full product.
              </p>
            </section>
            <section className="detail-section deploy-evidence-section">
              <div className="detail-section-heading">
                <span>Introducing deployment</span>
                <span className="deployment-change-label">change evidence</span>
              </div>
              <button
                className="detail-deploy-card"
                type="button"
                onClick={() =>
                  announce(`${selectedRange.deploy} selected`, "info")
                }
              >
                <span className="deploy-icon">
                  <Icon name="deploy" size={16} />
                </span>
                <span>
                  <strong>{selectedRange.deploy}</strong>
                  <small>Deployed 14 min ago by Maya Chen</small>
                </span>
                <Icon name="arrowUpRight" size={14} />
              </button>
              <div className="diff-preview">
                <span className="diff-minus">−</span>
                <span>payment orchestration path</span>
                <span className="diff-plus">+</span>
                <span>fraud precheck inserted before capture</span>
              </div>
            </section>
            <div className="detail-panel-footer">
              {selectedRangeAcknowledged ||
              selectedRangeAcknowledgeState === "success" ? (
                <div className="acknowledge-success" role="status">
                  <Icon name="check" size={15} />
                  <span>
                    <strong>Incident acknowledged</strong>
                    <small>Evidence remains linked for follow-up.</small>
                  </span>
                </div>
              ) : (
                <button
                  className="button button-primary acknowledge-button"
                  type="button"
                  onClick={handleAcknowledge}
                  disabled={selectedRangeAcknowledgeState === "pending"}
                  aria-busy={selectedRangeAcknowledgeState === "pending"}
                >
                  <span className="button-content">
                    {selectedRangeAcknowledgeState === "pending" ? (
                      <>
                        <span className="button-spinner" aria-hidden="true" />{" "}
                        Recording…
                      </>
                    ) : (
                      <>
                        <Icon name="check" size={15} /> Acknowledge incident
                      </>
                    )}
                  </span>
                </button>
              )}
              <button
                className="button button-secondary"
                type="button"
                onClick={closePanel}
              >
                Close detail
              </button>
            </div>
          </aside>
        </div>
      ) : null}

      {toast ? (
        <div
          className={`toast toast-${toast.tone}`}
          role="status"
          aria-live="polite"
        >
          <span className="toast-icon">
            <Icon
              name={
                toast.tone === "success"
                  ? "check"
                  : toast.tone === "danger"
                    ? "alert"
                    : "spark"
              }
              size={14}
            />
          </span>
          <span>{toast.message}</span>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setToast(null)}
          >
            <Icon name="x" size={13} />
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default App;
