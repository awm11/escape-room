import { sha256 } from '../engine/sha256.js'
import { SALT } from './salt.js'

// Answers are stored as hashes so they don't show up in "View Source".
// To change one:  npm run hash -- "new answer"  and paste the result here.
export const ANSWERS = {
  // "Time's tide waits for no one: set course for the future."  (with or without the double quotes)
  secretPhrase: [
    'f4b1e88d941b1a67365302b29919fe9cb23d05b905624a3afad5d0f07ad51ffe',
    'ccff3eb56144c34f87b1fba6989506d3e83abc15c65e63adcaa576305ebb83fc',
  ],
  // Engine restart code
  engineCode: ['54dafbd91d7aa3b77ca1c2319b66cedb0de4101c798fba5787fd4749b6e23779'],
}

/**
 * Exact matching, with only two allowances for how devices type:
 *  - spaces before/after the whole answer are ignored
 *  - "smart" quotes (’ ‘ “ ”, added by iPads and phones) count as plain ' and "
 * Capitals, punctuation and spelling must be exactly right.
 */
export function clean(raw) {
  return raw.trim().replace(/[‘’ʼ]/g, "'").replace(/[“”]/g, '"')
}

export function matches(raw, hashes) {
  return hashes.includes(sha256(SALT + clean(raw)))
}
