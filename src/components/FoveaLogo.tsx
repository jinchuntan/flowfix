export default function FoveaLogo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={Math.round(size * 0.62)}
      viewBox="0 0 90 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Upper left wing */}
      <ellipse
        cx="23" cy="17" rx="21" ry="9"
        transform="rotate(-8 23 17)"
        stroke="currentColor" strokeWidth="1.4" fill="none" opacity="0.85"
      />
      {/* Upper right wing */}
      <ellipse
        cx="67" cy="17" rx="21" ry="9"
        transform="rotate(8 67 17)"
        stroke="currentColor" strokeWidth="1.4" fill="none" opacity="0.85"
      />
      {/* Lower left wing */}
      <ellipse
        cx="27" cy="28" rx="15" ry="6.5"
        transform="rotate(6 27 28)"
        stroke="currentColor" strokeWidth="1.1" fill="none" opacity="0.6"
      />
      {/* Lower right wing */}
      <ellipse
        cx="63" cy="28" rx="15" ry="6.5"
        transform="rotate(-6 63 28)"
        stroke="currentColor" strokeWidth="1.1" fill="none" opacity="0.6"
      />
      {/* Head */}
      <circle cx="45" cy="10" r="4.5" fill="currentColor" />
      {/* Eyes */}
      <circle cx="41.5" cy="9" r="2" fill="currentColor" opacity="0.5" />
      <circle cx="48.5" cy="9" r="2" fill="currentColor" opacity="0.5" />
      {/* Thorax */}
      <ellipse cx="45" cy="18" rx="3.8" ry="6" fill="currentColor" />
      {/* Abdomen segments */}
      <rect x="42.5" y="23" width="5" height="4.5" rx="2.5" fill="currentColor" />
      <rect x="43"   y="27" width="4" height="4"   rx="2"   fill="currentColor" />
      <rect x="43.5" y="30.5" width="3" height="4" rx="1.5" fill="currentColor" />
      <rect x="44"   y="34" width="2" height="4"   rx="1"   fill="currentColor" />
      <rect x="44.5" y="37.5" width="1" height="3" rx="0.5" fill="currentColor" />
    </svg>
  );
}
