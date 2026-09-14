# Event Rewards page

Renders `event_rewards.json` produced by the `EventRewardExtractor` C# tool in
`WzDataExtractor`. Hover behavior mirrors the Cash Shop tool.

## Refreshing data after a patch

After running `EventRewardExtractor.exe`, copy the output JSON and icons into
this Next.js project:

```powershell
# Adjust the source path to wherever you ran the extractor with --out
$SRC = "$HOME\Documents\coding_projects\WzDataExtractor\output\event_rewards"
$DST = "$HOME\Documents\coding_projects\masonym.dev"

Copy-Item "$SRC\event_rewards.json" "$DST\src\app\event-rewards\data\event_rewards.json" -Force

New-Item -ItemType Directory -Force -Path "$DST\public\images\event-rewards" | Out-Null
Copy-Item "$SRC\event_reward_icons\*.png" "$DST\public\images\event-rewards\" -Force
```

Then `npm run dev` and visit `/event-rewards`.

## Section labels

Per-event display names and section groupings live in `data/sections.js`.
Events not listed there fall back to auto-grouping by `parent_path`. See the
comment block at the top of `sections.js` for the matcher shapes.
