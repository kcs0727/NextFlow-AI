import { defineConfig } from "@trigger.dev/sdk";
import { ffmpeg } from "@trigger.dev/build/extensions/core";

export default defineConfig({
  project: "proj_brcyiasqerjdmoqmrepe",
  dirs: ["./src"],
  maxDuration: 3600,
  build: {
    extensions: [ffmpeg()],
  },
});
