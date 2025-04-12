import seedrandom from 'seedrandom';

export default async function getRandomNumberPacket(seed) {
    const rng = seedrandom(seed);

    const value = Object.freeze({
        seed,
        num: Math.floor(rng()),
    });

    // stall just to mock a slow API
    await new Promise((resolve, reject)=>{
        try {
            setTimeout(()=>{
                resolve();
            }, Math.random() * 3000 + 2000); // wait between 2 to 5 seconds
        } catch(err) {
            reject(err);
        }
    });

    return value;
}
