"use client";

import React from "react";
import {
  EQUIP_SLOT_LAYOUT,
  SLOT_SIZE,
  WINDOW_WIDTH,
  WINDOW_HEIGHT,
  slotLabelSprite,
} from "@/lib/equip/uiLayout";
import { occupiedSlots } from "@/lib/equip/engine";

/**
 * The in-game equipment window, rebuilt from the UI.wz assets.
 *
 * The background, the 42px slot tiles and their positions all come straight out
 * of `UIEquip.img`, so the layout matches the client exactly rather than being
 * an approximation. See src/lib/equip/uiLayout.js.
 */
export default function EquipWindow({
  title,
  loadout,
  itemIndex,
  selectedSlot,
  onSelectSlot,
  onOpenSlot,
  onCopySlot,
  onHoverSlot,
  scale = 1,
  changedSlots = null,
  copyHint,
  flashSlot = null,
}) {
  // Slots covered by a multi-slot item equipped elsewhere (a two-hander covers
  // the secondary, an overall covers the bottom). The game blanks these.
  const covered = new Map();
  for (const [slotKey, config] of Object.entries(loadout || {})) {
    if (!config?.itemId) continue;
    const item = itemIndex.get(config.itemId);
    if (!item) continue;
    for (const s of occupiedSlots(item, slotKey)) {
      if (s !== slotKey) covered.set(s, item);
    }
  }

  return (
    <div className="shrink-0">
      {/* The window art already renders its own "EQUIPMENT" title bar, so the
          side label goes above it rather than on top of it. */}
      <h2 className="mb-1.5 text-sm font-semibold tracking-wide text-primary-bright">
        {title}
      </h2>

      <div
        className="relative select-none"
        style={{
          width: WINDOW_WIDTH * scale,
          height: WINDOW_HEIGHT * scale,
        }}
      >
        <div
          className="absolute top-0 left-0 origin-top-left"
          style={{
            width: WINDOW_WIDTH,
            height: WINDOW_HEIGHT,
            transform: `scale(${scale})`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/equip-ui/window.png"
            alt=""
            width={WINDOW_WIDTH}
            height={WINDOW_HEIGHT}
            className="absolute top-0 left-0 pointer-events-none"
            draggable={false}
          />

          {EQUIP_SLOT_LAYOUT.map((slot) => (
            <Slot
              key={slot.wzIndex}
              slot={slot}
              config={slot.slotKey ? loadout?.[slot.slotKey] : null}
              itemIndex={itemIndex}
              coveredBy={slot.slotKey ? covered.get(slot.slotKey) : null}
              selected={selectedSlot === slot.slotKey}
              changed={Boolean(slot.slotKey && changedSlots?.has(slot.slotKey))}
              onSelect={onSelectSlot}
              onOpen={onOpenSlot}
              onCopy={onCopySlot}
              onHover={onHoverSlot}
              copyHint={copyHint}
              flash={flashSlot?.slotKey === slot.slotKey ? flashSlot.id : null}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Slot({
  slot,
  config,
  itemIndex,
  coveredBy,
  selected,
  changed,
  onSelect,
  onOpen,
  onCopy,
  onHover,
  copyHint,
  flash,
}) {
  const item = config?.itemId ? itemIndex.get(config.itemId) : null;
  const interactive = Boolean(slot.slotKey) && !coveredBy;
  const stars = config?.stars ?? 0;

  const handleEnter = (e) => {
    if (!onHover) return;
    const rect = e.currentTarget.getBoundingClientRect();
    onHover({ slot, item, config, coveredBy, anchor: rect });
  };

  // Right-click sends this one slot to the other window - the reverse of "copy
  // everything across and change one thing", for when only one piece is worth
  // carrying over.
  const handleContextMenu = (e) => {
    if (!interactive || !onCopy) return;
    e.preventDefault();
    onCopy(slot.slotKey);
  };

  return (
    <div
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? () => onSelect?.(slot.slotKey) : undefined}
      onDoubleClick={interactive ? () => onOpen?.(slot.slotKey) : undefined}
      onContextMenu={handleContextMenu}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onOpen?.(slot.slotKey);
              }
            }
          : undefined
      }
      onMouseEnter={handleEnter}
      onMouseLeave={() => onHover?.(null)}
      className={`absolute ${interactive ? "cursor-pointer" : "cursor-default"}`}
      style={{ left: slot.x, top: slot.y, width: SLOT_SIZE, height: SLOT_SIZE }}
      title={
        slot.slotKey
          ? interactive && copyHint
            ? `${slot.name} - right-click to ${copyHint}`
            : undefined
          : `${slot.name} - not supported`
      }
    >
      {/* The label tile is only drawn while the slot is empty. The window art
          already contains the slot box, so an occupied slot shows just the icon -
          which is how the game does it, and keeps the name from bleeding through
          behind the item. */}
      {!item && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={slotLabelSprite(slot)}
          alt={slot.name}
          width={SLOT_SIZE}
          height={SLOT_SIZE}
          className="absolute top-0 left-0 pointer-events-none"
          draggable={false}
        />
      )}

      {coveredBy && (
        // A two-hander or overall occupies this slot; the game greys it out.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/equip-ui/slot-disabled.png"
          alt=""
          width={SLOT_SIZE}
          height={SLOT_SIZE}
          className="absolute top-0 left-0 pointer-events-none"
          draggable={false}
        />
      )}

      {item && !coveredBy && (
        <>
          {item.icon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/equip-icons/${item.icon}`}
              alt={item.name}
              className="absolute pointer-events-none"
              style={{
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                maxWidth: SLOT_SIZE - 6,
                maxHeight: SLOT_SIZE - 6,
              }}
              draggable={false}
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-[8px] leading-tight text-center px-0.5 text-[#2b3038] font-semibold pointer-events-none">
              {item.name.split(" ").slice(-1)[0]}
            </span>
          )}

          {stars > 0 && (
            // A gold-on-icon number was unreadable over bright item art, so the
            // count sits on its own bar across the foot of the tile instead.
            <span
              className="absolute pointer-events-none font-bold text-center tabular-nums"
              style={{
                left: 0,
                right: 0,
                bottom: 0,
                fontSize: 10,
                lineHeight: "12px",
                color: "#ffd75e",
                background: "rgba(0, 0, 0, 0.78)",
                borderBottomLeftRadius: 3,
                borderBottomRightRadius: 3,
              }}
            >
              {stars}★
            </span>
          )}
        </>
      )}

      {/* Keyed on the copy that caused it, so copying the same slot twice
          restarts the animation instead of leaving a finished one on screen. */}
      {flash && (
        <span
          key={flash}
          className="absolute inset-0 pointer-events-none equip-slot-flash"
        />
      )}

      {/* Selection and change highlights sit above everything. */}
      {selected && (
        <span className="absolute inset-0 pointer-events-none rounded-[3px] ring-2 ring-[color:var(--secondary)] ring-inset" />
      )}
      {changed && !selected && (
        <span className="absolute inset-0 pointer-events-none rounded-[3px] ring-2 ring-amber-400/80 ring-inset" />
      )}
    </div>
  );
}
