import { stats } from "@/lib/content";
import { CountUp, Stagger, Item } from "./Motion";

export function Stats() {
  return (
    <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {stats.map((s) => (
        <Item key={s.label}>
          <div className="card h-full p-5">
            <p className="font-sans text-[2.5rem] font-medium leading-none tracking-[-0.03em] text-green">
              <CountUp to={s.value} suffix={s.suffix} />
              {s.unit && (
                <span className="ml-1.5 text-lg font-normal tracking-normal text-forest/60">
                  {s.unit}
                </span>
              )}
            </p>
            <p className="mt-3 text-small font-semibold text-forest">{s.label}</p>
            <p className="mt-2 text-[0.6875rem] leading-snug">{s.def}</p>
            <p className="micro mt-4 border-t border-line pt-3">{s.foot}</p>
          </div>
        </Item>
      ))}
    </Stagger>
  );
}
