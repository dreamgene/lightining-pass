import { AnimatePresence, motion } from "framer-motion"
import Header from "../components/Header"
import QRBlock from "../components/QRBlock"
import StatusIndicator from "../components/StatusIndicator"
import AccessPass from "../components/AccessPass"
import Countdown from "../components/Countdown"
import TrustBadge from "../components/TrustBadge"
import { useSessionRecovery } from "../hooks/useSessionRecovery"
import { usePaymentStore } from "../store/usePaymentStore"

export default function Checkout() {
  const { restartSession } = useSessionRecovery()
  const { status, paymentData, requestExpiresAt, error } = usePaymentStore()

  const walletHref = paymentData?.qr_payload
  const showRetry = status === "EXPIRED" || status === "ERROR"

  return (
    <div className="min-h-screen scroll-smooth bg-[#0B0F14]">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-[#121821]/95 pb-28 shadow-[0_24px_60px_rgba(0,0,0,0.28)] sm:my-4 sm:min-h-[calc(100vh-2rem)] sm:rounded-[28px] sm:border sm:border-white/10">
        <div className="flex-1 px-4 pb-6 pt-4 sm:px-6 sm:pt-6">
          <Header />

          <div className="mt-6">
            <AnimatePresence mode="wait" initial={false}>
              {status === "CONFIRMED" ? (
                <motion.div
                  key="access-pass"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.26, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  <AccessPass />
                </motion.div>
              ) : (
                <motion.div
                  key="checkout-flow"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="space-y-4"
                >
                  <div className="space-y-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                      Checkout
                    </p>
                    <div className="space-y-2">
                      <h2 className="max-w-[12ch] text-3xl font-extrabold tracking-tight text-white sm:max-w-none sm:text-4xl">
                        HASKE Demo Event
                      </h2>
                      <div className="flex flex-wrap items-end justify-between gap-2">
                        <div className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                          ₦10,000
                        </div>
                        <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm font-semibold text-slate-300">
                          or 10 XLM
                        </div>
                      </div>
                    </div>
                  </div>

                  <QRBlock />

                  <StatusIndicator status={status} />

                  {error && status !== "ERROR" && (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                      {error}
                    </div>
                  )}

                  <Countdown expiresAt={requestExpiresAt} prefix="Session expires in" />

                  <TrustBadge className="justify-start pt-1 sm:justify-center" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {status !== "CONFIRMED" && (
          <div className="sticky bottom-0 left-0 right-0 border-t border-white/10 bg-[#121821]/95 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3 backdrop-blur sm:px-6">
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  if (walletHref) {
                    window.location.href = walletHref
                  }
                }}
                disabled={!walletHref}
                className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-[#00D1FF] px-5 py-4 text-base font-extrabold uppercase tracking-[0.1em] text-[#071018] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Open in Wallet
              </button>

              {showRetry && (
                <button
                  type="button"
                  onClick={restartSession}
                  className="flex min-h-14 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-base font-bold uppercase tracking-[0.08em] text-white transition hover:bg-white/[0.08]"
                >
                  {status === "EXPIRED" ? "Generate new pass" : "Retry"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
