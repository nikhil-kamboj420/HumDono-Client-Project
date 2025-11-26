// frontend/src/components/SwipeDeck.jsx
import React from "react";

/**
 * SwipeDeck
 * Simple stacking container for cards.
 * We keep it minimal: absolute positioned children stack with slight offsets.
 */
export default function SwipeDeck({ children }) {
  const cards = React.Children.toArray(children);

  return (
    <div className="w-full h-[95%] flex items-center justify-center">
      <div className="relative w-full h-[95%] max-w-md">
        {cards.map((child, idx) => {
          // top card = last in array
          const depth = cards.length - idx;
          const offset = Math.min(depth * 6, 40);
          const scale = 1 - Math.min((cards.length - idx - 1) * 0.02, 0.1);
          return (
            <div
              key={idx}
              style={{
                zIndex: 100 + idx,
                transform: `translateY(${offset}px) scale(${scale})`,
              }}
              className="absolute inset-0 flex items-start justify-center transition-transform duration-300"
            >
              {child}
            </div>
          );
        })}
      </div>
    </div>
  );
}
