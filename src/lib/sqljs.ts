// SQLite in the browser (sql.js, ~1 MB of WebAssembly), loaded from the CDN on the first run.
// Every run gets a fresh in-memory database: the block's hidden setup, then the reader's query.

export const SQLJS_URL = "https://cdn.jsdelivr.net/npm/sql.js@1.14.2/dist/";

export type SqlResult = { columns: string[]; values: (string | number | null | Uint8Array)[][] };
type Database = { exec: (sql: string) => SqlResult[]; close: () => void };
type SqlJs = { Database: new () => Database };

declare global {
  interface Window {
    initSqlJs?: (config: { locateFile: (file: string) => string }) => Promise<SqlJs>;
  }
}

let loading: Promise<SqlJs> | null = null;

function load(): Promise<SqlJs> {
  loading ??= new Promise<SqlJs>((resolve, reject) => {
    const start = () => window.initSqlJs!({ locateFile: (f) => SQLJS_URL + f }).then(resolve, reject);
    if (window.initSqlJs) return start();
    const script = document.createElement("script");
    script.src = `${SQLJS_URL}sql-wasm.js`;
    script.async = true;
    script.onload = start;
    script.onerror = () => reject(new Error("sql.js failed to load"));
    document.head.appendChild(script);
  }).catch((e) => {
    loading = null;
    throw e;
  });
  return loading;
}

export async function runSql(setup: string, query: string): Promise<SqlResult[]> {
  const SQL = await load();
  const db = new SQL.Database();
  try {
    if (setup.trim()) db.exec(setup);
    return db.exec(query);
  } finally {
    db.close();
  }
}
