import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";

const http = httpRouter();

/** Mounts Better Auth's HTTP routes under /api/auth on the Convex site URL. */
authComponent.registerRoutes(http, createAuth);

export default http;
