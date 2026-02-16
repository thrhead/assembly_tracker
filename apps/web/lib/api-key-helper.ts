
import { prisma } from './db'
import bcrypt from 'bcryptjs'

/**
 * Verilen API anahtarını veritabanındaki hashlenmiş anahtarlarla karşılaştırarak doğrular.
 * Bu işlem O(n) zaman alır çünkü anahtarlar hashlenmiştir ve hangisinin olduğunu bulmak için 
 * kullanıcı ID veya prefix olmadan tüm aktif anahtarları kontrol etmek gerekir.
 * İleride performans için prefix (at_...) bazlı arama eklenebilir.
 */
export async function verifyApiKey(rawKey: string) {
    if (!rawKey || !rawKey.startsWith('at_')) {
        return null;
    }

    // Performans için sadece aktif anahtarları çekiyoruz
    const apiKeys = await prisma.apiKey.findMany({
        where: { isActive: true },
        include: {
            user: {
                select: { id: true, name: true, role: true }
            }
        }
    });

    for (const apiKey of apiKeys) {
        const isValid = await bcrypt.compare(rawKey, apiKey.key);
        if (isValid) {
            return {
                apiKeyId: apiKey.id,
                user: apiKey.user
            };
        }
    }

    return null;
}

export async function getApiKeyFromRequest(req: Request) {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const rawKey = authHeader.split(' ')[1];
    return verifyApiKey(rawKey);
}
