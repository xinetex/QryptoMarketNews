/**
 * Timing Logic for RSVP
 * Calculates display duration for each word.
 */

const BASE_DELAY_MS = 60000; // 1 minute in ms

export function calculateDelay(word: string, wpm: number): number {
    const baseDelay = BASE_DELAY_MS / wpm;
    let delay = baseDelay;

    // Length penalty: longer words take longer to process
    if (word.length > 6) {
        delay += (word.length - 6) * 10;
    }

    // Punctuation pauses
    if (word.endsWith('.')) delay += 150; // Full stop pause
    else if (word.endsWith(',')) delay += 75; // Comma pause
    else if (word.endsWith('?')) delay += 150;
    else if (word.endsWith('!')) delay += 150;
    else if (word.endsWith(';')) delay += 100;
    else if (word.endsWith(':')) delay += 100;

    return Math.max(delay, baseDelay * 0.5); // Minimum safety floor
}
