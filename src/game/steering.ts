/** Max steering wheel turn in the cockpit view (radians, ~150°). */
export const MAX_WHEEL_ANGLE = 2.6;
/** Car yaw (engine `player.rot`) at full lane-change steer. */
const FULL_ROT = 0.14;

/** Steering wheel angle for a car yaw. Positive rot (turning right) turns the wheel clockwise (negative z). */
export function steeringWheelAngle(rot: number): number {
  const k = Math.max(-1, Math.min(1, rot / FULL_ROT));
  return -k * MAX_WHEEL_ANGLE;
}
