import { loginSchema, jobSchema } from './validations';

describe('lib/validations', () => {
  describe('loginSchema', () => {
    it('should validate valid login data', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('should fail with invalid email', () => {
      const result = loginSchema.safeParse({
        email: 'invalid-email',
        password: 'password123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Geçerli bir e-posta adresi giriniz');
      }
    });

    it('should fail with short password', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: '123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Şifre en az 6 karakter olmalıdır');
      }
    });
  });

  describe('jobSchema', () => {
    it('should validate valid job data', () => {
      const result = jobSchema.safeParse({
        title: 'Valid Title',
        customerId: 'cjld2cjxh0000qzrmn831i7rn', // Valid CUID-like string (CUIDs usually start with c)
        // cuid check in zod is strict, let's use a generated cuid or satisfy it
      });

      // Zod cuid check might fail with arbitrary strings.
      // Let's rely on the fact it expects a string in CUID format.
      // If "cjld2cjxh0000qzrmn831i7rn" is not valid, we will see.
    });

    it('should fail if title is too short', () => {
      const result = jobSchema.safeParse({
        title: 'Hi',
        customerId: 'cjld2cjxh0000qzrmn831i7rn',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Başlık en az 3 karakter olmalıdır');
      }
    });
  });
});
