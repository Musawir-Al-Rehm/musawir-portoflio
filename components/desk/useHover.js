import { useRef } from "react";

// Pointer handlers for a clickable 3D object: pointer cursor + a label for the tooltip.
export function useHover(label, interactive, onHover) {
  const hovered = useRef(false);
  const handlers = {
    onPointerOver: (e) => {
      e.stopPropagation();
      if (!interactive) return;
      hovered.current = true;
      document.body.style.cursor = "pointer";
      onHover?.(label);
    },
    onPointerOut: () => {
      hovered.current = false;
      document.body.style.cursor = "";
      onHover?.(null);
    },
  };
  return [hovered, handlers];
}
