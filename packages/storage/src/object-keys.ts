import { randomUUID } from "node:crypto";

const MAX_FILENAME_LENGTH = 120;

function normalizeFolder(folder: string) {
  const segments = folder.split("/");

  if (
    segments.length === 0 ||
    segments.some(
      (segment) =>
        !segment ||
        segment === "." ||
        segment === ".." ||
        !/^[a-zA-Z0-9_-]+$/.test(segment),
    )
  ) {
    throw new Error("Object key folder contains invalid characters");
  }

  return segments.join("/");
}

function normalizeFilename(filename: string) {
  const basename = filename.replace(/\\/g, "/").split("/").pop()?.trim();
  const safeFilename = basename
    ?.normalize("NFKC")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/^-+/, "")
    .replace(/^\.+/, "")
    .slice(0, MAX_FILENAME_LENGTH);

  return safeFilename || "file";
}

export function createObjectKey(folder: string, filename: string) {
  return `${normalizeFolder(folder)}/${randomUUID()}-${normalizeFilename(filename)}`;
}
