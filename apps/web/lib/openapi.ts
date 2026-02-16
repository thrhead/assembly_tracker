
import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Assembly Tracker API',
            version: '1.0.0',
            description: '[TR] Dış sistem entegrasyonları için Assembly Tracker API dokümantasyonu. [EN] Assembly Tracker API documentation for external system integrations.',
        },
        components: {
            securitySchemes: {
                ApiKeyAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'X-API-KEY',
                    description: '[TR] API anahtarınızı buraya girin. [EN] Enter your API key here.',
                },
            },
            schemas: {
                Job: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: 'job_123' },
                        title: { type: 'string', description: '[TR] İş başlığı [EN] Job title' },
                        status: { type: 'string', enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], description: '[TR] İş durumu [EN] Job status' },
                        priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], description: '[TR] Öncelik [EN] Priority' },
                        customer: { type: 'string', description: '[TR] Müşteri adı [EN] Customer name' },
                        scheduledDate: { type: 'string', format: 'date-time' },
                    },
                },
                Customer: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        company: { type: 'string' },
                        email: { type: 'string' },
                        phone: { type: 'string' },
                    },
                },
            },
        },
        security: [
            {
                ApiKeyAuth: [],
            },
        ],
    },
    apis: ['./app/api/v1/**/*.ts'], // Scan all v1 API routes
};

/**
 * Standardizes the OpenAPI object by selecting the requested language.
 * Convention: "[TR] Türkçe Metin [EN] English Text"
 */
function translateSpec(spec: any, lang: 'tr' | 'en') {
    const json = JSON.stringify(spec);

    // Regex to match our convention
    const regex = /\[TR\]\s*(.*?)\s*\[EN\]\s*(.*?)(?="|$)/g;

    const translated = json.replace(regex, (match, tr, en) => {
        return lang === 'tr' ? tr.trim() : en.trim();
    });

    return JSON.parse(translated);
}

export function getOpenApiSpec(lang: 'tr' | 'en' = 'tr') {
    const spec = swaggerJsdoc(options);
    return translateSpec(spec, lang);
}
