export default function DeleteIcon({
  width = 28,
  height = 28,
  className,
  color = "#c7c7c7ff",
  strokeWidth = 3
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M5 5L19 19M5 19L19 5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
