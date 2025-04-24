// /* eslint-disable no-undef */
// const originalLog = console.log;

// console.log = (...args) => {
//   const err = {};
//   Error.captureStackTrace(err, console.log);

//   const stackLines = err.stack?.split("\n") || [];

//   const callerFile = stackLines
//     .map(
//       (line) =>
//         line.match(/\((.*):\d+:\d+\)/)?.[1] ||
//         line.match(/at (.*):\d+:\d+/)?.[1],
//     )
//     .find(Boolean);

//   const isAllowed =
//     callerFile &&
//     (callerFile.includes("/__tests__/") ||
//       /\.test\.(j|t)sx?$/.test(callerFile));

//   if (isAllowed) {
//     originalLog(...args);
//   }
//   // else: silence
// };
