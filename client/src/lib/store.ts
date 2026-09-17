export type Product = {
  slug: string;
  name: string;
  category: string;
  type: string;
  description: string;
  price: number;
  compareAt?: number | null;
  badge?: string | null;
  accent: string;
  image?: string | null;
  coverLabel: string;
  format: string;
  included: string[];
  forWho: string;
};

export const products: Product[] = [
  {
    slug: "weekly-reset-planner",
    name: "The Weekly Reset Planner",
    category: "Productivity",
    type: "Planner",
    description: "A calm, repeatable system for planning your week and protecting your focus.",
    price: 149,
    compareAt: 249,
    badge: "Bestseller",
    accent: "blue",
    image: "/assets/products/weekly-reset-planner.jpg?v=3",
    coverLabel: "PLAN WITH INTENTION",
    format: "PDF + GoodNotes",
    included: ["Weekly overview", "Focus planning pages", "Reflection prompts", "Undated — use anytime"],
    forWho: "Busy professionals, students and anyone who wants a lighter way to plan.",
  },
  {
    slug: "ai-workflow-starter-kit",
    name: "AI Workflow Starter Kit",
    category: "AI & Technology",
    type: "Toolkit",
    description: "Practical prompts and simple workflows to make everyday AI use more useful.",
    price: 299,
    compareAt: 499,
    badge: "New",
    accent: "navy",
    image: "/assets/products/ai-workflow-starter-kit.jpg?v=3",
    coverLabel: "WORK SMARTER",
    format: "PDF + Notion",
    included: ["50 ready-to-use prompts", "Workflow canvas", "Prompt improvement guide", "Quick-start examples"],
    forWho: "Creators, operators and curious professionals ready to use AI practically.",
  },
  {
    slug: "job-search-command-center",
    name: "Job Search Command Center",
    category: "Career & Jobs",
    type: "Template",
    description: "A focused job-search workspace for tracking applications, follow-ups and momentum.",
    price: 199,
    badge: "Popular",
    accent: "sky",
    image: "/assets/products/job-search-command-center.jpg?v=3",
    coverLabel: "MOVE FORWARD",
    format: "Notion template",
    included: ["Application tracker", "Follow-up reminders", "Role comparison board", "Interview notes"],
    forWho: "Job seekers who want clarity and a system they can actually keep using.",
  },
  {
    slug: "small-business-toolkit",
    name: "Small Business Toolkit",
    category: "Business",
    type: "Bundle",
    description: "A grounded collection of planning templates for running the important parts of a small business.",
    price: 599,
    compareAt: 899,
    badge: "Bundle",
    accent: "cream",
    image: "/assets/products/small-business-toolkit.jpg?v=3",
    coverLabel: "BUILD WITH CLARITY",
    format: "PDF + Sheets",
    included: ["Simple business planner", "Content calendar", "Offer clarity worksheet", "Monthly review pages"],
    forWho: "Solo founders and small teams who need useful structure, not more noise.",
  },
  {
    slug: "study-sprint-planner",
    name: "Study Sprint Planner",
    category: "Education & Learning",
    type: "Planner",
    description: "Turn study time into smaller, more manageable sessions with a clear next step.",
    price: 99,
    badge: "₹9 starter",
    accent: "blue",
    image: "/assets/products/study-sprint-planner.jpg?v=3",
    coverLabel: "MAKE PROGRESS",
    format: "PDF",
    included: ["Sprint planner", "Revision map", "Focus timer sheet", "Progress check-ins"],
    forWho: "Students and lifelong learners who want a practical rhythm for learning.",
  },
  {
    slug: "home-life-organizer",
    name: "Home & Life Organizer",
    category: "Home Planning",
    type: "Template",
    description: "One simple place for recurring tasks, household planning and the details that keep life moving.",
    price: 249,
    badge: "New",
    accent: "sky",
    image: "/assets/products/home-life-organizer.jpg?v=3",
    coverLabel: "MAKE SPACE",
    format: "Notion template",
    included: ["Home dashboard", "Recurring tasks", "Meal planning", "Important details vault"],
    forWho: "People who want their everyday systems to feel calmer and easier to maintain.",
  },
];

export const categories = [
  "Education & Learning",
  "AI & Technology",
  "Business",
  "Productivity",
  "Career & Jobs",
  "Personal Development",
  "Home Planning",
  "Lifestyle",
  "Templates & Checklists",
  "E-books & Guides",
  "Planners & Organizers",
  "Digital Tools"
];

export const getProduct = (slug: string) => products.find((product) => product.slug === slug);

export const formatPrice = (price: number) => `₹${price.toLocaleString("en-IN")}`;

export const getCoverClass = (accent: string) => `cover-${accent}`;



export const getProductCoverStyle = (product: Product) => ({
  backgroundImage: product.imagePath ? `url(${product.imagePath})` : undefined,
});
