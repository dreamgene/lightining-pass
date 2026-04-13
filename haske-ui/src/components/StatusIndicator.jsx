import { motion } from "framer-motion"
import { StatusSkeleton } from "./LoadingSkeleton"

const STATUS_CONFIG = {
  WAITING: {
    label: "Waiting for payment",
    copy: "Waiting for payment... this usually takes a few seconds.",
    accent: "text-[#FFC857]",
    border: "border-[#FFC857]/20",
    background: "bg-[#FFC857]/10",
    icon: (
      <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#FFC857]/14 text-[#FFC857]">
        <span className="absolute inset-0 rounded-full border border-[#FFC857]/30 animate-ping" />
        <span className="relative text-lg">◌</span>
      </span>
    ),
  },
  DETECTED: {
    label: "Payment detected",
    copy: "Confirming the transaction on-chain now. Keep this screen open.",
    accent: "text-[#00D1FF]",
    border: "border-[#00D1FF]/20",
    background: "bg-[#00D1FF]/10",
    iconBg: "bg-[#00D1FF]/14",
    icon: (
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00D1FF]/14 text-[#00D1FF]">
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
        </svg>
      </span>
    ),
  },
  CONFIRMED: {
    label: "Verified and ready",
    copy: "Your pass is live and can be scanned at entry, even offline.",
    accent: "text-[#00FF9C]",
    border: "border-[#00FF9C]/20",
    background: "bg-[#00FF9C]/10",
    iconBg: "bg-[#00FF9C]/14",
    icon: (
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00FF9C]/14 text-[#00FF9C]">
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m5 12 5 5L20 7" />
        </svg>
      </span>
    ),
  },
  EXPIRED: {
    label: "Session expired",
    copy: "This payment window closed before confirmation. Start a fresh session.",
    accent: "text-[#FF4D4D]",
    border: "border-[#FF4D4D]/40",
    background: "bg-[#2A0D10]",
    icon: (
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF4D4D]/18 text-[#FF6B6B]">
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5" />
          <path d="m12 16 .01 0" />
        </svg>
      </span>
    ),
  },
  ERROR: {
    label: "Something went wrong",
    copy: "We could not complete the status check. Retry without leaving the flow.",
    accent: "text-[#FF4D4D]",
    border: "border-[#FF4D4D]/30",
    background: "bg-[#2A1217]",
    icon: (
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF4D4D]/14 text-[#FF4D4D]">
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 8v4" />
          <path d="m12 16 .01 0" />
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
        </svg>
      </span>
    ),
  },
}

export default function StatusIndicator({ status }) {
  if (status === "INIT") {
    return <StatusSkeleton />
  }

  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.WAITING
  const isExpired = status === "EXPIRED"
  const isConfirmed = status === "CONFIRMED"

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: isExpired ? [1, 1.02, 1] : 1,
      }}
      transition={{
        duration: isConfirmed ? 0.24 : isExpired ? 0.2 : 0.12,
        delay: isConfirmed ? 0.12 : 0,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`w-full rounded-2xl border ${config.border} ${config.background} p-4 transition-all duration-300 ease-out`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0">{config.icon}</div>

        <div className="min-w-0">
          <p className={`text-sm font-semibold tracking-tight ${config.accent}`}>
            {config.label}
          </p>
          <p className="mt-1 max-w-[30ch] text-sm leading-6 text-slate-300">
            {config.copy}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
