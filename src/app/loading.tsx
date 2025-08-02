"use client";

import { useEffect, useState, useRef } from "react";

type ClusterShape = {
  type: typeof shapeTypes[number];
  rotation: number;
  opacity: number;
};

// Define the shape types as a constant tuple for type safety
const shapeTypes = ["circle", "triangle", "square"] as const;

// Initial archetypes cluster shapes displayed in the grid
const fixedShapes = [
  "circle", "triangle", "square",
  "square", "circle", "triangle",
  "triangle", "square", "circle"
];

// Possible rotation degrees for shape rotation animation
const degrees = [90, 180, 270, 360];

// Utility function to get a random shape type from shapeTypes
const getRandomShape = (): typeof shapeTypes[number] =>
  shapeTypes[Math.floor(Math.random() * shapeTypes.length)];

// Utility function to get a new rotation value by adding a random degree and wrapping at 360
const getRandomRotation = (current: number): number =>
  (current + degrees[Math.floor(Math.random() * degrees.length)]) % 360;

export default function Loading() {

  // State array holding the current shape, rotation, and opacity for each grid cell
  const [shapes, setShapes] = useState<ClusterShape[]>(
    fixedShapes.map((type) => ({
      type: type as ClusterShape["type"],
      rotation: 0,
      opacity: 1,
    }))
  );

  // Ref to store timeout IDs for each shape's animation loop, to allow cleanup
  const shapeTimers = useRef<number[]>([]);

  // Effect to initiate and manage the animation loops for each shape
  useEffect(() => {
    // Recursive function to animate each shape independently with randomized delays
    const startLoop = (i: number) => {
      // Random delay before starting the animation cycle for shape i
      const delay = 100 + Math.random() * 2000;

      const timer = window.setTimeout(() => {
        // Fade out the current shape by setting opacity to 0
        setShapes((prev) => {
          const next = [...prev];
          next[i] = { ...next[i], opacity: 0 };
          return next;
        });

        // After fade out completes (300ms), update shape type and rotation
        window.setTimeout(() => {
          setShapes((prev2) => {
            const next = [...prev2];
            next[i] = {
              ...next[i],
              type: getRandomShape(), // Assign new random shape type
              rotation: getRandomRotation(prev2[i].rotation), // Update rotation by random increment
            };
            return next;
          });

          // Step 3: Fade the shape back in by setting opacity to 1 after a short delay (50ms)
          window.setTimeout(() => {
            setShapes((prev3) => {
              const next = [...prev3];
              next[i] = { ...next[i], opacity: 1 };
              return next;
            });

            // Restart the animation loop for shape i to continue indefinitely
            startLoop(i);
          }, 50); // Small delay before fade in to prevent flicker
        }, 300); // Wait for fade out to complete before changing shape and rotation
      }, delay);

      return timer;
    };

    // Randomly select one shape to start its animation loop immediately
    const first = Math.floor(Math.random() * shapes.length);
    const firstTimer = startLoop(first);
    shapeTimers.current[first] = firstTimer;

    // Schedule animation loops for all other shapes with randomized delays
    shapes.forEach((_, i) => {
      if (i !== first) {
        const timer = startLoop(i);
        shapeTimers.current[i] = timer;
      }
    });

    // Cleanup all scheduled timeouts when component unmounts
    return () => {
      shapeTimers.current.forEach(timer => {
        if (timer) clearTimeout(timer);
      });
    };
  }, [shapes]);

  useEffect(() => {
    const currentTimers = shapeTimers.current;
    return () => {
      currentTimers.forEach(timer => clearTimeout(timer));
    };
  }, [shapes]);

  return (
    <div
      className="w-12 rounded-lg bg-gray-800 flex flex-col items-center justify-center top-[50%] left-[50%] absolute translate-[-50%]"
    >
      <div
        className="p-2 grid grid-cols-3 gap-1 top-50"
        role="status"
        aria-live="polite"
      >
        {shapes.map((shape, i) => {
          const shapeClass =
            shape.type === "circle"
              ? "rounded-full bg-teal-500"
              : shape.type === "triangle"
                ? "clip-triangle bg-amber-500"
                : "bg-magenta-500";

          return (
            <div
              key={i}
              className={`w-2 h-2 ${shapeClass} shape-transition transition-opacity duration-300`}
              style={{
                transform: `rotate(${shape.rotation}deg)`,
                opacity: shape.opacity,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}