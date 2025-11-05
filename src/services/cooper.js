const COOPER_TRIP_SIZE_METERS = 320
// https://es.wikipedia.org/wiki/Test_de_Cooper
const COOPER_RANGES = {
  // Women (F)
  f: {
    0: [1300, 1500, 1750, 1951], // 11-12
    1: [1500, 1600, 1900, 2001], // 13-14
    2: [1600, 1700, 2000, 2101], // 15-16
    3: [1700, 1800, 2100, 2301], // 17-19
    4: [1500, 1800, 2200, 2701], // 20-29
    5: [1400, 1700, 2000, 2501], // 30-39
    6: [1200, 1500, 1900, 2301], // 40-49
    7: [1100, 1400, 1700, 2201], // 50+
  },
  // Male (M)
  m: {
    0: [1950, 2050, 2250, 2601], // 11-12
    1: [2100, 2200, 2400, 2701], // 13-14
    2: [2200, 2300, 2500, 2801], // 15-16
    3: [2300, 2500, 2700, 3001], // 17-19
    4: [1600, 2200, 2400, 2801], // 20-29
    5: [1500, 1900, 2300, 2701], // 30-39
    6: [1400, 1700, 2100, 2501], // 40-49
    7: [1300, 1600, 2000, 2401], // 50+
  },
}

const getAgeIndex = (age) => {
  if (age >= 11 && age <= 12) return 0
  if (age >= 13 && age <= 14) return 1
  if (age >= 15 && age <= 16) return 2
  if (age >= 17 && age <= 19) return 3
  if (age >= 20 && age <= 29) return 4
  if (age >= 30 && age <= 39) return 5
  if (age >= 40 && age <= 49) return 6
  if (age >= 50) return 7
  return null
}

const cooperResults = (value, [veryBad, bad, normal, good]) => {
  if (value < veryBad) return 1
  if (value < bad) return 2
  if (value < normal) return 3
  if (value < good) return 4
  return 5 // veryGood
}

// console.log(evaluateCooper(2200, 25, 'm')); // 3
// console.log(evaluateCooper(1800, 35, 'f')); // 3
export const evaluateCooper = (distanceMeters, age, genderKey) => {
  const ageIndex = getAgeIndex(age)
  if (ageIndex === null) return null

  const ranges = COOPER_RANGES[genderKey][ageIndex]

  return cooperResults(distanceMeters, ranges)
}

export const toMeters = (laps) => {
  return laps * COOPER_TRIP_SIZE_METERS
}

export const toKilometers = (meters) => {
  return meters / 1000
}
