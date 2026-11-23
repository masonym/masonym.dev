/* eslint-disable @next/next/no-img-element */

// A floor modifier icon on the blue or red backing the Battlesim HUD draws it on, at the game's
// size (the backing is 41x38). `zoom` scales the pair up crisply. The backings are translucent
// and drawn over the dark HUD in game, so they get the same dark base in both themes.
export default function ModifierIcon({ icon, backing, zoom = 1 }) {
  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center w-[41px] h-[38px] rounded-[5px] bg-[hsl(220,25%,13%)]"
      style={{ zoom, imageRendering: "pixelated" }}
    >
      {backing && (
        <img src={backing} alt="" className="absolute inset-0 w-full h-full" />
      )}
      {icon && <img src={icon} alt="" className="relative" />}
    </span>
  );
}
