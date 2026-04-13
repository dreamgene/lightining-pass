import { motion } from "framer-motion"
import QRCode from "react-qr-code"
import { usePaymentStore } from "../store/usePaymentStore"
import { QRBlockSkeleton } from "./LoadingSkeleton"

const qrBlockTransition = {
  duration: 0.22,
  ease: [0.22, 1, 0.36, 1],
}

export default function QRBlock() {
  const { paymentData, status } = usePaymentStore()

  if (!paymentData) {
    return <QRBlockSkeleton />
  }

  const isDetected = status === "DETECTED" || status === "CONFIRMED"

  return (
    <motion.div
      initial={false}
      animate={{
        opacity: isDetected ? 0.58 : 1,
        scale: isDetected ? 0.985 : 1,
        filter: isDetected ? "saturate(0.92)" : "saturate(1)",
      }}
      transition={{
        ...qrBlockTransition,
        duration: status === "DETECTED" ? 0.12 : qrBlockTransition.duration,
      }}
      className="overflow-hidden rounded-[28px] bg-white p-5 text-center shadow-2xl sm:p-6"
    >
      <div className="mx-auto flex min-h-[224px] items-center justify-center sm:min-h-[240px]">
        {paymentData.qr_png ? (
          <img
            src={paymentData.qr_png}
            alt="Payment QR"
            className="mx-auto h-auto w-full max-w-[232px] object-contain sm:max-w-[240px]"
          />
        ) : (
          <div className="flex w-full justify-center">
            <QRCode value={paymentData.qr_payload} size={208} />
          </div>
        )}
      </div>

      <p className="mt-4 text-base font-semibold text-slate-800">
        Scan with any Stellar wallet
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-500">Supports XLM / USDC</p>
    </motion.div>
  )
}
