import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  outputFileTracingRoot: __dirname,
  outputFileTracingIncludes: {
    "/api/**/*": ["./lib/generated/prisma/*.node"],
    "/*": ["./lib/generated/prisma/*.node"],
  },
};

export default nextConfig;
