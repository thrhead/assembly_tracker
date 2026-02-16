
'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import SwaggerUI to avoid SSR issues
const SwaggerUI = dynamic(() => import('swagger-ui-react').then(mod => mod.default), {
    ssr: false,
    loading: () => <p>Loading API Docs...</p>,
});

import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocsPage() {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">API Documentation</h1>
            <SwaggerUI url="/api/docs" />
        </div>
    );
}
