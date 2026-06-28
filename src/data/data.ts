export interface Job {
  years: string;
  role: string;
  company: string;
  highlights?: string[];
  hideOnIndex?: boolean;
}

export interface Stat {
  count: string;
  description: string;
}

export const jobs = [
  {
    years: "2022 - Today",
    role: "Support Team Lead",
    company: "Automattic Inc.",
    highlights: [
      "Lead a support team day to day — coaching support agents, unblocking them, and helping them actually grow.",
      "Took on complex Performance Improvement Plan cases and turned several around, with real jumps in both quality and output.",
      "Handle the escalations no one else wants — the high-stakes tickets where the customer relationship is on the line.",
      "Create, update, and maintain our processes and workflows so the team moves faster and the metrics follow.",
      "Help hire and onboard new engineers, from interviews to getting them up to speed.",
    ],
  },
  {
    years: "2020 - 2024",
    role: "Founder",
    company: "Elemental Beacon",
    highlights: [
      "Founded Elemental Beacon and run a team of three, selling D&D-inspired things — 3D-printed minis, clothing, accessories — plus events, workshops, and live sessions.",
      "Lead the team day to day; their well-being and growth is what keeps the whole thing working.",
      "Built and ran live events across the EU, online and in person — teaching D&D and hosting games, including DnD Day 2022 in Bucharest, Romania.",
      "Handle the marketing and technical sides too: ads, marketing, finances, and keeping the WordPress + WooCommerce site running.",
    ],
    hideOnIndex: true,
  },
  {
    years: "2014 - 2022",
    role: "WP.com & Woo Support",
    company: "Automattic Inc. & WooThemes",
    highlights: [
      "Spent years on the front line of support, with customer satisfaction as the entire point.",
      "Built and ran the Zendesk setup for every Automattic division — from scratch, documented so the next admins weren't lost — over about five years.",
      "Took the interim lead position for a Woo support team for a few months, mentoring engineers and helping them level up.",
    ],
  },
  {
    years: "2014 - 2014",
    role: "Project Manager & WP Dev",
    company: "ECom Lucera",
    highlights: [
      "Built themes and plugins for WordPress and WooCommerce, plus the infrastructure behind our customers and team.",
      "Hired developers and designers and led the new team toward quality products and presence in the WordPress community.",
    ],
    hideOnIndex: true,
  },
  {
    years: "2012 - 2014",
    role: "Support & WP Dev",
    company: "YITH",
    highlights: [
      "Built and shipped WooCommerce themes on ThemeForest as part of a four-person dev team.",
      "Handled technical support for YIThemes customers across Zendesk, ThemeForest, forums, and social.",
      "Wrote documentation and articles for customers' self-help.",
      "Helped hire and train new teammates as we grew.",
    ],
  },
  {
    years: "2010 - 2012",
    role: "Web Dev",
    company: "Freelance",
    highlights: ["Built and maintained websites for local businesses."],
  },
];

export const stats = [
  {
    count: "15+",
    description: "years in support & web development",
  },
  {
    count: "54k+",
    description: "tickets & chats answered",
  },
  {
    count: "10+",
    description: "teams & projects managed",
  },
  {
    count: "25+",
    description: "team members coached",
  },
  {
    count: "150+",
    description: "articles & essays written",
  },
];
