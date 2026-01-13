// Maintenance mode configuration
// In production, this should be controlled via environment variable or database

export function isMaintenanceMode(): boolean {
  // Check environment variable first (for production)
  if (process.env.MAINTENANCE_MODE === "true") {
    return true;
  }
  
  // For development/testing, you can also check a file-based flag
  // This is a fallback - in production use env var
  return false;
}

// List of paths that should be accessible even during maintenance
export const MAINTENANCE_EXCLUDED_PATHS = [
  "/maintenance",
  "/atur-server",
  "/api/maintenance",
  "/api",
  "/_next",
  "/favicon.ico",
  "/images",
  "/icons",
  "/sw.js",
  "/manifest.json",
];
