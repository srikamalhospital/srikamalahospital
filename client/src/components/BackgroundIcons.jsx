import React, { useMemo } from 'react';
import { Plus, Droplets, Scissors, Pill, Syringe, Biohazard, Activity, Heart } from 'lucide-react';

const BackgroundIcons = () => {
  const icons = useMemo(() => {
    const iconTypes = [
      { Icon: Plus, size: 12 },
      { Icon: Droplets, size: 14 },
      { Icon: Scissors, size: 16 },
      { Icon: Pill, size: 12 },
      { Icon: Syringe, size: 18 },
      { Icon: Activity, size: 14 },
      { Icon: Heart, size: 12 }
    ];

    return Array.from({ length: 40 }).map((_, i) => {
      const type = iconTypes[Math.floor(Math.random() * iconTypes.length)];
      return {
        id: i,
        Icon: type.Icon,
        size: type.size,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 10}s`,
        duration: `${15 + Math.random() * 20}s`,
        opacity: 0.03 + Math.random() * 0.04
      };
    });
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[1]">
      {icons.map(({ id, Icon, size, top, left, delay, duration, opacity }) => (
        <div
          key={id}
          className="bg-icon"
          style={{
            top,
            left,
            opacity,
            animation: `float-badge ${duration} ease-in-out ${delay} infinite`
          }}
        >
          <Icon size={size} strokeWidth={1.5} />
        </div>
      ))}
    </div>
  );
};

export default BackgroundIcons;
