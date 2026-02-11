import CryptoJS from 'crypto-js';

export function getDailySeed(): string {
  const now = new Date();
  const utcDate = `${now.getUTCFullYear()}-${now.getUTCMonth() + 1}-${now.getUTCDate()}`;
  return CryptoJS.SHA256(utcDate).toString();
}

/**
 * Generates a pseudo-random number between 0 and 1 based on a string seed.
 * Useful for deterministic game generation.
 */
export function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  
  return function() {
    h = (Math.imul(h, 48271)) % 2147483647;
    return (h - 1) / 2147483646;
  };
}
