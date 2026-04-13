const BADGE_CONFIG = {
  stellar: {
    label: "Secured by Stellar",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4.5 15.5 15.5 4.5" />
        <path d="m8 4.5 11.5 11.5" />
        <path d="M4.5 8h7.5" />
        <path d="M12 16H19.5" />
      </svg>
    ),
  },
  signed: {
    label: "Cryptographically signed",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3 6 5.5v5.8c0 4 2.5 7.7 6 9.2 3.5-1.5 6-5.2 6-9.2V5.5L12 3Z" />
        <path d="m9.5 12 1.7 1.7L14.7 10" />
      </svg>
    ),
  },
  offline: {
    label: "Works offline",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 8.5A13.2 13.2 0 0 1 12 6c3 0 5.8 1 8 2.5" />
        <path d="M7 12.5A8.4 8.4 0 0 1 12 11c1.9 0 3.7.5 5 1.5" />
        <path d="M10 16.5c.6-.3 1.3-.5 2-.5s1.4.2 2 .5" />
        <path d="m3 3 18 18" />
      </svg>
    ),
  },
}

function Badge({ icon, label }) {
  return (
    <div className="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] font-semibold tracking-[0.02em] text-slate-300 backdrop-blur">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[#D8E6F5]">
        {icon}
      </span>
      <span className="whitespace-nowrap">{label}</span>
    </div>
  )
}

export default function TrustBadge({
  items = ["stellar", "signed", "offline"],
  className = "",
}) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-2 ${className}`.trim()}>
      {items.map((item) => {
        const config = BADGE_CONFIG[item]

        if (!config) {
          return null
        }

        return <Badge key={item} icon={config.icon} label={config.label} />
      })}
    </div>
  )
}
