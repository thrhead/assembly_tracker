import winston from 'winston';

const { combine, timestamp, json, simple, colorize } = winston.format;

const logger = winston.createLogger({
    level: 'info',
    format: combine(
        timestamp(),
        json()
    ),
    transports: [
        new winston.transports.Console({
            format: process.env.NODE_ENV === 'production'
                ? json()
                : combine(colorize(), simple())
        }),
    ],
});

export { logger };
