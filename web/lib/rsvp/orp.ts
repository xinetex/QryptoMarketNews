/**
 * Optimal Recognition Point (ORP) calculation
 * Based on Spritz-style reading: 25-30% into the word.
 */
export interface ORPResult {
    charIndex: number;
    leftPart: string;
    focusChar: string;
    rightPart: string;
    offsetPercent: number;
}

export function calculateORP(word: string): ORPResult {
    const len = word.length;
    if (len === 0) {
        return { charIndex: 0, leftPart: '', focusChar: '', rightPart: '', offsetPercent: 50 };
    }

    let orpIndex: number;
    if (len <= 1) orpIndex = 0;
    else if (len <= 3) orpIndex = 1;
    else if (len <= 5) orpIndex = 1;
    else if (len <= 9) orpIndex = Math.floor(len * 0.3);
    else if (len <= 13) orpIndex = Math.floor(len * 0.25);
    else orpIndex = Math.floor(len * 0.22);

    orpIndex = Math.max(0, Math.min(orpIndex, len - 1));

    const leftPart = word.slice(0, orpIndex);
    const focusChar = word[orpIndex];
    const rightPart = word.slice(orpIndex + 1);

    // Calculate visual offset to center the ORP
    const offsetPercent = len > 0 ? ((orpIndex + 0.5) / len) * 100 : 50;

    return { charIndex: orpIndex, leftPart, focusChar, rightPart, offsetPercent };
}
