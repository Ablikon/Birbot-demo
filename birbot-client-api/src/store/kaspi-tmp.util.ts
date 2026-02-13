import * as crypto from 'crypto'

export type KaspiTmpPayload = {
    cookie: string
    userAgent: string
    phone: string
    marketplaceId: string
    sessionId?: string // SessionId для использования сохраненного клиента (как на проде)
}

const SECRET = 'TMP_SESSION_SECRET' 

const enc = (buf: Buffer) => buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
const dec = (str: string) => Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (str.length % 4)) % 4), 'base64')

function hmac256(input: string): string {
    const sig = crypto.createHmac('sha256', SECRET).update(input).digest()
    return enc(sig)
}

function tSafeEq(a: string, b: string): boolean {
    const ab = Buffer.from(a)
    const bb = Buffer.from(b)
    if (ab.length !== bb.length) return false
    return crypto.timingSafeEqual(ab, bb)
}

/** Создаём токен (как JWT): base64url(header).base64url(payload).base64url(sig) */
export function createKaspiToken(data: KaspiTmpPayload, userId: string, ttlMs = 5 * 60 * 1000): string {
    const header = { alg: 'HS256', typ: 'JWT', v: 1 }
    const now = Math.floor(Date.now() / 1000)
    const payload = {
        ...data,
        iat: now,
        exp: now + Math.floor(ttlMs / 1000),
        sub: userId,
        jti: crypto.randomBytes(8).toString('base64url'),
    }

    const h = enc(Buffer.from(JSON.stringify(header), 'utf8'))
    const p = enc(Buffer.from(JSON.stringify(payload), 'utf8'))
    const sig = hmac256(`${h}.${p}`)
    return `${h}.${p}.${sig}`
}

/** Верифицируем и получаем payload */
export function verifyKaspiToken<T extends Record<string, any> = any>(token: string, userId?: string): T {
    const parts = token.split('.')
    if (parts.length !== 3) throw new Error('bad token format')

    const [h, p, s] = parts
    const expect = hmac256(`${h}.${p}`)
    if (!tSafeEq(expect, s)) throw new Error('bad signature')

    const payload = JSON.parse(dec(p).toString('utf8'))
    const now = Math.floor(Date.now() / 1000)
    if (typeof payload.exp !== 'number' || now > payload.exp) throw new Error('expired')

    if (userId && payload.sub !== userId) throw new Error('user mismatch')

    return payload as T
}
