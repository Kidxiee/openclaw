import * as net from "net";

const HOST = process.env["BLENDER_HOST"] ?? "localhost";
const PORT = parseInt(process.env["BLENDER_PORT"] ?? "9876", 10);
const TIMEOUT_MS = 30_000;

export async function callBlender(
  type: string,
  params: Record<string, unknown> = {},
  signal?: AbortSignal,
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    let settled = false;
    let buffer = "";

    const done = (err?: Error, result?: unknown) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      if (err) reject(err);
      else resolve(result);
    };

    const timer = setTimeout(() => done(new Error("Blender MCP timeout")), TIMEOUT_MS);
    signal?.addEventListener("abort", () => done(new Error("Aborted")));

    socket.connect(PORT, HOST, () => {
      const payload = JSON.stringify({ type, params }) + "\n";
      socket.write(payload);
    });

    socket.on("data", (chunk) => {
      buffer += chunk.toString();
      try {
        const parsed = JSON.parse(buffer);
        clearTimeout(timer);
        if (parsed.status === "error") {
          done(new Error(parsed.message ?? "Blender error"));
        } else {
          done(undefined, parsed.result ?? parsed);
        }
      } catch {
        // incomplete JSON, keep buffering
      }
    });

    socket.on("error", (err) => {
      clearTimeout(timer);
      done(err);
    });
    socket.on("close", () => {
      clearTimeout(timer);
      if (!settled) done(new Error("Connection closed"));
    });
  });
}
