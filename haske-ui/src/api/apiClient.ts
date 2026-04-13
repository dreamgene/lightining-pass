const DEFAULT_API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") ?? ""
const DEFAULT_TIMEOUT_MS = 10_000
const MAX_RETRIES = 3
const RETRYABLE_STATUS_CODES = new Set([408, 425, 429, 500, 502, 503, 504])

export type PaymentAsset = "XLM" | "USDC" | string

export type CreatePaymentRequest = {
  amount: string
  asset: PaymentAsset
  event_id: string
}

export type PaymentRequest = {
  session_id: string
  destination: string
  amount: string
  asset: string
  memo: string
  qr_payload: string
  expires_at?: number
  request_expires_at?: number
}

export type AccessToken = Record<string, unknown> | string | null

export type PaymentStatusResponse = {
  session_id: string
  status: string
  paid: boolean
  request_expires_at: number
  expires_at: number
  payment_request: PaymentRequest
  tx_hash: string | null
  access_token: AccessToken
  access_qr_png: string | null
  access_qr_ascii: string | null
}

export type CreatePaymentResponse = {
  session_id: string
  destination: string
  amount: string
  asset: string
  memo: string
  qr_payload: string
  qr_png: string
  request_expires_at: number
}

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "TIMEOUT"
  | "NETWORK_ERROR"
  | "SERVER_ERROR"
  | "INVALID_RESPONSE"
  | "UNKNOWN"

export type ApiClientError = {
  name: "ApiClientError"
  code: ApiErrorCode
  message: string
  userMessage: string
  status: number | null
  retriable: boolean
  retryCount: number
  requestId: string
  details?: unknown
}

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiClientError }

type RequestConfig = {
  path: string
  method?: "GET" | "POST"
  body?: unknown
  timeoutMs?: number
  retries?: number
  headers?: Record<string, string>
  retryUnsafe?: boolean
}

type ApiClientConfig = {
  baseUrl?: string
  timeoutMs?: number
}

function createRequestId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }

  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function mapStatusCodeToErrorCode(status: number): ApiErrorCode {
  if (status === 400) return "BAD_REQUEST"
  if (status === 401) return "UNAUTHORIZED"
  if (status === 403) return "FORBIDDEN"
  if (status === 404) return "NOT_FOUND"
  if (status === 409) return "CONFLICT"
  if (status === 429) return "RATE_LIMITED"
  if (status >= 500) return "SERVER_ERROR"
  return "UNKNOWN"
}

function buildUserMessage(code: ApiErrorCode, fallback: string) {
  switch (code) {
    case "TIMEOUT":
      return "The request took too long. Check your connection and try again."
    case "NETWORK_ERROR":
      return "We could not reach the payment service. Check your connection and try again."
    case "NOT_FOUND":
      return "The payment session could not be found."
    case "RATE_LIMITED":
      return "Too many requests were sent. Wait a moment and try again."
    case "SERVER_ERROR":
      return "The payment service is unavailable right now. Please retry shortly."
    case "INVALID_RESPONSE":
      return "The payment service returned an unexpected response."
    default:
      return fallback
  }
}

function createApiError(input: {
  code: ApiErrorCode
  message: string
  status?: number | null
  retriable: boolean
  retryCount: number
  requestId: string
  details?: unknown
}): ApiClientError {
  return {
    name: "ApiClientError",
    code: input.code,
    message: input.message,
    userMessage: buildUserMessage(input.code, input.message),
    status: input.status ?? null,
    retriable: input.retriable,
    retryCount: input.retryCount,
    requestId: input.requestId,
    details: input.details,
  }
}

function normalizeErrorMessage(payload: unknown, fallback: string) {
  if (!isRecord(payload)) {
    return fallback
  }

  if (typeof payload.message === "string" && payload.message.trim()) {
    return payload.message
  }

  if (typeof payload.error === "string" && payload.error.trim()) {
    return payload.error
  }

  return fallback
}

function isRetryableError(error: ApiClientError, attempt: number, maxRetries: number) {
  return error.retriable && attempt < maxRetries
}

async function parseJsonSafely(response: Response) {
  const text = await response.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function isPaymentRequest(value: unknown): value is PaymentRequest {
  return (
    isRecord(value) &&
    typeof value.session_id === "string" &&
    typeof value.destination === "string" &&
    typeof value.amount === "string" &&
    typeof value.asset === "string" &&
    typeof value.memo === "string" &&
    typeof value.qr_payload === "string"
  )
}

function isCreatePaymentResponse(value: unknown): value is CreatePaymentResponse {
  return (
    isRecord(value) &&
    typeof value.session_id === "string" &&
    typeof value.destination === "string" &&
    typeof value.amount === "string" &&
    typeof value.asset === "string" &&
    typeof value.memo === "string" &&
    typeof value.qr_payload === "string" &&
    typeof value.qr_png === "string" &&
    typeof value.request_expires_at === "number"
  )
}

function isPaymentStatusResponse(value: unknown): value is PaymentStatusResponse {
  return (
    isRecord(value) &&
    typeof value.session_id === "string" &&
    typeof value.status === "string" &&
    typeof value.paid === "boolean" &&
    typeof value.request_expires_at === "number" &&
    typeof value.expires_at === "number" &&
    isPaymentRequest(value.payment_request)
  )
}

export function createApiClient(config: ApiClientConfig = {}) {
  const baseUrl = (config.baseUrl ?? DEFAULT_API_BASE_URL).replace(/\/+$/, "")
  const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS

  async function request<T>(
    input: RequestConfig,
    validate: (value: unknown) => value is T,
  ): Promise<ApiResult<T>> {
    const requestId = createRequestId()
    const method = input.method ?? "GET"
    const maxRetries = Math.min(input.retries ?? MAX_RETRIES, MAX_RETRIES)
    const requestTimeoutMs = input.timeoutMs ?? timeoutMs
    const retryUnsafe = input.retryUnsafe ?? false

    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      const controller = new AbortController()
      const timeoutId = window.setTimeout(() => controller.abort(), requestTimeoutMs)

      try {
        const response = await fetch(`${baseUrl}${input.path}`, {
          method,
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            "X-Request-ID": requestId,
            ...input.headers,
          },
          body: input.body ? JSON.stringify(input.body) : undefined,
        })

        window.clearTimeout(timeoutId)

        const payload = await parseJsonSafely(response)

        if (!response.ok) {
          const error = createApiError({
            code: mapStatusCodeToErrorCode(response.status),
            message: normalizeErrorMessage(payload, `Request failed with status ${response.status}`),
            status: response.status,
            retriable:
              (method === "GET" || retryUnsafe) && RETRYABLE_STATUS_CODES.has(response.status),
            retryCount: attempt,
            requestId,
            details: payload,
          })

          if (isRetryableError(error, attempt, maxRetries)) {
            await delay(250 * 2 ** attempt)
            continue
          }

          return { ok: false, error }
        }

        if (!validate(payload)) {
          return {
            ok: false,
            error: createApiError({
              code: "INVALID_RESPONSE",
              message: "Response payload did not match the expected schema",
              retriable: false,
              retryCount: attempt,
              requestId,
              details: payload,
            }),
          }
        }

        return { ok: true, data: payload }
      } catch (error) {
        window.clearTimeout(timeoutId)

        const isTimeout = error instanceof DOMException && error.name === "AbortError"
        const structuredError = createApiError({
          code: isTimeout ? "TIMEOUT" : "NETWORK_ERROR",
          message: isTimeout ? "Request timed out" : "Network request failed",
          retriable: method === "GET" || retryUnsafe,
          retryCount: attempt,
          requestId,
          details: error,
        })

        if (isRetryableError(structuredError, attempt, maxRetries)) {
          await delay(250 * 2 ** attempt)
          continue
        }

        return { ok: false, error: structuredError }
      }
    }

    return {
      ok: false,
      error: createApiError({
        code: "UNKNOWN",
        message: "Request failed after the maximum retry count",
        retriable: false,
        retryCount: maxRetries,
        requestId: createRequestId(),
      }),
    }
  }

  return {
    createPayment(
      payload: CreatePaymentRequest = {
        amount: "10",
        asset: "XLM",
        event_id: "haske-demo-event",
      },
    ) {
      return request<CreatePaymentResponse>(
        {
          path: "/api/payment-request",
          method: "POST",
          body: payload,
          retryUnsafe: false,
        },
        isCreatePaymentResponse,
      )
    },
    getPaymentStatus(sessionId: string) {
      return request<PaymentStatusResponse>(
        {
          path: `/api/payment-status/${encodeURIComponent(sessionId)}`,
          method: "GET",
        },
        isPaymentStatusResponse,
      )
    },
  }
}

export const apiClient = createApiClient()

export const createPayment = apiClient.createPayment
export const getPaymentStatus = apiClient.getPaymentStatus
