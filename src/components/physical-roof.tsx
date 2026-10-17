export type PhysicalRoofProps = {
  separation?: number;
  active?: number;
  onSelect?: (i: number) => void;
  progress?: number;
  reduced?: boolean;
  paused?: boolean;
  embed?: boolean;
};

/**
 * Static stand-in for the 3D assembly viewer (the interactive model was never shipped;
 * main rendered an empty box here). Shows the exploded roof-system illustration and
 * accepts the props callers pass so typecheck succeeds.
 */
export default function PhysicalRoof(_props: PhysicalRoofProps) {
  return (
    <img
      className="physical-fallback"
      src="/images/anatomy.webp"
      alt="Exploded view of a shingle roof system: ridge cap, shingles, underlayment, flashing, decking and rafters"
      width={1400}
      height={933}
      loading="lazy"
      decoding="async"
    />
  );
}
