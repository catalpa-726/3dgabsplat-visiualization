const chunkFiles = Array.from({ length: 19 }, (_, index) => `./main.payload.b64.${String(index).padStart(2, "0")}`);
const packed = (await Promise.all(chunkFiles.map(async (path) => {
  const response = await fetch(new URL(path, import.meta.url));
  if (!response.ok) throw new Error(`Failed to load ${path}`);
  return (await response.text()).trim();
}))).join("");
const bytes = Uint8Array.from(atob(packed), (char) => char.charCodeAt(0));
if (!("DecompressionStream" in globalThis)) {
  throw new Error("This browser needs DecompressionStream support to load the packaged viewer.");
}
const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
const source = await new Response(stream).text();
const moduleUrl = URL.createObjectURL(new Blob([source], { type: "text/javascript" }));
try {
  await import(moduleUrl);
} finally {
  URL.revokeObjectURL(moduleUrl);
}
