import { termsAndConditions, termsGroups } from "@/data/terms";
import { cn } from "@repo/ui/lib/utils";

const fa = (value: number) =>
  value.toLocaleString("fa-IR", { useGrouping: false });

/**
 * Terms renderer.
 *
 * `styled` groups clauses into titled sections; the display number is always the
 * clause's original position in `termsAndConditions`, so a reference to "بند ۷"
 * keeps meaning the same thing no matter how the page is laid out.
 */
const Terms = ({ style = "styled" }: { style?: "raw" | "styled" }) => {
  if (style === "raw") {
    return (
      <div className="w-fit space-y-3">
        {termsAndConditions.map((term, index) => (
          <p key={index} className="text-sm">
            {index + 1}. {term}
          </p>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {termsGroups.map((group) => (
        <section
          key={group.id}
          id={group.id}
          className="scroll-mt-28 space-y-4"
        >
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-[11px] font-extrabold text-white shadow-md shadow-primary/20">
              {fa(group.items.length)}
            </span>

            <div className="space-y-1">
              <h2 className="text-base font-extrabold tracking-tight">
                {group.title}
              </h2>
              <p className="text-xs leading-5 text-muted-foreground">
                {group.description}
              </p>
            </div>
          </div>

          <ol className="space-y-3">
            {group.items.map((itemIndex) => (
              <li
                key={itemIndex}
                className={cn(
                  "group flex gap-4 rounded-2xl border bg-background p-5 transition-colors",
                  "hover:border-primary/25 hover:bg-primary/[0.02]",
                )}
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-muted text-[11px] font-bold tabular-nums text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                  {fa(itemIndex + 1)}
                </span>

                <p className="text-sm leading-7 text-muted-foreground">
                  {termsAndConditions[itemIndex]}
                </p>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
};

export default Terms;
