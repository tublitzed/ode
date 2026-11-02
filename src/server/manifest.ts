type ManifestChunk = {
  assets?: string[];
  css?: string[];
  file: string;
  imports?: string[];
};

export type Manifest = Record<string, ManifestChunk>;

export const collectEntryFiles = (manifest: Manifest, entry: string) => {
  const files = new Set<string>();
  const visited = new Set<string>();

  const visit = (key: string) => {
    if (visited.has(key)) {
      return;
    }
    visited.add(key);

    const chunk = manifest[key];
    if (!chunk) {
      throw new Error(`Missing Vite manifest entry: ${key}`);
    }

    for (const file of [
      chunk.file,
      ...(chunk.css ?? []),
      ...(chunk.assets ?? []),
    ]) {
      files.add(`/${file}`);
    }

    for (const imported of chunk.imports ?? []) {
      visit(imported);
    }
  };

  visit(entry);

  return files;
};
