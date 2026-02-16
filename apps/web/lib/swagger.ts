
// Removed incorrect import

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Assembly Tracker API',
            version: '1.0.0',
            description: 'API Documentation for Assembly Tracker Backend',
        },
        servers: [
            {
                url: '/api',
                description: 'API Server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                Job: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        title: { type: 'string' },
                        status: { type: 'string' },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./app/api/**/*.ts'], // Path to the API docs
};

export const getApiDocs = async () => {
    // Dynamically import swagger-jsdoc ONLY when calling this function
    const swaggerJsdoc = (await import('swagger-jsdoc')).default;
    return swaggerJsdoc(options);
};
