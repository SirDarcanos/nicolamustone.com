export interface Job {
  years: string;
  role: string;
  company: string;
  description?: string;
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
    description: "",
  },
  {
    years: "2014 - 2022",
    role: "WP.com & Woo Support",
    company: "Automattic Inc. & WooThemes",
    description: "",
  },
  {
    years: "2012 - 2014",
    role: "Support & WP Dev",
    company: "YITH",
    description: "",
  },
  {
    years: "2010 - 2012",
    role: "Web Dev",
    company: "Freelance",
    description: "",
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
