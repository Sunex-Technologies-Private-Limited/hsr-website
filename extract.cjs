const fs = require('fs');
const readline = require('readline');

async function extract() {
  const fileStream = fs.createReadStream('c:/Users/omkar/.gemini/antigravity-ide/brain/aacbe222-ec8b-4bae-8a0d-28f307872cf2/.system_generated/logs/transcript_full.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  for await (const line of rl) {
    if (line.includes('HSR DIGITAL HUB — FULL PRODUCTION REMEDIATION BRIEF') && line.includes('USER_INPUT')) {
      const obj = JSON.parse(line);
      fs.writeFileSync('original_prompt.txt', obj.content);
      console.log('Extracted to original_prompt.txt');
      return;
    }
  }
}
extract();
