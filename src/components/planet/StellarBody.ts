import { COLOR_MAP } from "../../assets/data/stellar-bodies/Constants";
import {
  ResourceType,
  StellarBodySize,
} from "../../assets/data/stellar-bodies/Types";
import { getRandomInt } from "../../utility/Utility";
import { rotatePoint } from "./shared";
import { MineableResourceType } from "../../assets/data/stellar-bodies/Types";

export function getStellarBodyColorFromResourceType(
  composition: MineableResourceType
) {
  const colorArr = COLOR_MAP[composition];
  //TODO: Make this return a color indicative of the richness of the planet's composition
  const index = getRandomInt(0, colorArr.length);
  const randomColor = colorArr[index];

  return randomColor;
}

export type StellarBodyPayload = { resourceType: MineableResourceType } & {
  /** TODO: the ID of an artifact mined from the planet */
  artifact: number | null;
  remainingYield: number;
};
/**
 * A planetary body or star that has other StellarBodies to rotate around it.
 * Other bodies must be smaller than the parent StellarBody
 */
export default class StellarBody extends Phaser.Physics.Arcade.Sprite {
  public orbit: StellarBody[] = [];
  public distanceFromCenter: number;
  private rotationSpeed: number;
  private parentBody?: StellarBody;
  public id: number;
  private resourceType: MineableResourceType;

  static spriteDependencies: SpriteDependency[] = [
    {
      frameHeight: 128,
      frameWidth: 128,
      key: "planet",
      url: "/src/assets/sprites/planet.png",
    },
  ];
  // Used for when a rotating planet has bodies rotating around it
  private orbitContainer: Phaser.GameObjects.Container;
  constructor({
    scene,
    x = 0,
    y = 0,
    size,
    orbit = [],
    distanceFromCenter,
    rotationSpeed,
    color = 0xffffff,
    id,
    resourceType,
  }: {
    scene: Phaser.Scene;
    x?: number;
    y?: number;
    orbit?: StellarBody[];
    distanceFromCenter?: number;
    rotationSpeed?: number;
    size: StellarBodySize;
    color?: number;
    id: number;
    resourceType?: MineableResourceType;
  }) {
    super(scene, x, y, "planet", size);
    if (orbit.length) {
      orbit.forEach((o) => this.addToOrbit(o));
    }
    this.distanceFromCenter = distanceFromCenter;
    this.rotationSpeed = rotationSpeed;

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    this.setTint(color);
    if (resourceType) {
      this.setTint(getStellarBodyColorFromResourceType(resourceType));
    }
    this.id = id;
    this.resourceType = resourceType;
  }

  private isRotatingWithSatelites() {
    return Boolean(
      this.rotationSpeed && this.orbit.length && this.orbitContainer
    );
  }

  getX() {
    return this.isRotatingWithSatelites() ? this.orbitContainer.x : this.x;
  }

  getY() {
    return this.isRotatingWithSatelites() ? this.orbitContainer.y : this.y;
  }

  setX(value: number) {
    if (this.isRotatingWithSatelites()) {
      this.orbitContainer.x = value;
    } else {
      this.x = value;
    }
    return this;
  }

  setY(value: number) {
    if (this.isRotatingWithSatelites()) {
      this.orbitContainer.y = value;
    } else {
      this.y = value;
    }
    return this;
  }

  getOrbitSize() {
    return this.distanceFromCenter * 1.4;
  }

  private buildOrbitContainer() {
    this.orbitContainer = new Phaser.GameObjects.Container(
      this.scene,
      this.x,
      this.y
    );
    this.scene.add.existing(this.orbitContainer);
    this.orbitContainer.add(this);
    this.x = 0;
    this.y = 0;
  }

  addToOrbit(stellarBody: StellarBody | StellarBody[]) {
    if (this.rotationSpeed && !this.orbitContainer) {
      this.buildOrbitContainer();
    }
    if (Array.isArray(stellarBody)) {
      stellarBody.forEach((sb) => {
        this._addToOrbit(sb);
      });
    } else {
      this._addToOrbit(stellarBody);
    }
    return this;
  }

  /** Add the bodies to the orbit at a random quadrant */
  private _addToOrbit(stellarBody: StellarBody) {
    stellarBody.setX(
      this.getX() +
        stellarBody.distanceFromCenter * (getRandomInt(1, 3) % 2 === 0 ? 1 : -1)
    );
    stellarBody.setY(
      this.getY() +
        stellarBody.distanceFromCenter * (getRandomInt(1, 3) % 2 === 0 ? 1 : -1)
    );
    this.orbit.push(stellarBody);
    stellarBody.parentBody = this;
    if (this.isRotatingWithSatelites()) {
      this.orbitContainer.add(stellarBody);
    }
  }

  public setFocused(focused: boolean) {
    //TODO: Add juice to this
    this.setAlpha(focused ? 0.5 : 1);
  }

  update(time: number, delta: number) {
    // Tell StellarBodies in orbit to update
    this.orbit.forEach((sb) => sb.update(time, delta));

    // Update your own position if you're rotating around a StellarBody
    if (this.rotationSpeed && this.parentBody) {
      const rotateBy = ((90 * delta) / 500000) * this.rotationSpeed;
      const currentPosition = {
        x: this.getX(),
        y: this.getY(),
      };

      const newPosition = rotatePoint(
        currentPosition,
        this.parentBody,
        rotateBy
      );
      this.setX(newPosition.x);
      this.setY(newPosition.y);
    }
  }
}
