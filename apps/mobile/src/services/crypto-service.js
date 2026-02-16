import AES from 'crypto-js/aes';
import encUtf8 from 'crypto-js/enc-utf8';

// In a real mobile app, this secret should be stored securely (e.g., using expo-secure-store)
// For now, using the same placeholder as web to ensure interoperability
const SECRET_KEY = 'default_secret_key_must_be_32_bytes_long!!';

export class CryptoService {
    /**
     * Encrypts a message content
     * @param {string} content Plain text message
     * @returns {Promise<string>} Encrypted string
     */
    static async encrypt(content) {
        try {
            const encrypted = AES.encrypt(content, SECRET_KEY).toString();
            return encrypted;
        } catch (error) {
            console.error('Mobile Encryption failed:', error);
            return content; // Fallback to plain text on error
        }
    }

    /**
     * Decrypts an encrypted message content
     * @param {string} token Encrypted string
     * @returns {Promise<string>} Plain text message
     */
    static async decrypt(token) {
        if (!token || typeof token !== 'string') {
            return token;
        }

        try {
            const bytes = AES.decrypt(token, SECRET_KEY);
            const decrypted = bytes.toString(encUtf8);
            return decrypted || token;
        } catch (error) {
            console.error('Mobile Decryption failed:', error);
            return token; // Return original text if decryption fails
        }
    }
}
