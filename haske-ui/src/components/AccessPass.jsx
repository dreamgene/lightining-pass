import { motion } from "framer-motion"
import QRCode from "react-qr-code"
import { usePaymentStore } from "../store/usePaymentStore"
import Countdown from "./Countdown"
import TrustBadge from "./TrustBadge"

export default function AccessPass() {
  const { accessToken, accessData, paymentData, expiresAt } = usePaymentStore()

  if (!accessToken) {
    return null
  }

  const qrValue =
    typeof accessToken === "string" ? accessToken : JSON.stringify(accessToken)

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="w-full space-y-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, delay: 0.03, ease: "easeOut" }}
      >
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#00FF9C]">
          Success
        </p>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          ✅ Payment Confirmed
        </h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden rounded-[28px] bg-white p-5 text-center shadow-2xl sm:p-6"
      >
        <div className="mx-auto flex min-h-[248px] items-center justify-center sm:min-h-[280px]">
          {accessData?.access_qr_png ? (
            <img
              src={accessData.access_qr_png}
              alt="Access pass QR"
              className="mx-auto h-auto w-full max-w-[248px] object-contain sm:max-w-[280px]"
            />
          ) : (
            <div className="flex w-full justify-center">
              <QRCode value={qrValue} size={224} />
            </div>
          )}
        </div>
        <p className="mt-4 text-lg font-bold text-slate-900">Ready for Entry</p>
      </motion.div>

      <Countdown expiresAt={expiresAt} prefix="Valid for" />

      <TrustBadge />

      <details className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
        <summary className="cursor-pointer text-sm font-bold text-slate-200 marker:hidden">
          View details ▾
        </summary>
        <div className="mt-4 space-y-3 text-left text-sm text-slate-300">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              tx_hash
            </div>
            <code className="mt-1 block break-all text-slate-100">
              {accessData?.tx_hash || "n/a"}
            </code>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              memo
            </div>
            <code className="mt-1 block break-all text-slate-100">
              {paymentData?.memo || "n/a"}
            </code>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              asset
            </div>
            <code className="mt-1 block break-all text-slate-100">
              {paymentData?.asset || "n/a"}
            </code>
          </div>
        </div>
      </details>
    </motion.div>
  )
}
