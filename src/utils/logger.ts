import winston from 'winston';
import path from 'path';

export function getLogger(name: string) {
  return winston.createLogger({
    format: winston.format.combine(
      winston.format.splat(),
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      winston.format.colorize(),
      winston.format.printf((log) => {
        if (log.stack)
          return `[${log.timestamp}] [${log.level}] [${name}] ${log.stack}`;
        return `[${log.timestamp}] [${log.level}] [${name}] ${log.message}`;
      })
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({
        level: 'error',
        filename: path.join(__dirname, '../../.log/errors.log'),
      }),
    ],
  });
}
