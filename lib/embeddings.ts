/**
 * Simple text embedding using character n-gram hashing.
 * No external API needed — runs entirely in Node.js.
 * Produces a fixed-size vector for cosine similarity search via pgvector.
 */

const VECTOR_SIZE = 384;

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

function hashWord(word: string, size: number): number[] {
  const indices: number[] = [];
  // Generate multiple hash indices per word (character n-grams)
  for (let i = 0; i < word.length - 1; i++) {
    const bigram = word.slice(i, i + 2);
    let hash = 0;
    for (let j = 0; j < bigram.length; j++) {
      hash = (hash * 31 + bigram.charCodeAt(j)) % size;
    }
    indices.push(hash);
  }
  // Also hash the full word
  let fullHash = 0;
  for (let j = 0; j < word.length; j++) {
    fullHash = (fullHash * 31 + word.charCodeAt(j)) % size;
  }
  indices.push(fullHash);
  return indices;
}

export function generateEmbedding(text: string): number[] {
  const vector = new Array(VECTOR_SIZE).fill(0);
  const words = tokenize(text);

  for (const word of words) {
    const indices = hashWord(word, VECTOR_SIZE);
    for (const idx of indices) {
      vector[idx] += 1;
    }
  }

  // L2 normalize
  const magnitude = Math.sqrt(vector.reduce((sum: number, v: number) => sum + v * v, 0));
  if (magnitude > 0) {
    for (let i = 0; i < vector.length; i++) {
      vector[i] = Math.round((vector[i] / magnitude) * 10000) / 10000;
    }
  }

  return vector;
}

export function vectorToString(vec: number[]): string {
  return `[${vec.join(",")}]`;
}
