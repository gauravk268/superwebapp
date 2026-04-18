import { Injectable, signal } from '@angular/core';

/**
 * CryptoService – AES-GCM 256 encryption with PBKDF2 key derivation.
 * The derived CryptoKey is kept only in memory; on page refresh, the
 * user must re-enter their password (zero-knowledge local storage).
 */
@Injectable({ providedIn: 'root' })
export class CryptoService {
  private cryptoKey: CryptoKey | null = null;

  private readonly SALT_KEY      = 'sa_cc_salt';
  private readonly VERIFIER_KEY  = 'sa_cc_verifier';

  /** True once a master password has been set up (salt exists). */
  hasMasterPassword(): boolean {
    return !!localStorage.getItem(this.SALT_KEY);
  }

  /** True if the session key is loaded (vault is open). */
  get isUnlocked(): boolean {
    return this.cryptoKey !== null;
  }

  /** Set a new master password. Overwrites any existing vault. */
  async setupPassword(password: string): Promise<void> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    localStorage.setItem(this.SALT_KEY, this.bufToB64(salt));
    this.cryptoKey = await this.deriveKey(password, salt);
    // Store a sentinel value so we can verify future passwords
    const verifier = await this.encryptRaw('SUPERAPP_VALID');
    localStorage.setItem(this.VERIFIER_KEY, verifier);
  }

  /** Unlock vault with password. Returns true on success. */
  async unlock(password: string): Promise<boolean> {
    const saltB64 = localStorage.getItem(this.SALT_KEY);
    if (!saltB64) return false;
    const salt = this.b64ToBuf(saltB64);
    const candidate = await this.deriveKey(password, salt);

    // Save key temporarily and try to decrypt the verifier
    const prev = this.cryptoKey;
    this.cryptoKey = candidate;
    try {
      const verifier = localStorage.getItem(this.VERIFIER_KEY) ?? '';
      const plaintext = await this.decryptRaw(verifier);
      if (plaintext === 'SUPERAPP_VALID') return true;
      this.cryptoKey = prev;
      return false;
    } catch {
      this.cryptoKey = prev;
      return false;
    }
  }

  /** Lock the session (clears in-memory key). */
  lock(): void {
    this.cryptoKey = null;
  }

  /** Encrypt a JSON-serialisable value. */
  async encrypt(value: unknown): Promise<string> {
    return this.encryptRaw(JSON.stringify(value));
  }

  /** Decrypt and JSON-parse a value encrypted with encrypt(). */
  async decrypt<T>(ciphertext: string): Promise<T> {
    const json = await this.decryptRaw(ciphertext);
    return JSON.parse(json) as T;
  }

  // ── private helpers ────────────────────────────────────────────────────

  private async encryptRaw(plaintext: string): Promise<string> {
    if (!this.cryptoKey) throw new Error('Vault is locked');
    const iv  = crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder().encode(plaintext);
    const ct  = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, this.cryptoKey, enc);
    const buf = new Uint8Array(iv.byteLength + ct.byteLength);
    buf.set(iv);
    buf.set(new Uint8Array(ct), iv.byteLength);
    return this.bufToB64(buf);
  }

  private async decryptRaw(ciphertext: string): Promise<string> {
    if (!this.cryptoKey) throw new Error('Vault is locked');
    const buf  = this.b64ToBuf(ciphertext);
    const iv   = buf.slice(0, 12);
    const data = buf.slice(12);
    const pt   = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, this.cryptoKey, data);
    return new TextDecoder().decode(pt);
  }

  private async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const base = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey'],
    );
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: salt as BufferSource, iterations: 100_000, hash: 'SHA-256' },
      base,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt'],
    );
  }

  private bufToB64(buf: Uint8Array): string {
    return btoa(String.fromCharCode(...buf));
  }

  private b64ToBuf(b64: string): Uint8Array {
    return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  }
}
