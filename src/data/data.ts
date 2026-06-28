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
      "Directed daily operations and provided ongoing support to team members, enhancing their skills and performance through effective coaching and problem-solving.",
      "Successfully managed multiple challenging Performance Improvement Plan cases, resulting in a significant increase in the quality and volume of work produced by the Support Engineers involved.",
      "Personally handled escalated customer inquiries, ensuring complex issues were resolved promptly and to the customer's satisfaction.",
      "Continuously analyzed and optimized support processes and workflows to increase efficiency and improve customer service metrics.",
      "Assisted in the hiring process, from interviewing candidates to onboarding new hires.",
    ],
  },
  {
    years: "2020 - 2024",
    role: "Founder",
    company: "Elemental Beacon",
    highlights: [
      "I founded Elemental Beacon and currently manage a team of 3 people, selling products inspired by Dungeons & Dragons, such as 3D printed miniatures, clothing items, accessories, events, workshops, and live sessions.",
      "Lead and support the entire team, ensuring their well-being and professional development to ensure the success of our company and products.",
      "Directed the creation, setup, and successful execution of several live events online and in-person with customers from EU, teaching them about Dungeons & Dragons and hosting live gaming sessions. One such event is DnD Day in 2022 (https://dndday.com).",
      "Regularly manage the advertising, marketing, and finance of Elemental Beacon, in addition to the website technical management with WordPress and WooCommerce at https://elementalbeacon.com.",
    ],
    hideOnIndex: true,
  },
  {
    years: "2014 - 2022",
    role: "WP.com & Woo Support",
    company: "Automattic Inc. & WooThemes",
    highlights: [
      "Demonstrated a strong commitment to customer satisfaction, leveraging excellent customer service skills.",
      "Developed, maintained, and improved the Zendesk support system for all Automattic divisions, including initial creation and documentation for future administrators, over a 5-year period.",
      "Served as a successful leader for the Woo Atari and WordPress.com Horizon support teams, mentoring and guiding team members to achieve their short and long-term goals, and continuously developing their skills as Support Engineers.",
    ],
  },
  {
    years: "2014 - 2014",
    role: "Project Manager & WP Dev",
    company: "ECom Lucera",
    highlights: [
      "Developed themes and plugins for WordPress and WooCommerce, and of the entire infrastructure to support our customers and employees.",
      "Successfully handled the hiring aspect of new developers and designers to expand our young team. In addition to this, I also directed the newly formed team in order to achieve a strong presence online and to create quality products for the WordPress community.",
    ],
    hideOnIndex: true,
  },
  {
    years: "2012 - 2014",
    role: "Support & WP Dev",
    company: "YITH",
    highlights: [
      "Developed and launched themes for WooCommerce on ThemeForest in a team of four developers.",
      "Provided outstanding technical support to customers of YIThemes via Zendesk, ThemeForest, forums, and social networks.",
      "Wrote and published several articles and documents for our products in order to proactively help our self-serving customers.",
      "In order to expand our team, I was part of the hiring team to define the skills of applicants, and to train them for their success in the role.",
    ],
  },
  {
    years: "2010 - 2012",
    role: "Web Dev",
    company: "Freelance",
    highlights: ["Websites development and management for local businesses."],
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
