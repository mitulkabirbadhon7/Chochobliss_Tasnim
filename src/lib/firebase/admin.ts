// Fully lazy-loaded Firebase Admin to prevent module resolution & runtime crashes in serverless environments
let _adminApp: any = null;
let _adminAuth: any = null;

export async function getAdminAuth(): Promise<any | null> {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  // In production serverless without service account credentials, gracefully return null
  if (!clientEmail || !privateKey) {
    return null;
  }

  try {
    if (!_adminAuth) {
      const { getApps, initializeApp, cert } = await import("firebase-admin/app");
      const { getAuth } = await import("firebase-admin/auth");

      const existingApps = getApps();
      _adminApp =
        existingApps.length > 0
          ? existingApps[0]!
          : initializeApp({
              credential: cert({
                projectId: projectId || "chocobliss-app",
                clientEmail,
                privateKey,
              }),
            });

      _adminAuth = getAuth(_adminApp);
    }
    return _adminAuth;
  } catch (err) {
    console.warn("Firebase Admin Auth unavailable in this environment:", err);
    return null;
  }
}

// Transparent Proxy so callers like `await adminAuth.verifySessionCookie(...)` work smoothly without top-level module load crashes
export const adminAuth: any = new Proxy({} as any, {
  get(_target, prop) {
    return async (...args: any[]) => {
      const auth = await getAdminAuth();
      if (!auth) {
        throw new Error("Firebase Admin is not configured with credentials in this environment.");
      }
      const val = (auth as any)[prop];
      if (typeof val === "function") {
        return val.apply(auth, args);
      }
      return val;
    };
  },
});
