import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

type TooltipProps = {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: TooltipPosition;
};

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
}) => {
  const triggerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [placement, setPlacement] = useState<TooltipPosition>(position);

  const show = () => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();

    let top = rect.top;
    let left = rect.left;
    let finalPlacement = position;

    if (position === 'top') {
      top = rect.top - 8;
      left = rect.left + rect.width / 2;

      if (top < 0) {
        top = rect.bottom + 8;
        finalPlacement = 'bottom';
      }
    }

    if (position === 'bottom') {
      top = rect.bottom + 8;
      left = rect.left + rect.width / 2;

      if (top > window.innerHeight - 40) {
        top = rect.top - 8;
        finalPlacement = 'top';
      }
    }

    setCoords({ top, left });
    setPlacement(finalPlacement);
    setVisible(true);
  };

  const getTransform = () => {
    if (placement === 'top') return 'translate(-50%, -100%)';
    if (placement === 'bottom') return 'translate(-50%, 0)';
    if (placement === 'left') return 'translate(-100%, -50%)';
    if (placement === 'right') return 'translate(0, -50%)';
    return '';
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={show}
        onMouseLeave={() => setVisible(false)}
        className="inline-block"
      >
        {children}
      </div>

      {visible &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              top: coords.top,
              left: coords.left,
              transform: getTransform(),
              zIndex: 9999,
            }}
            className="
              bg-gray-700/70 text-white text-xs
              backdrop-blur-[2px]
              px-2 py-1 rounded-md
              shadow-lg
              max-w-xs
              whitespace-normal
              pointer-events-none
            "
          >
            {content}
          </div>,
          document.body,
        )}
    </>
  );
};
