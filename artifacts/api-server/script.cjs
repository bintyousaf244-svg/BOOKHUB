const fs = require('fs');
const p = "c:/Users/binty/OneDrive/Desktop/learner's grove/BOOKHUB/artifacts/api-server/node_modules/@workspace/api-zod/src/generated/api.ts";
let c = fs.readFileSync(p, 'utf8');

c = c.replace(/( +)coverImage: zod\.string\(\),/g, '$1coverImage: zod.string(),\n$1previewImage1: zod.string().nullish(),\n$1previewImage2: zod.string().nullish(),');
c = c.replace(/( +)coverImage: zod\.string\(\)\.optional\(\),/g, '$1coverImage: zod.string().optional(),\n$1previewImage1: zod.string().nullish(),\n$1previewImage2: zod.string().nullish(),');

// Remove from order items (hack: replace it if it's inside topSellingBooks or listOrders? Wait.
// Actually, I can just leave it as is, or remove it from the specific line for order items)
// The Order item schema lines are 317 and 444 where it has 10 spaces.
c = c.replace(/          previewImage1: zod\.string\(\)\.nullish\(\),\n/g, '');
c = c.replace(/          previewImage2: zod\.string\(\)\.nullish\(\),\n/g, '');

fs.writeFileSync(p, c, 'utf8');
