import { motion } from "framer-motion"

function ShimmerBlock({ className }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-white/[0.06] ${className}`.trim()}
    >
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"
        animate={{ x: ["0%", "200%"] }}
        transition={{ duration: 1.15, ease: "easeInOut", repeat: Infinity }}
      />
    </div>
  )
}

export function QRBlockSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="overflow-hidden rounded-[28px] bg-white p-5 text-center shadow-2xl sm:p-6"
      aria-hidden="true"
    >
      <div className="mx-auto flex min-h-[224px] items-center justify-center sm:min-h-[240px]">
        <ShimmerBlock className="h-[208px] w-[208px] rounded-[28px]" />
      </div>
      <div className="mt-4 flex flex-col items-center gap-2">
        <ShimmerBlock className="h-4 w-40 rounded-full" />
        <ShimmerBlock className="h-3.5 w-28 rounded-full" />
      </div>
    </motion.div>
  )
}

export function StatusSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-4"
      aria-hidden="true"
    >
      <div className="flex items-start gap-3">
        <ShimmerBlock className="h-10 w-10 rounded-full" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <ShimmerBlock className="h-4 w-32 rounded-full" />
          <ShimmerBlock className="h-3.5 w-full rounded-full" />
          <ShimmerBlock className="h-3.5 w-4/5 rounded-full" />
        </div>
      </div>
    </motion.div>
  )
}
