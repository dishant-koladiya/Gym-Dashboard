import { exec } from 'child_process';
import dotenv from 'dotenv';
dotenv.config();

const serviceName = process.env.POSTGRES_SERVICE_NAME || 'postgresql-x64-13';
const dataDir = process.env.POSTGRES_DATA_DIR; // optional fallback for pg_ctl

function startService() {
  return new Promise((resolve, reject) => {
    exec(`net start ${serviceName}`, (err, stdout, stderr) => {
      if (err) {
        if (stderr && stderr.includes('already running')) {
          console.log(`PostgreSQL service '${serviceName}' already running.`);
          resolve();
        } else {
          reject(err);
        }
      } else {
        console.log(`Started PostgreSQL service '${serviceName}':`, stdout.trim());
        resolve();
      }
    });
  });
}

function startWithPgCtl() {
  if (!dataDir) {
    return Promise.reject(new Error('POSTGRES_DATA_DIR not set for pg_ctl fallback'));
  }
  return new Promise((resolve, reject) => {
    exec(`pg_ctl -D ${dataDir} start`, (err, stdout, stderr) => {
      if (err) {
        if (stderr && stderr.includes('already running')) {
          console.log('PostgreSQL already running via pg_ctl.');
          resolve();
        } else {
          reject(err);
        }
      } else {
        console.log('PostgreSQL started via pg_ctl:', stdout.trim());
        resolve();
      }
    });
  });
}

async function main() {
  try {
    await startService();
  } catch (e) {
    console.warn('Failed to start via service, attempting pg_ctl fallback...');
    try {
      await startWithPgCtl();
    } catch (e2) {
      console.error('Unable to start PostgreSQL automatically:', e2);
    }
  }
}

main();
