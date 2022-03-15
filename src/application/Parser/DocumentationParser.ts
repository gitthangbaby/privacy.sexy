import type { DocumentableData, DocumentationData } from '@/application/collections/';

export function parseDocs(documentable: DocumentableData): readonly string[] {
  if (!documentable) {
    throw new Error('missing documentable');
  }
  const { docs } = documentable;
  if (!docs || !docs.length) {
    return [];
  }
  let result = new DocumentationContainer();
  result = addDocs(docs, result);
  return result.getAll();
}

function addDocs(
  docs: DocumentationData,
  container: DocumentationContainer,
): DocumentationContainer {
  if (docs instanceof Array) {
    container.addParts(docs);
  } else if (typeof docs === 'string') {
    container.addPart(docs);
  } else {
    throw new Error('Docs field (documentation url) must a string or array of strings');
  }
  return container;
}

class DocumentationContainer {
  private readonly parts = new Array<string>();

  public addPart(url: string) {
    validateUrl(url);
    this.parts.push(url);
  }

  public addParts(parts: readonly string[]) {
    for (const part of parts) {
      if (typeof part !== 'string') {
        throw new Error('Docs field (documentation url) must be an array of strings');
      }
      this.addPart(part);
    }
  }

  public getAll(): ReadonlyArray<string> {
    return this.parts;
  }
}

function validateUrl(docUrl: string): void {
  if (!docUrl) {
    throw new Error('undefined documentation');
  }
  const validUrlRegex = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g;
  const res = docUrl.match(validUrlRegex);
  if (res == null) {
    throw new Error(`Invalid documentation url: ${docUrl}`);
  }
}
