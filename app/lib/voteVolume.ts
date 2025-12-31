type Bucket = {
    min: number
    max: number
    weight: number
}

const BUCKETS: Bucket[] = [
    { min: 0, max: 0, weight: 10 },
    { min: 1, max: 5, weight: 20 },
    { min: 6, max: 15, weight: 35 },
    { min: 16, max: 40, weight: 25 },
    { min: 41, max: 80, weight: 10 },
]

export function pickHourlyVoteCount(): number {
    const totalWeight = BUCKETS.reduce((s, b) => s + b.weight, 0)
    let roll = Math.random() * totalWeight

    for (const bucket of BUCKETS) {
        if (roll < bucket.weight) {
            return (
                bucket.min +
                Math.floor(Math.random() * (bucket.max - bucket.min + 1))
            )
        }
        roll -= bucket.weight
    }

    return 10
}
