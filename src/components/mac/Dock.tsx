"use client";

export type DockItem = {
  id: string;
  label: string;
  Icon: (props: { className?: string }) => React.ReactNode;
  running: boolean;
};

export function Dock({ items, onLaunch }: { items: DockItem[]; onLaunch: (id: string) => void }) {
  return (
    <nav aria-label="Dock" className="z-chrome fixed inset-x-0 bottom-1.5 flex justify-center px-2 select-none">
      <div className="lg refract mac-dock flex items-end gap-1 px-1.5 pt-1.5 pb-1">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onLaunch(item.id)}
            aria-label={item.label}
            className="mac-dock-item relative flex cursor-default flex-col items-center px-0.5"
          >
            <span className="mac-tooltip pointer-events-none absolute -top-10 left-1/2 rounded-lg px-2.5 py-1 text-ui whitespace-nowrap">
              {item.label}
            </span>
            <item.Icon className="mac-dock-icon drop-shadow-dock-icon" />
            <span className={`mt-0.75 h-1 w-1 rounded-full ${item.running ? "bg-white/85" : "bg-transparent"}`} />
          </button>
        ))}
      </div>
    </nav>
  );
}
