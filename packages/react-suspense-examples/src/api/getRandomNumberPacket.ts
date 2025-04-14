import seedrandom from 'seedrandom';

type SeedObject<T> = {
    seed: T,
    num: number,
};

export default async function getRandomNumberPacket<T extends string>(seed: T): Promise<SeedObject<T>> {
    const rng = seedrandom(seed);

    const value = Object.freeze({
        seed,
        num: Math.floor(rng()),
    });

    // stall just to mock a slow API
    await new Promise<void>((resolve, reject)=>{
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
