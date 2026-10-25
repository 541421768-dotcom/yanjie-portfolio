import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const portfolio = sqliteTable('portfolio', {
 id: integer('id').primaryKey(),
 data: text('data').notNull(),
 revision: integer('revision').notNull().default(0),
 updatedBy: text('updated_by').notNull(),
 updatedAt: text('updated_at').notNull(),
});
export const siteIntro = sqliteTable('site_intro', {
 id: integer('id').primaryKey(),
 data: text('data').notNull(),
 revision: integer('revision').notNull().default(0),
 updatedBy: text('updated_by').notNull(),
 updatedAt: text('updated_at').notNull(),
});

export const siteFooter = sqliteTable('site_footer', {
 id: integer('id').primaryKey(), data: text('data').notNull(),
 revision: integer('revision').notNull().default(0),
 updatedBy: text('updated_by').notNull(), updatedAt: text('updated_at').notNull(),
});
