import { products } from "./client/src/lib/store";
import { getDb } from "./server/db";
import { products as productsTable } from "./drizzle/schema";

async function seed() {
  const db = await getDb();
  if (!db) {
    console.error("Failed to connect to db");
    process.exit(1);
  }

  for (const product of products) {
    await db.insert(productsTable).values({
      slug: product.slug,
      name: product.name,
      category: product.category,
      type: product.type,
      description: product.description,
      price: product.price,
      compareAt: product.compareAt,
      badge: product.badge,
      accent: product.accent,
      imagePath: product.image ?? "",
      coverLabel: product.coverLabel,
      format: product.format,
      included: JSON.stringify(product.included),
      forWho: product.forWho,
      active: 1
    }).onConflictDoUpdate({
      target: productsTable.slug,
      set: {
        name: product.name,
        price: product.price
      }
    });
    console.log(`Seeded ${product.slug}`);
  }
  console.log("Done");
  process.exit(0);
}

seed();
