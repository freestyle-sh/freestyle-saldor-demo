import { defineConfig } from "freestyle-sh";
import * as dotenv from 'dotenv';
dotenv.config();
export default defineConfig({
  dev: {
    command: "npx astro dev",
    proxy: "http://localhost:4321",
  },
});
