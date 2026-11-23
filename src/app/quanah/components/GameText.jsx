// Renders a client string that uses the game's colour markup: #c...# wraps the words the game
// draws in orange (e.g. "#cLightning# strikes to attack."), and \n is a line break.
export default function GameText({ text }) {
  if (!text) return null;
  return text.split("\n").map((line, i) => (
    <span key={i} className="block">
      {line
        .split(/#c(.*?)#/)
        .map((part, j) =>
          j % 2 ? (
            <span key={j} className="text-progress-orange">
              {part}
            </span>
          ) : (
            part
          ),
        )}
    </span>
  ));
}
