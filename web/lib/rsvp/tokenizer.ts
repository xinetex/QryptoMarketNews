/**
 * Simple Tokenizer for RSVP
 * Splits text into words, preserving some punctuation structure for timing.
 */

export function tokenize(text: string): string[] {
    if (!text) return [];
    // Split by spaces but keep punctuation attached to words
    return text.trim().split(/\s+/).filter(w => w.length > 0);
}

/**
 * Estimate read time in seconds based on WPM
 */
export function estimateReadTime(text: string, wpm: number): number {
    const wordCount = tokenize(text).length;
    return (wordCount / wpm) * 60;
}
