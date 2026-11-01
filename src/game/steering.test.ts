import { describe, expect, it } from "vitest";
import { MAX_WHEEL_ANGLE, steeringWheelAngle } from "./steering";

describe("steering wheel", () => {
  it("turns clockwise when steering right", () => {
    expect(steeringWheelAngle(0.07)).toBeCloseTo(-MAX_WHEEL_ANGLE / 2);
  });
  it("turns counter-clockwise when steering left", () => {
    expect(steeringWheelAngle(-0.14)).toBeCloseTo(MAX_WHEEL_ANGLE);
  });
  it("never exceeds the lock", () => {
    expect(steeringWheelAngle(1)).toBeCloseTo(-MAX_WHEEL_ANGLE);
  });
});
