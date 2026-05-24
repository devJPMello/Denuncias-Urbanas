/**
 * Gera um par de chaves VAPID para Web Push.
 *
 * Uso:
 *   npx ts-node src/scripts/generate-vapid.ts
 *
 * Cole a saída no .env do backend e em VITE_VAPID_PUBLIC_KEY no .env do frontend.
 */

import * as webpush from 'web-push';

const keys = webpush.generateVAPIDKeys();

console.log('\n=== VAPID Keys geradas ===\n');
console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log('\n# Cole no frontend:');
console.log(`VITE_VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log();
