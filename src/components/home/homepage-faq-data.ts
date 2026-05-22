export interface FaqEntity {
  question: string;
  answer: string;
}

export const HOMEPAGE_FAQ: FaqEntity[] = [
  {
    question: "Is this Google-policy compliant? I've heard about review gating.",
    answer:
      "Yes. The public Google review link is visible on every screen, including the private feedback path. We never block any customer from leaving a public review — we just route them to the right place based on their rating.",
  },
  {
    question: "Who is FreddyBeach for?",
    answer:
      "Atlantic Canada small businesses: trades, dentists, auto repair, home services, restaurants, retail — anyone whose reputation lives on Google reviews and who doesn't have time to build review-request workflows from scratch.",
  },
  {
    question: "What happens if a customer leaves negative feedback?",
    answer:
      "It comes straight to your inbox as private feedback, not to your public Google profile. You see what went wrong, you can fix it, and you can choose to follow up with the customer directly.",
  },
  {
    question: "What's free vs paid?",
    answer:
      "The Review Collector is free for pilot businesses we're working with directly. Other AI tools (image generation, social posts, review replies) are available to all signed-up users. Paid tiers add higher generation limits and featured directory placement.",
  },
  {
    question: "Can I use my regular Gmail for sending review requests?",
    answer:
      "Yes. Requests are sent from FreddyBeach on your behalf using your business's branding, so you don't need to configure SMTP or connect a Gmail account.",
  },
];

export function getHomepageFaqEntities() {
  return HOMEPAGE_FAQ.map((qa) => ({
    "@type": "Question",
    name: qa.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: qa.answer,
    },
  }));
}
