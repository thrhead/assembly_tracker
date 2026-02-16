import AES from 'crypto-js/aes'
import encUtf8 from 'crypto-js/enc-utf8'

// Secret key should be loaded from environment variables in production
const SECRET_KEY = process.env.MESSAGING_SECRET_KEY || 'default_secret_key_must_be_32_bytes_long!!'

export class CryptoService {
    /**
     * Encrypts a message content
     * @param content Plain text message
     * @returns Encrypted string
     */
    static async encrypt(content: string): Promise<string> {
        try {
            const encrypted = AES.encrypt(content, SECRET_KEY).toString()
            return encrypted
        } catch (error) {
            console.error('Encryption failed:', error)
            throw new Error('Failed to encrypt message')
        }
    }

    /**
     * Decrypts an encrypted message content
     * @param token Encrypted string
     * @returns Plain text message
     */
    static async decrypt(token: string): Promise<string> {
        try {
            const bytes = AES.decrypt(token, SECRET_KEY)
            const decrypted = bytes.toString(encUtf8)
            return decrypted || token // Return original if empty (failed)
        } catch (error) {
            console.error('Decryption failed:', error)
            return token 
        }
    }
}
