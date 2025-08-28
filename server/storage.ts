import {
  users,
  radioStations,
  recordings,
  favorites,
  chatConversations,
  type User,
  type UpsertUser,
  type RadioStation,
  type InsertRadioStation,
  type Recording,
  type InsertRecording,
  type Favorite,
  type InsertFavorite,
  type ChatConversation,
  type InsertChatConversation,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Radio station operations
  getRadioStations(): Promise<RadioStation[]>;
  getRadioStationsByGenre(genre: string): Promise<RadioStation[]>;
  createRadioStation(station: InsertRadioStation): Promise<RadioStation>;
  updateRadioStation(id: string, updates: Partial<InsertRadioStation>): Promise<RadioStation>;
  
  // Recording operations
  getUserRecordings(userId: string): Promise<Recording[]>;
  getActiveRecordings(userId: string): Promise<Recording[]>;
  createRecording(recording: InsertRecording): Promise<Recording>;
  updateRecording(id: string, updates: Partial<InsertRecording>): Promise<Recording>;
  deleteRecording(id: string): Promise<void>;
  
  // Favorite operations
  getUserFavorites(userId: string): Promise<(Favorite & { station: RadioStation })[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: string, stationId: string): Promise<void>;
  isFavorite(userId: string, stationId: string): Promise<boolean>;
  
  // Chat operations
  getUserChatConversations(userId: string): Promise<ChatConversation[]>;
  createChatConversation(conversation: InsertChatConversation): Promise<ChatConversation>;
  updateChatConversation(id: string, updates: Partial<InsertChatConversation>): Promise<ChatConversation>;
}

export class DatabaseStorage implements IStorage {
  // User operations - mandatory for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Radio station operations
  async getRadioStations(): Promise<RadioStation[]> {
    return await db
      .select()
      .from(radioStations)
      .where(eq(radioStations.isActive, true))
      .orderBy(desc(radioStations.listenerCount));
  }

  async getRadioStationsByGenre(genre: string): Promise<RadioStation[]> {
    return await db
      .select()
      .from(radioStations)
      .where(and(eq(radioStations.genre, genre), eq(radioStations.isActive, true)))
      .orderBy(desc(radioStations.listenerCount));
  }

  async createRadioStation(station: InsertRadioStation): Promise<RadioStation> {
    const [newStation] = await db
      .insert(radioStations)
      .values(station)
      .returning();
    return newStation;
  }

  async updateRadioStation(id: string, updates: Partial<InsertRadioStation>): Promise<RadioStation> {
    const [updatedStation] = await db
      .update(radioStations)
      .set(updates)
      .where(eq(radioStations.id, id))
      .returning();
    return updatedStation;
  }

  // Recording operations
  async getUserRecordings(userId: string): Promise<Recording[]> {
    return await db
      .select()
      .from(recordings)
      .where(eq(recordings.userId, userId))
      .orderBy(desc(recordings.createdAt));
  }

  async getActiveRecordings(userId: string): Promise<Recording[]> {
    return await db
      .select()
      .from(recordings)
      .where(and(eq(recordings.userId, userId), eq(recordings.isActive, true)))
      .orderBy(desc(recordings.createdAt));
  }

  async createRecording(recording: InsertRecording): Promise<Recording> {
    const [newRecording] = await db
      .insert(recordings)
      .values(recording)
      .returning();
    return newRecording;
  }

  async updateRecording(id: string, updates: Partial<InsertRecording>): Promise<Recording> {
    const [updatedRecording] = await db
      .update(recordings)
      .set(updates)
      .where(eq(recordings.id, id))
      .returning();
    return updatedRecording;
  }

  async deleteRecording(id: string): Promise<void> {
    await db.delete(recordings).where(eq(recordings.id, id));
  }

  // Favorite operations
  async getUserFavorites(userId: string): Promise<(Favorite & { station: RadioStation })[]> {
    return await db
      .select({
        id: favorites.id,
        userId: favorites.userId,
        stationId: favorites.stationId,
        createdAt: favorites.createdAt,
        station: radioStations,
      })
      .from(favorites)
      .innerJoin(radioStations, eq(favorites.stationId, radioStations.id))
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt));
  }

  async addFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const [newFavorite] = await db
      .insert(favorites)
      .values(favorite)
      .returning();
    return newFavorite;
  }

  async removeFavorite(userId: string, stationId: string): Promise<void> {
    await db
      .delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.stationId, stationId)));
  }

  async isFavorite(userId: string, stationId: string): Promise<boolean> {
    const [favorite] = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.stationId, stationId)));
    return !!favorite;
  }

  // Chat operations
  async getUserChatConversations(userId: string): Promise<ChatConversation[]> {
    return await db
      .select()
      .from(chatConversations)
      .where(eq(chatConversations.userId, userId))
      .orderBy(desc(chatConversations.updatedAt));
  }

  async createChatConversation(conversation: InsertChatConversation): Promise<ChatConversation> {
    const [newConversation] = await db
      .insert(chatConversations)
      .values(conversation)
      .returning();
    return newConversation;
  }

  async updateChatConversation(id: string, updates: Partial<InsertChatConversation>): Promise<ChatConversation> {
    const [updatedConversation] = await db
      .update(chatConversations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(chatConversations.id, id))
      .returning();
    return updatedConversation;
  }
}

export const storage = new DatabaseStorage();
