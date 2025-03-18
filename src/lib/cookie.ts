import { setSignedCookie, deleteCookie } from "hono/cookie";
import { Context } from "hono";

export const setAuthCookies = async (
  c: Context,
  accessToken: string,
  refreshToken: string,
  cookieSecret: string
) => {
  await setSignedCookie(c, "auth_token", accessToken, cookieSecret, {
    path: "/",
    httpOnly: true,
    maxAge: 24 * 60 * 60, // 1 day in seconds
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day/24 hours
    sameSite: "Strict",
  });

  await setSignedCookie(c, "refresh_token", refreshToken, cookieSecret, {
    path: "/",
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    sameSite: "Strict",
  });
};

export const clearAuthCookies = (c: Context) => {
  deleteCookie(c, "auth_token", {
    path: "/",
    httpOnly: true,
  });

  deleteCookie(c, "refresh_token", {
    path: "/",
    httpOnly: true,
  });
};
