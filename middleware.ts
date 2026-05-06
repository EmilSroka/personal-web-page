import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Run on locale-prefixed paths and bare /housewarming (so it redirects to default locale).
  // Do NOT run on / (the root rickroll page) or static assets.
  matcher: ["/(pl|uk)/:path*", "/housewarming"],
};
