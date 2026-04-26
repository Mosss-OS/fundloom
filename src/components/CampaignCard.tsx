import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { formatUSD, daysLeft, progress } from "@/lib/format";

import sample1 from "@/assets/sample-campaign-1.jpg";
import sample2 from "@/assets/sample-campaign-2.jpg";
import sample3 from "@/assets/sample-campaign-3.jpg";

const fallbacks = [sample1, sample2, sample3];

export type CampaignCardData = {
  id: string;
  title: string;
  description: string;
  goal_amount: number | string;
  amount_raised: number | string;
  deadline: string;
  cover_image_url: string | null;
};

export function CampaignCard({
  campaign,
  index = 0,
}: {
  campaign: CampaignCardData;
  index?: number;
}) {
  const cover = campaign.cover_image_url || fallbacks[index % fallbacks.length];
  const pct = progress(campaign.amount_raised, campaign.goal_amount);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to="/c/$id"
        params={{ id: campaign.id }}
        className="group block overflow-hidden rounded-3xl bg-paper hairline transition hover:shadow-[var(--shadow-lift)]"
      >
        <div className="aspect-[5/3] overflow-hidden">
          <img
            src={cover}
            alt={campaign.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
          />
        </div>
        <div className="p-5 sm:p-6">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="line-clamp-1 font-display text-xl text-ink">
              {campaign.title}
            </h3>
            <span className="shrink-0 text-xs text-ink-soft">{daysLeft(campaign.deadline)}</span>
          </div>
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-soft">
            {campaign.description}
          </p>

          <div className="mt-5">
            <div className="h-1 w-full overflow-hidden rounded-full bg-line">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${pct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full bg-forest"
              />
            </div>
            <div className="mt-2 flex items-baseline justify-between text-sm">
              <span className="text-ink">
                {formatUSD(campaign.amount_raised)}{" "}
                <span className="text-ink-soft">raised</span>
              </span>
              <span className="text-ink-soft">of {formatUSD(campaign.goal_amount)}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}