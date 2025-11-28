// frontend/src/components/SwipeDeck.jsx
import React from "react";

/**
 * SwipeDeck
 * Single card container - shows only one card at a time.
 * No stacking effect - clean single card display.
 */
export default function SwipeDeck({ children }) {
  const cards = React.Children.toArray(children);

  // Only show the first card (top card)
  const topCard = cards[0];

  if (!topCard) return null;

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-full h-full max-w-md flex items-center justify-center">
        {topCard}
      </div>
    </div>
  );
}
