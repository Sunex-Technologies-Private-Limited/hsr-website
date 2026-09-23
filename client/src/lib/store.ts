export type Product = {
  id?: number;
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
  imagePath?: string | null;
  coverLabel: string;
  format: string;
  included: string[] | string;
  forWho: string;
  active?: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export const products: Product[] = [
  {
    slug: "education-and-learning",
    name: "Education & Learning Resources",
    category: "Education & Learning",
    type: "Education",
    description: "Practical learning resources designed to simplify concepts and build useful knowledge and skills. Learn at your own pace with structured, easy-to-understand content.",
    price: 199,
    imagePath: "/assets/products/education-and-learning.jpg",
    accent: "blue",
    coverLabel: "LEARN DAILY",
    format: "PDF + Course",
    included: ["Structured lessons", "Practice exercises", "Concept guides"],
    forWho: "Students and lifelong learners.",
  },
  {
    slug: "chemical-free-beauty-tips",
    name: "Chemical Free Beauty Tips",
    category: "Life Style",
    type: "Guide",
    description: "A comprehensive guide to transitioning to a natural, chemical-free beauty routine. Discover effective, plant-based alternatives for glowing skin and healthy hair without toxins.",
    price: 299,
    imagePath: "/assets/products/chemical-free-beauty-tips.jpg",
    accent: "sage",
    coverLabel: "NATURAL BEAUTY",
    format: "Digital Guide",
    included: ["Ingredient directory", "DIY recipes", "Daily routines"],
    forWho: "Anyone looking for a natural approach to personal care.",
  },
  {
    slug: "ai-productivity-prompt-pack",
    name: "AI Productivity Prompt Pack",
    category: "AI Productivity Prompt Pack",
    type: "Tool",
    description: "A curated collection of highly effective AI prompts designed to streamline your workflow, automate repetitive tasks, and unlock new levels of efficiency in your daily work.",
    price: 499,
    imagePath: "/assets/products/ai-productivity-prompt-pack.jpg",
    accent: "slate",
    coverLabel: "WORK SMARTER",
    format: "Prompt Library",
    included: ["100+ tested prompts", "Categorized by use case", "Integration tips"],
    forWho: "Professionals, creators, and anyone wanting to leverage AI.",
  },
  {
    slug: "homebuild-a-z",
    name: "HomeBuild A-Z",
    category: "HomeBuild A-Z",
    type: "Infrastructure",
    description: "A complete guide covering the home-building journey from planning and budgeting to construction, finishing, and handover. Get practical knowledge to plan better, control costs, and build with confidence.",
    price: 999,
    imagePath: "/assets/products/homebuild-a-z.jpg",
    badge: "Coming Soon",
    accent: "sky",
    coverLabel: "BUILD SMART",
    format: "PDF Guide",
    included: ["Planning checklists", "Budget templates", "Construction milestones"],
    forWho: "Future homeowners and self-builders.",
  },
];

export const categories = [
  "Education & Learning",
  "Life Style",
  "AI Productivity Prompt Pack",
  "HomeBuild A-Z"
];

export const getProduct = (slug: string) => products.find((product) => product.slug === slug);

export const formatPrice = (price: number) => `₹${price.toLocaleString("en-IN")}`;

export const getCoverClass = (accent: string) => `cover-${accent}`;



export const getProductCoverStyle = (product: Product) => ({
  backgroundImage: product.imagePath ? `url(${product.imagePath})` : undefined,
});
