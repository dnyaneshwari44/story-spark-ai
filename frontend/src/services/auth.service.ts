import { AccessToken } from "../models/login";
import { decodedToken } from "../utils/jwt";

const AUTH_CHANGE_EVENT = "story-spark-auth-change";

// Secure in-memory storage instead of localStorage
let authToken: string | null = null;

const emitAuthChange = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};

export type AuthUserInfo = {
  email: string;
  userId: string;
  name: string;
  postsCount: number;
  role: string;
  subscriptionType: string;
  exp: number;
  iat: number;
  avatar?: string;
};

// Raw shape of the decoded JWT payload — fields are optional because
// different token versions or providers may omit some of them
interface RawJwtPayload {
  email?: string;
  userId?: string;
  _id?: string;
  name?: string;
  postsCount?: number;
  role?: string;
  subscriptionType?: string;
  exp?: number;
  iat?: number;
  avatar?: string;
}

// Maps raw JWT payload to a typed AuthUserInfo object
// Uses optional chaining + fallbacks to safely handle any missing fields
const buildUserInfo = (decodedData: RawJwtPayload): AuthUserInfo => ({
  email: decodedData?.email || "",
  userId: decodedData?.userId || decodedData?._id || "",
  name: decodedData?.name || "",
  postsCount: decodedData?.postsCount || 0,
  role: decodedData?.role || "guest",
  subscriptionType: decodedData?.subscriptionType || "free",
  exp: decodedData?.exp || 0,
  iat: decodedData?.iat || 0,
  avatar: decodedData?.avatar || "",
});

const getValidDecodedToken = () => {
<<<<<<< HEAD
  if (!authToken) return null;
  try {
    const decodedData = decodedToken(authToken);
    if (!decodedData) { authToken = null; return null; }
    if (typeof decodedData.exp === "number" &&
      decodedData.exp <= Math.floor(Date.now() / 1000)) {
      authToken = null; return null;
=======
  const authToken = getFromLocalStorage(AUTH_KEY);

  if (authToken) {
    try {
      const decodedData = decodedToken(authToken);
          if (
      typeof decodedData.exp === "number" &&
      decodedData.exp <= Math.floor(Date.now() / 1000)
    ) {
      removeFromLocalStorage(AUTH_KEY);
      return null;
    }
      return buildUserInfo({
        email: decodedData.email ?? "",
        role: decodedData.role ?? "",
        userId: decodedData.userId ?? decodedData._id ?? "",
        name: decodedData.name ?? "",
        postsCount: decodedData.postsCount ?? 0,
        subscriptionType: decodedData.subscriptionType ?? "free",
        exp: decodedData.exp ?? 0,
        iat: decodedData.iat ?? 0,
      });
    } catch (error) {
      console.error("Invalid auth token:", error);
      removeFromLocalStorage(AUTH_KEY);
      return null;
>>>>>>> 6c3a0a208c04e4ff21c3746ba2817b5917cb80ca
    }
    return buildUserInfo(decodedData);
  } catch (error) {
    console.error("Invalid auth token:", error);
    authToken = null; return null;
  }
};

export const storeUserInfo = ({ accessToken }: AccessToken) => {
  authToken = accessToken;
  emitAuthChange();
};

<<<<<<< HEAD
export const getUserInfo = (): AuthUserInfo | null => getValidDecodedToken();
export const isLoggedIn = () => !!getValidDecodedToken();
export const removeUserInfo = () => { authToken = null; emitAuthChange(); };
export const getToken = () => authToken;
=======
export const getUserInfo = (): AuthUserInfo | null => {
  return getValidDecodedToken();
};

export const isLoggedIn = () => {
  return !!getValidDecodedToken();
};

export const removeUserInfo = () => {
  const result = removeFromLocalStorage(AUTH_KEY);
  emitAuthChange();
  return result;
};

export const getToken = () => getFromLocalStorage(AUTH_KEY);

>>>>>>> 6c3a0a208c04e4ff21c3746ba2817b5917cb80ca
export const authChangeEventName = AUTH_CHANGE_EVENT;