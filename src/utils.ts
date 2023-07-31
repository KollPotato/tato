export function levenshteinDistance(string1: string, string2: string): number {
    const string1_length = string1.length
    const string2_length = string2.length
    const dp: number[][] = []

    for (let i = 0; i <= string1_length; i++) {
        dp[i] = [];
        dp[i][0] = i;
    }

    for (let j = 0; j <= string2_length; j++) {
        dp[0][j] = j;
    }

    for (let i = 1; i <= string1_length; i++) {
        for (let j = 1; j <= string2_length; j++) {
            const cost = string1[i - 1] === string2[j - 1] ? 0 : 1
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,
                dp[i][j - 1] + 1,
                dp[i - 1][j - 1] + cost
            )
        }
    }

    return dp[string1_length][string2_length]
}

export function findClosestMatch(input: string, allowedStrings: string[], threshold: number): string | null {
    let closestMatch = null
    let minDistance = threshold + 1

    for (let i = 0; i < allowedStrings.length; i++) {
        const distance = levenshteinDistance(input, allowedStrings[i])

        if (distance <= threshold && (closestMatch === null || distance < minDistance)) {
            closestMatch = allowedStrings[i]
            minDistance = distance
        }
    }

    return closestMatch
}

export const copyObject = <T extends object>(object: T): T => {
    return JSON.parse(JSON.stringify(object)) as T
}
