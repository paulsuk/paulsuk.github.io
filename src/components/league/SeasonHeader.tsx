import type { SeasonHeaderProps } from "../../api/types";
import { formatSeason } from "../../utils/records-helpers";
import SeasonPicker from "./SeasonPicker";

/** Eyebrow season label + season picker row shared by the league pages. */
export default function SeasonHeader({ slug, season, seasons, onChange, suffix = "" }: SeasonHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <p className="eyebrow">
        {season ? formatSeason(season, slug) : ""} Season{suffix}
      </p>
      <SeasonPicker seasons={seasons} selected={season} onChange={onChange} slug={slug} />
    </div>
  );
}
