import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const logsDir = path.join(rootDir, 'logs');

// 1. Ensure logs directory exists
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// 2. Cleanup old logs (older than 2 days)
const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
const now = Date.now();

try {
    const files = fs.readdirSync(logsDir);
    let deletedCount = 0;

    for (const file of files) {
        if (!file.endsWith('.log')) continue;

        const filePath = path.join(logsDir, file);
        const stats = fs.statSync(filePath);

        if (now - stats.mtimeMs > TWO_DAYS_MS) {
            fs.unlinkSync(filePath);
            deletedCount++;
        }
    }

    if (deletedCount > 0) {
        console.log(`\x1b[36m[Logger]\x1b[0m Cleaned up ${deletedCount} old log file(s).`);
    }
} catch (err) {
    console.error('\x1b[31m[Logger] Error cleaning up old logs:\x1b[0m', err);
}

// 3. Setup new log file
// Format: build-YYYY-MM-DD-HH-mm-ss.log
const date = new Date();
const timestamp = date.toISOString().replace(/T/, '-').replace(/:/g, '-').split('.')[0];
const logFileName = `build-${timestamp}.log`;
const logFilePath = path.join(logsDir, logFileName);

const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

// Custom stdout write to pipe to both console and file
const originalStdoutWrite = process.stdout.write.bind(process.stdout);
const originalStderrWrite = process.stderr.write.bind(process.stderr);

process.stdout.write = (chunk, encoding, callback) => {
    logStream.write(chunk, encoding);
    return originalStdoutWrite(chunk, encoding, callback);
};

process.stderr.write = (chunk, encoding, callback) => {
    logStream.write(chunk, encoding);
    return originalStderrWrite(chunk, encoding, callback);
};

console.log(`\x1b[36m[Logger]\x1b[0m Starting build. Logs are being saved to: \x1b[33m${logFilePath}\x1b[0m\n`);

// 4. Execute standard build command locally
const buildProcess = exec('npm run build:core', { cwd: rootDir });

buildProcess.stdout?.on('data', (data) => {
    process.stdout.write(data);
});

buildProcess.stderr?.on('data', (data) => {
    process.stderr.write(data);
});

buildProcess.on('close', (code) => {
    console.log(`\n\x1b[36m[Logger]\x1b[0m Build process exited with code ${code}`);
    logStream.end();

    // Pass exit code upwards
    if (code !== 0) {
        process.exit(code || 1);
    }
});
