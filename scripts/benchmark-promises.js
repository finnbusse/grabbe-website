
const simulateIo = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runSequential(count, ms) {
  const start = Date.now();
  for (let i = 0; i < count; i++) {
    await simulateIo(ms);
  }
  return Date.now() - start;
}

async function runParallel(count, ms) {
  const start = Date.now();
  const promises = [];
  for (let i = 0; i < count; i++) {
    promises.push(simulateIo(ms));
  }
  await Promise.all(promises);
  return Date.now() - start;
}

async function main() {
  const count = 10;
  const ms = 100;

  console.log(`Running benchmark with ${count} tasks, each taking ${ms}ms...`);

  const seqTime = await runSequential(count, ms);
  console.log(`Sequential time: ${seqTime}ms`);

  const parTime = await runParallel(count, ms);
  console.log(`Parallel time: ${parTime}ms`);

  const improvement = ((seqTime - parTime) / seqTime * 100).toFixed(2);
  console.log(`Improvement: ${improvement}%`);
}

main();
