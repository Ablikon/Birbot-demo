"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyKaspiToken = exports.createKaspiToken = void 0;
const crypto = require("crypto");
const SECRET = 'TMP_SESSION_SECRET';
const enc = (buf) => buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
const dec = (str) => Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (str.length % 4)) % 4), 'base64');
function hmac256(input) {
    const sig = crypto.createHmac('sha256', SECRET).update(input).digest();
    return enc(sig);
}
function tSafeEq(a, b) {
    const ab = Buffer.from(a);
    const bb = Buffer.from(b);
    if (ab.length !== bb.length)
        return false;
    return crypto.timingSafeEqual(ab, bb);
}
function createKaspiToken(data, userId, ttlMs = 5 * 60 * 1000) {
    const header = { alg: 'HS256', typ: 'JWT', v: 1 };
    const now = Math.floor(Date.now() / 1000);
    const payload = Object.assign(Object.assign({}, data), { iat: now, exp: now + Math.floor(ttlMs / 1000), sub: userId, jti: crypto.randomBytes(8).toString('base64url') });
    const h = enc(Buffer.from(JSON.stringify(header), 'utf8'));
    const p = enc(Buffer.from(JSON.stringify(payload), 'utf8'));
    const sig = hmac256(`${h}.${p}`);
    return `${h}.${p}.${sig}`;
}
exports.createKaspiToken = createKaspiToken;
function verifyKaspiToken(token, userId) {
    const parts = token.split('.');
    if (parts.length !== 3)
        throw new Error('bad token format');
    const [h, p, s] = parts;
    const expect = hmac256(`${h}.${p}`);
    if (!tSafeEq(expect, s))
        throw new Error('bad signature');
    const payload = JSON.parse(dec(p).toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.exp !== 'number' || now > payload.exp)
        throw new Error('expired');
    if (userId && payload.sub !== userId)
        throw new Error('user mismatch');
    return payload;
}
exports.verifyKaspiToken = verifyKaspiToken;
//# sourceMappingURL=kaspi-tmp.util.js.map