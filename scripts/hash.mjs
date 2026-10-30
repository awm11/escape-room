// Generate the hash for a new answer, to paste into src/game/answers.js.
//   npm run hash -- "8643"
import { sha256 } from '../src/engine/sha256.js'
import { SALT } from '../src/game/salt.js'

const answer = process.argv[2]
if (answer === undefined) {
  console.log('Usage: npm run hash -- "your answer"')
  process.exit(1)
}
console.log(sha256(SALT + answer))
