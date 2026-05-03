import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const paymentSettingsTable = pgTable("payment_settings", {
  id: serial("id").primaryKey(),
  jazzcashNumber: text("jazzcash_number").default(""),
  jazzcashName: text("jazzcash_name").default(""),
  easypaisaNumber: text("easypaisa_number").default(""),
  easypaisaName: text("easypaisa_name").default(""),
  bankName: text("bank_name").default(""),
  bankAccountNumber: text("bank_account_number").default(""),
  bankAccountName: text("bank_account_name").default(""),
  bankIban: text("bank_iban").default(""),
  whatsappNumber: text("whatsapp_number").default(""),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type PaymentSettings = typeof paymentSettingsTable.$inferSelect;
