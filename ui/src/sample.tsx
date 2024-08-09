/**
 * Sample a random value from a population. The probabilities are
 * based on the provided weights. Each element in the population
 * must have an associated weight in the same index.
 * @param population the elements to sample from.
 * @param weights the weights which make the probabilities proportional.
 * @returns one randomly sampled element from the population.
 */
export function sample(population: any[], weights: number[]) {
    if (population.length != weights.length) {
        throw new Error('population and weights must be of equal length')
    }

    const totalWeight = weights.reduce((a, b) => a+b)
    
    const r = Math.random() * totalWeight
    let accum = 0

    for (let i = 0; i < weights.length; i++) {
        accum += weights[i]
        if (r <= accum) {
            return population[i]
        }
    }
    throw new Error('Unreachable')
}


/**
 * Creates a distribution of probabilities assigned to each score.
 * Higher scores are assigned a higher probability. The intelligence
 * factor distorts the probabilities, assigning more to lower scores
 * the lower it gets. An intelligence factor of 1 means that the best
 * score is assigned all the probability, while a factor of 0 will make
 * the distribution (mostly) uniform.
 * @param scores the scores to assign the probabilities to.
 * @param intelligenceFactor a number [0, 1]
 * @returns array of the probability assigned to each score (in the same index)
 */
export function aiDecisionDistribution(scores: number[], intelligenceFactor: number) {
    // normalize the scores to the range [0, 1]
    const normScores = scores.map((score) => (score + 1) / 2)

    // the temperature is very aggressive in distorting the probabilities
    // so we use a negative exponential to make the change less drastic
    const temperature = Math.exp(-intelligenceFactor * 9) * 5

    // special case: pick the best scenarios only
    if (temperature < 0.001) {
        const maxScore = Math.max(...normScores)
        const bestIndices: number[] = []
        normScores.forEach((score, i) => {
            if (score === maxScore) {
                bestIndices.push(i)
            }
        }, [])

        const distribution: number[] = new Array(normScores.length).fill(0)
        const probability = 1 / bestIndices.length
        bestIndices.forEach((index) => {
            distribution[index] = probability
        })
        return distribution
    }

    // apply the softmax operation with a temperature parameter
    const expScores = normScores.map((score) => Math.exp(score / temperature))
    const sum = expScores.reduce((a, b) => a + b, 0)
    const probabilities = expScores.map((score) => score / sum)

    return probabilities
}
