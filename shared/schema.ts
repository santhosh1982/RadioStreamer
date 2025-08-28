import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User storage table - mandatory for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Radio stations
export const radioStations = pgTable("radio_stations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  url: text("url").notNull(),
  genre: text("genre").notNull(),
  country: text("country"),
  city: text("city"),
  description: text("description"),
  logoUrl: text("logo_url"),
  isActive: boolean("is_active").default(true),
  listenerCount: integer("listener_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// User recordings
export const recordings = pgTable("recordings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  stationId: varchar("station_id").references(() => radioStations.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  filename: text("filename").notNull(),
  duration: integer("duration").notNull(), // in seconds
  fileSize: integer("file_size").notNull(), // in bytes
  isActive: boolean("is_active").default(false), // true if currently recording
  createdAt: timestamp("created_at").defaultNow(),
});

// User favorites
export const favorites = pgTable("favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  stationId: varchar("station_id").notNull().references(() => radioStations.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI chat conversations
export const chatConversations = pgTable("chat_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  messages: jsonb("messages").notNull().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  recordings: many(recordings),
  favorites: many(favorites),
  chatConversations: many(chatConversations),
}));

export const radioStationsRelations = relations(radioStations, ({ many }) => ({
  recordings: many(recordings),
  favorites: many(favorites),
}));

export const recordingsRelations = relations(recordings, ({ one }) => ({
  user: one(users, {
    fields: [recordings.userId],
    references: [users.id],
  }),
  station: one(radioStations, {
    fields: [recordings.stationId],
    references: [radioStations.id],
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  station: one(radioStations, {
    fields: [favorites.stationId],
    references: [radioStations.id],
  }),
}));

export const chatConversationsRelations = relations(chatConversations, ({ one }) => ({
  user: one(users, {
    fields: [chatConversations.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertRadioStationSchema = createInsertSchema(radioStations).omit({
  id: true,
  createdAt: true,
});

export const insertRecordingSchema = createInsertSchema(recordings).omit({
  id: true,
  createdAt: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export const insertChatConversationSchema = createInsertSchema(chatConversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type RadioStation = typeof radioStations.$inferSelect;
export type InsertRadioStation = z.infer<typeof insertRadioStationSchema>;
export type Recording = typeof recordings.$inferSelect;
export type InsertRecording = z.infer<typeof insertRecordingSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type ChatConversation = typeof chatConversations.$inferSelect;
export type InsertChatConversation = z.infer<typeof insertChatConversationSchema>;
