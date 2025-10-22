/**
 * AES-256-GCM Encryption Utility with HMAC-SHA384
 * Used for encrypting login credentials before sending to backend
 *
 * This implementation matches the backend decryption in:
 * /cob_api/api/utils/data_masking.py (lines 111-131)
 *
 * Backend Format: HMAC (48 bytes) + IV (12 bytes) + Ciphertext + Tag (16 bytes)
 * Encoding: HEX string (uppercase)
 * HMAC Algorithm: SHA-384
 * Cipher: AES-256-GCM
 */

// Constants matching backend
const IV_SIZE = 12
const TAG_SIZE = 16
const HMAC_LENGTH = 48
const KEY_SIZE = 32 // AES-256 requires 32 bytes

/**
 * Convert Uint8Array to hex string (uppercase)
 */
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()
}

/**
 * Convert hex string to Uint8Array
 */
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16)
  }
  return bytes
}

/**
 * Convert Base64 string to Uint8Array
 */
function base64ToBytes(base64: string): Uint8Array {
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes
}

/**
 * Encrypt plaintext using AES-256-GCM with HMAC-SHA384 (matches backend)
 *
 * @param plaintext - String to encrypt (JSON string of login credentials)
 * @param key - Base64 encoded encryption key (32 bytes for AES-256)
 * @param iv - Base64 encoded initialization vector (for HMAC)
 * @returns HEX encoded string: HMAC + IV + Ciphertext + Tag
 *
 * Backend decryption: /cob_api/api/utils/data_masking.py:decrypt()
 * Format: HMAC (48 bytes) + IV (12 bytes) + Ciphertext + Tag (16 bytes)
 */
export async function encryptGCM(plaintext: string, key: string, iv: string): Promise<string> {
  try {
    // Decode Base64 keys (backend does: base64.b64decode(auth_key))
    const authKeyBytes = base64ToBytes(key)
    const authIvBytes = base64ToBytes(iv)

    // Validate key size
    if (authKeyBytes.length !== KEY_SIZE) {
      throw new Error(`Invalid key size: expected ${KEY_SIZE} bytes, got ${authKeyBytes.length}`)
    }

    // Generate IV from first 12 bytes of auth_key (matches backend line 102)
    const ivBytes = authKeyBytes.slice(0, IV_SIZE)

    // Convert plaintext to bytes
    const plaintextBytes = new TextEncoder().encode(plaintext)

    // Use Web Crypto API for proper AES-GCM encryption
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      authKeyBytes as any,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    )

    // Encrypt with AES-GCM (automatically generates and appends authentication tag)
    // tagLength: 128 bits = 16 bytes (matches TAG_SIZE)
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: ivBytes,
        tagLength: TAG_SIZE * 8, // Convert bytes to bits
      },
      cryptoKey,
      plaintextBytes
    )

    // The encryptedBuffer contains: ciphertext + tag (last 16 bytes)
    const encryptedBytes = new Uint8Array(encryptedBuffer)

    // Separate ciphertext and tag
    const ciphertextLength = encryptedBytes.length - TAG_SIZE
    const ciphertextBytes = encryptedBytes.slice(0, ciphertextLength)
    const tagBytes = encryptedBytes.slice(ciphertextLength)

    // Combine: IV + Ciphertext + Tag (matches backend format)
    const encryptedMessage = new Uint8Array(
      IV_SIZE + ciphertextBytes.length + TAG_SIZE
    )
    encryptedMessage.set(ivBytes, 0)
    encryptedMessage.set(ciphertextBytes, IV_SIZE)
    encryptedMessage.set(tagBytes, IV_SIZE + ciphertextBytes.length)

    // Calculate HMAC-SHA384 over the encrypted message (matches backend line 106)
    const hmacKey = await crypto.subtle.importKey(
      'raw',
      authIvBytes as any,
      { name: 'HMAC', hash: 'SHA-384' },
      false,
      ['sign']
    )

    const hmacBuffer = await crypto.subtle.sign(
      'HMAC',
      hmacKey,
      encryptedMessage
    )
    const hmacBytes = new Uint8Array(hmacBuffer)

    // Verify HMAC length
    if (hmacBytes.length !== HMAC_LENGTH) {
      throw new Error(`Invalid HMAC length: expected ${HMAC_LENGTH} bytes, got ${hmacBytes.length}`)
    }

    // Final message: HMAC + IV + Ciphertext + Tag
    const finalMessage = new Uint8Array(
      HMAC_LENGTH + encryptedMessage.length
    )
    finalMessage.set(hmacBytes, 0)
    finalMessage.set(encryptedMessage, HMAC_LENGTH)

    // Return as HEX (uppercase) - matches backend line 108
    return bytesToHex(finalMessage)
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error(`Failed to encrypt data: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Decrypt ciphertext using AES-256-GCM with HMAC-SHA384
 *
 * @param hexCiphertext - HEX encoded ciphertext
 * @param key - Base64 encoded encryption key
 * @param iv - Base64 encoded initialization vector
 * @returns Decrypted plaintext
 *
 * Note: This is for testing purposes. Production decryption happens on backend.
 */
export async function decryptGCM(hexCiphertext: string, key: string, iv: string): Promise<string> {
  try {
    // Decode Base64 keys
    const authKeyBytes = base64ToBytes(key)
    const authIvBytes = base64ToBytes(iv)

    // Parse hex ciphertext
    const fullMessage = hexToBytes(hexCiphertext)

    if (fullMessage.length < HMAC_LENGTH + IV_SIZE + TAG_SIZE) {
      throw new Error('Invalid ciphertext length')
    }

    // Extract components
    const hmacReceived = fullMessage.slice(0, HMAC_LENGTH)
    const encryptedData = fullMessage.slice(HMAC_LENGTH)

    // Verify HMAC
    const hmacKey = await crypto.subtle.importKey(
      'raw',
      authIvBytes.buffer as ArrayBuffer,
      { name: 'HMAC', hash: 'SHA-384' },
      false,
      ['verify']
    )

    const hmacValid = await crypto.subtle.verify(
      'HMAC',
      hmacKey,
      hmacReceived,
      encryptedData
    )

    if (!hmacValid) {
      throw new Error('HMAC validation failed')
    }

    // Extract IV, ciphertext, and tag
    const ivBytes = encryptedData.slice(0, IV_SIZE)
    const ciphertextWithTag = encryptedData.slice(IV_SIZE)
    const ciphertextBytes = ciphertextWithTag.slice(0, -TAG_SIZE)
    const tagBytes = ciphertextWithTag.slice(-TAG_SIZE)

    // Combine ciphertext and tag for Web Crypto API
    const combinedBuffer = new Uint8Array(ciphertextBytes.length + TAG_SIZE)
    combinedBuffer.set(ciphertextBytes, 0)
    combinedBuffer.set(tagBytes, ciphertextBytes.length)

    // Decrypt with AES-GCM
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      authKeyBytes.buffer as ArrayBuffer,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    )

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivBytes,
        tagLength: TAG_SIZE * 8,
      },
      cryptoKey,
      combinedBuffer
    )

    // Convert to string
    return new TextDecoder().decode(decryptedBuffer)
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error(`Failed to decrypt data: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
