import { create } from "zustand"

export type PaymentStatus =
  | "INIT"
  | "WAITING"
  | "DETECTED"
  | "CONFIRMED"
  | "EXPIRED"
  | "ERROR"

export type PaymentData = {
  session_id?: string
  destination?: string
  qr_payload?: string
  qr_png?: string
  amount?: string
  asset?: string
  memo?: string
  request_expires_at?: number
  expires_at?: number
  [key: string]: unknown
} | null

export type AccessToken = Record<string, unknown> | string | null

export type AccessData = {
  session_id?: string
  status?: string
  paid?: boolean
  request_expires_at?: number
  expires_at?: number
  payment_request?: PaymentData
  tx_hash?: string | null
  access_token?: AccessToken
  access_qr_png?: string | null
  access_qr_ascii?: string | null
  [key: string]: unknown
} | null

type PaymentState = {
  status: PaymentStatus
  sessionId: string | null
  paymentData: PaymentData
  accessToken: AccessToken
  accessData: AccessData
  requestExpiresAt: number | null
  expiresAt: number | null
  error: string | null
}

type StatusSnapshot = {
  sessionId: string
  paymentData: PaymentData
  accessData: AccessData
  accessToken: AccessToken
  requestExpiresAt: number | null
  expiresAt: number | null
  status: string | undefined
}

type PaymentStore = PaymentState & {
  setSession: (payload: {
    sessionId: string
    paymentData: PaymentData
    requestExpiresAt?: number | null
  }) => void
  applyStatus: (snapshot: StatusSnapshot) => void
  setError: (message: string) => void
  setRecoverableError: (message: string) => void
  clearError: () => void
  resetSession: () => void
}

const initialState: PaymentState = {
  status: "INIT",
  sessionId: null,
  paymentData: null,
  accessToken: null,
  accessData: null,
  requestExpiresAt: null,
  expiresAt: null,
  error: null,
}

function mapStatus(status: string | undefined): PaymentStatus {
  switch (status) {
    case "detected":
      return "DETECTED"
    case "confirmed":
      return "CONFIRMED"
    case "expired":
      return "EXPIRED"
    case "waiting":
    default:
      return "WAITING"
  }
}

export const usePaymentStore = create<PaymentStore>()((set) => ({
  ...initialState,
  setSession: ({ sessionId, paymentData, requestExpiresAt }) =>
    set({
      status: "WAITING",
      sessionId,
      paymentData,
      accessToken: null,
      accessData: null,
      requestExpiresAt: requestExpiresAt ?? paymentData?.request_expires_at ?? null,
      expiresAt: null,
      error: null,
    }),
  applyStatus: ({
    sessionId,
    paymentData,
    accessData,
    accessToken,
    requestExpiresAt,
    expiresAt,
    status,
  }) =>
    set({
      status: mapStatus(status),
      sessionId,
      paymentData,
      accessData,
      accessToken,
      requestExpiresAt,
      expiresAt,
      error: null,
    }),
  setError: (message) =>
    set((state) => ({
      ...state,
      status: "ERROR",
      error: message,
    })),
  setRecoverableError: (message) =>
    set((state) => ({
      ...state,
      error: message,
    })),
  clearError: () =>
    set((state) => ({
      ...state,
      error: null,
    })),
  resetSession: () => set(initialState),
}))
