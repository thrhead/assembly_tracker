
import fs from 'fs';
import path from 'path';

const STORAGE_DIR = path.join(process.cwd(), 'storage', 'reports');

/**
 * Ensures the storage directory exists.
 */
function ensureDirectory() {
    if (!fs.existsSync(STORAGE_DIR)) {
        fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
}

/**
 * Saves a PDF buffer to the local storage.
 */
export async function saveReportToStorage(jobId: string, buffer: ArrayBuffer) {
    ensureDirectory();
    const filename = `JobReport_${jobId}_${Date.now()}.pdf`;
    const filePath = path.join(STORAGE_DIR, filename);

    fs.writeFileSync(filePath, Buffer.from(buffer));

    return {
        filename,
        path: filePath,
        url: `/api/v1/reports/download/${filename}` // We'll need this route
    };
}

/**
 * Lists all stored reports.
 */
export async function listStoredReports() {
    ensureDirectory();
    const files = fs.readdirSync(STORAGE_DIR);
    return files.map(file => ({
        filename: file,
        createdAt: fs.statSync(path.join(STORAGE_DIR, file)).birthtime
    }));
}
