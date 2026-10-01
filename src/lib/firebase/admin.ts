import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";

function getFirebaseAdminApp(): App {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0]!;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (projectId && clientEmail && privateKey) {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }

  return initializeApp({
    projectId: projectId || "chocobliss-app",
  });
}

let _adminApp: App | null = null;
let _adminAuth: Auth | null = null;

export function getAdminAuth(): Auth | null {
  try {
    if (!_adminAuth) {
      _adminApp = getFirebaseAdminApp();
      _adminAuth = getAuth(_adminApp);
    }
    return _adminAuth;
  } catch (err) {
    console.warn("Firebase Admin Auth unavailable:", err);
    return null;
  }
}

// Transparent Proxy so existing imports `adminAuth.verifySessionCookie(...)` work safely without throwing on import
export const adminAuth: Auth = new Proxy({} as Auth, {
  get(_target, prop) {
    const auth = getAdminAuth();
    if (!auth) {
      return () => {
        throw new Error("Firebase Admin is not configured with credentials in this environment.");
      };
    }
    const val = (auth as any)[prop];
    return typeof val === "function" ? val.bind(auth) : val;
  },
});
