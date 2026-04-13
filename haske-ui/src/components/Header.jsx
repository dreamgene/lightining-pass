export default function Header() {
  return (
    <div className="flex w-full flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-lg font-extrabold tracking-[0.14em] text-white">
        HASKE <span className="text-[#00D1FF]">⚡</span>
      </h1>
      <span className="inline-flex min-h-10 items-center rounded-full border border-[#00D1FF]/30 bg-[#00D1FF]/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#00D1FF]">
        Secure Payment
      </span>
    </div>
  )
}
