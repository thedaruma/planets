/**
 * Module of helper functions for randomly generating stellar bodies and star systems
 */

import { getRandomInt, isWinningRoll } from "../../../utility/Utility";
import { MAX_STELLAR_BODY_SIZE } from "../stellar-bodies/Constants";
import {
  StellarBodyObject,
  setStellarBodyData,
} from "../stellar-bodies/StellarBodyRepository";
import { MineralType, GasType, StellarBodySize } from "../stellar-bodies/Types";
import {
  MIN_ORBIT_SIZE,
  MAX_ORBIT_SIZE,
  MIN_ROTATION_SPEED,
  MAX_ROTATION_SPEED,
} from "./Constants";
import { StarSystemObject, setStarSystem } from "./StarSystemRepository";

type PossibleCompositionValues = 0 | 1 | 2 | 3;

/** Generate gas or mineral values at random for a planet
 *
 * T expects a MineralType or GasType to inform the return value of the random composition
 */
export function generateRandomCompositionValues<
  T extends MineralType | GasType
>(
  /** Number of elements that the stellar body is composed of */
  numberToGenerate: PossibleCompositionValues,
  /** Actual elements to choose from when randomly creating the value */
  valueBank: T[]
) {
  const result: [T, number][] = [];
  const arr = [...valueBank];
  while (arr.length) {
    const i = getRandomInt(0, arr.length);
    const type = arr.splice(i, 1)[0];
    const value = Math.random();
    result.push([type, value]);

    if (result.length >= numberToGenerate) {
      return result;
    }
  }
}

function getRandomCompositionValue() {
  return getRandomInt(1, 3) as PossibleCompositionValues;
}

/** Creates a random stellar body object within the given configuration
 * and value clamps. Reasonable defaults are provided.
 */
function createRandomStellarBodyObject({
  numberOfMinerals,
  numberOfGasElements,
  numberOfStellarBodiesInOrbit = 0,
  minSize = 0,
  maxSize = MAX_STELLAR_BODY_SIZE,
  minDistanceFromCenter = MIN_ORBIT_SIZE,
  maxDistanceFromCenter = MAX_ORBIT_SIZE,
  minRotationSpeed = MIN_ROTATION_SPEED,
  maxRotationSpeed = MAX_ROTATION_SPEED,
}: {
  numberOfMinerals?: PossibleCompositionValues;
  numberOfGasElements?: PossibleCompositionValues;
  numberOfStellarBodiesInOrbit?: number;
  minSize?: number;
  maxSize?: number;
  minDistanceFromCenter?: number;
  maxDistanceFromCenter?: number;
  minRotationSpeed?: number;
  maxRotationSpeed?: number;
}): StellarBodyObject {
  if (!numberOfMinerals && !numberOfGasElements) {
    const hasMinerals = isWinningRoll(0.5);
    numberOfMinerals = hasMinerals ? 1 : 0;
    numberOfGasElements = hasMinerals ? 0 : 1;
  }

  const size = getRandomInt(minSize, maxSize) as StellarBodySize;
  const distanceFromCenter = getRandomInt(
    minDistanceFromCenter,
    maxDistanceFromCenter
  );

  const composition = {
    mineral: numberOfMinerals
      ? generateRandomCompositionValues<MineralType>(numberOfMinerals, [
          "purple",
          "orange",
          "green",
        ])
      : [],
    gas: numberOfGasElements
      ? generateRandomCompositionValues<GasType>(numberOfGasElements, [
          "red",
          "yellow",
          "blue",
        ])
      : [],
  };
  const id = new Date().getTime() * Math.random();
  const orbit = [];
  for (let j = 0; j < numberOfStellarBodiesInOrbit; j++) {
    // Push satellites into orbit
    orbit.push(
      createRandomStellarBodyObject({
        numberOfMinerals: 1,
        numberOfGasElements: 0,
        maxSize: getRandomInt(minSize, size - 1),
        minDistanceFromCenter: 25,
        maxDistanceFromCenter: 50,
      })
    );
  }

  const stellarBodyData = {
    //TODO: Randomly generate names
    name: "Rando",
    id,
    distanceFromCenter,
    size,
    rotationSpeed: getRandomInt(minRotationSpeed, maxRotationSpeed),
    composition,
    orbit: orbit.map((o) => o.id),
  };

  /** Register it to our internal database */
  setStellarBodyData(stellarBodyData);
  return stellarBodyData;
}

/** Randomly generate a system with a sun, planets and moons */
export function createRandomSystem(
  /** The coordinates at which the star system should exist within the context of the game's Hex Map */
  coordinates: [number, number]
): StarSystemObject {
  const sun = createRandomStellarBodyObject({ minSize: 3 });

  const numberOfPlanets = getRandomInt(1, 10);
  const planets: StellarBodyObject[] = [];
  for (let i = 0; i < numberOfPlanets; i++) {
    const numberOfMoons = getRandomInt(0, 3);

    const planet = createRandomStellarBodyObject({
      numberOfStellarBodiesInOrbit: numberOfMoons,
      minSize: 1,
      maxSize: sun.size - 1,
    });

    planets.push(planet);
  }

  const starSystemObject = {
    id: Math.random(),
    sun,
    system: planets,
    coordinates,
  };

  const starSystemData = {
    id: starSystemObject.id,
    coordinates: starSystemObject.coordinates,
    sun: starSystemObject.sun.id,
    system: planets.map((p) => {
      return p.id;
    }),
  };
  setStarSystem(starSystemData);

  return starSystemObject;
}
