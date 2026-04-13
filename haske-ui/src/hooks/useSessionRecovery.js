import { useEffect, useRef } from "react"
import { createPayment, getPaymentStatus } from "../api/apiClient"
import { usePaymentStore } from "../store/usePaymentStore"

const STORAGE_KEY = "haske-payment-session-id"
const POLL_INTERVAL_MS = 3000
let createSessionPromise = null
const statusRequestCache = new Map()

function readStoredSessionId() {
  return window.localStorage.getItem(STORAGE_KEY)
}

function persistSessionId(sessionId) {
  window.localStorage.setItem(STORAGE_KEY, sessionId)
}

function clearPersistedSessionId() {
  window.localStorage.removeItem(STORAGE_KEY)
}

function toPaymentData(paymentRequest) {
  if (!paymentRequest) {
    return null
  }

  return {
    ...paymentRequest,
    request_expires_at: paymentRequest.expires_at ?? null,
  }
}

function toSnapshot(response) {
  return {
    sessionId: response.session_id,
    paymentData: toPaymentData(response.payment_request),
    accessData: response,
    accessToken: response.access_token ?? null,
    requestExpiresAt: response.request_expires_at ?? null,
    expiresAt: response.expires_at ?? null,
    status: response.status,
  }
}

function requestNewSession() {
  if (!createSessionPromise) {
    createSessionPromise = createPayment().finally(() => {
      createSessionPromise = null
    })
  }

  return createSessionPromise
}

function requestPaymentStatus(sessionId) {
  const cached = statusRequestCache.get(sessionId)
  if (cached) {
    return cached
  }

  const request = getPaymentStatus(sessionId).finally(() => {
    statusRequestCache.delete(sessionId)
  })

  statusRequestCache.set(sessionId, request)
  return request
}

export function useSessionRecovery() {
  const initializedRef = useRef(false)
  const pollDelayRef = useRef(POLL_INTERVAL_MS)

  const sessionId = usePaymentStore((state) => state.sessionId)
  const status = usePaymentStore((state) => state.status)
  const setSession = usePaymentStore((state) => state.setSession)
  const applyStatus = usePaymentStore((state) => state.applyStatus)
  const setError = usePaymentStore((state) => state.setError)
  const setRecoverableError = usePaymentStore((state) => state.setRecoverableError)
  const clearError = usePaymentStore((state) => state.clearError)
  const resetSession = usePaymentStore((state) => state.resetSession)

  useEffect(() => {
    if (initializedRef.current) {
      return undefined
    }

    initializedRef.current = true
    let cancelled = false

    async function createAndStoreSession() {
      const result = await requestNewSession()
      if (cancelled) {
        return
      }

      if (!result.ok) {
        setError(result.error.userMessage)
        return
      }

      const payment = result.data
      persistSessionId(payment.session_id)
      setSession({
        sessionId: payment.session_id,
        paymentData: payment,
        requestExpiresAt: payment.request_expires_at,
      })
      pollDelayRef.current = POLL_INTERVAL_MS
    }

    async function recoverStoredSession(storedSessionId) {
      const result = await requestPaymentStatus(storedSessionId)
      if (cancelled) {
        return
      }

      if (!result.ok) {
        throw result.error
      }

      const statusResponse = result.data
      applyStatus(toSnapshot(statusResponse))

      if (statusResponse.status === "expired") {
        clearPersistedSessionId()
        return
      }

      persistSessionId(statusResponse.session_id)
      pollDelayRef.current = POLL_INTERVAL_MS
    }

    async function initialize() {
      const storedSessionId = readStoredSessionId()

      if (!storedSessionId) {
        try {
          await createAndStoreSession()
        } catch (error) {
          if (!cancelled) {
            setError(error?.userMessage ?? error?.message ?? "Failed to create payment session")
          }
        }
        return
      }

      try {
        await recoverStoredSession(storedSessionId)
      } catch (error) {
        if (cancelled) {
          return
        }

        clearPersistedSessionId()

        if (error?.status === 404) {
          try {
            await createAndStoreSession()
          } catch (createError) {
            if (!cancelled) {
              setError(
                createError?.userMessage ??
                  createError?.message ??
                  "Failed to create payment session",
              )
            }
          }
          return
        }

        setError(error?.userMessage ?? error?.message ?? "Failed to recover payment session")
      }
    }

    initialize()

    return () => {
      cancelled = true
    }
  }, [applyStatus, setError, setSession])

  useEffect(() => {
    if (!sessionId || status === "CONFIRMED" || status === "EXPIRED") {
      return undefined
    }

    let cancelled = false
    let timeoutId = null

    async function poll() {
      try {
        const result = await requestPaymentStatus(sessionId)
        if (cancelled) {
          return
        }

        if (!result.ok) {
          throw result.error
        }

        const statusResponse = result.data
        applyStatus(toSnapshot(statusResponse))
        clearError()

        if (statusResponse.status === "expired") {
          clearPersistedSessionId()
          return
        }

        timeoutId = window.setTimeout(poll, POLL_INTERVAL_MS)
      } catch (error) {
        if (cancelled) {
          return
        }

        if (error?.status === 404) {
          clearPersistedSessionId()
          setError("Stored session no longer exists")
          return
        }

        setRecoverableError(
          error?.userMessage ?? error?.message ?? "Failed to refresh payment status",
        )

        timeoutId = window.setTimeout(poll, POLL_INTERVAL_MS)
      }
    }

    timeoutId = window.setTimeout(poll, pollDelayRef.current)
    pollDelayRef.current = POLL_INTERVAL_MS

    return () => {
      cancelled = true
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [applyStatus, sessionId, setError, status])

  return {
    restartSession: async () => {
      clearPersistedSessionId()
      resetSession()

      try {
        const result = await requestNewSession()
        if (!result.ok) {
          setError(result.error.userMessage)
          return
        }

        const payment = result.data
        persistSessionId(payment.session_id)
        setSession({
          sessionId: payment.session_id,
          paymentData: payment,
          requestExpiresAt: payment.request_expires_at,
        })
      } catch (error) {
        setError(error?.userMessage ?? error?.message ?? "Failed to restart payment session")
      }
    },
  }
}
