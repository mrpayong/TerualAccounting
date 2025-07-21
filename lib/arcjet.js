

import arcjet, { tokenBucket } from "@arcjet/next";

// const aj = arcjet({
//     key: process.env.ARCJET_KEY,
//     characteristics: ["userId"], // track base on clerk id
//     rules: [
//         tokenBucket({
//             mode: "LIVE",
//             refillRate: 2,
//             interval: 3600,
//             capacity: 2,
//         }),
//     ],
// });

// export default aj;


const aj = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics: ["userId"], // Track based on Clerk userId
  rules: [
    // Rate limiting specifically for collection creation
    tokenBucket({
      mode: "LIVE",
      refillRate: 1000, // 10 collections
      interval: 3600, // per hour
      capacity: 1000, // maximum burst capacity
    }),
  ],
});

export default aj;