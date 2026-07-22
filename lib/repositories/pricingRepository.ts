import { getDb, PricingConfig } from "../db";

export async function getPricingConfig(): Promise<PricingConfig> {
  const db = await getDb();
  return db.data.pricingConfig;
}

export async function updatePricingConfig(patch: Partial<PricingConfig>): Promise<PricingConfig> {
  const db = await getDb();
  Object.assign(db.data.pricingConfig, patch, { updatedAt: new Date().toISOString() });
  await db.write();
  return db.data.pricingConfig;
}
