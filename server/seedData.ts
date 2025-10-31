import { storage } from "./storage";
import type { InsertRadioStation } from "@shared/schema";

const sampleStations: InsertRadioStation[] = [
  {
    name: "SomaFM Groove Salad",
    url: "https://ice1.somafm.com/groovesalad-256-mp3",
    genre: "Ambient",
    country: "United States",
    city: "San Francisco",
    description: "A nicely chilled plate of ambient/downtempo beats and grooves",
    logoUrl: null,
    listenerCount: 6500,
    isActive: true,
  },
  {
    name: "SomaFM Drone Zone",
    url: "https://ice1.somafm.com/dronezone-128-mp3",
    genre: "Ambient",
    country: "United States",
    city: "San Francisco",
    description: "Atmospheric textures with minimal beats",
    logoUrl: null,
    listenerCount: 5000,
    isActive: true,
  },
  {
    name: "SomaFM Indie Pop Rocks!",
    url: "https://ice1.somafm.com/indiepop-128-mp3",
    genre: "Indie",
    country: "United States",
    city: "San Francisco",
    description: "New and classic indie pop",
    logoUrl: null,
    listenerCount: 3000,
    isActive: true,
  },
  {
    name: "SomaFM Deep Space One",
    url: "https://ice1.somafm.com/deepspaceone-128-mp3",
    genre: "Ambient",
    country: "United States",
    city: "San Francisco",
    description: "Deep ambient electronic and space music",
    logoUrl: null,
    listenerCount: 2800,
    isActive: true,
  },
  {
    name: "SomaFM Beat Blender",
    url: "https://ice1.somafm.com/beatblender-128-mp3",
    genre: "Electronic",
    country: "United States",
    city: "San Francisco",
    description: "A late night blend of deep-house and downtempo chill",
    logoUrl: null,
    listenerCount: 4200,
    isActive: true,
  },
  {
    name: "Radio Swiss Jazz",
    url: "http://stream.srg-ssr.ch/m/rsj/mp3_128",
    genre: "Jazz",
    country: "Switzerland",
    city: "Zurich",
    description: "The finest jazz music 24/7",
    logoUrl: null,
    listenerCount: 3500,
    isActive: true,
  },
  {
    name: "Radio Swiss Classic",
    url: "http://stream.srg-ssr.ch/m/rsc_de/mp3_128",
    genre: "Classical",
    country: "Switzerland",
    city: "Zurich",
    description: "Classical music without interruption",
    logoUrl: null,
    listenerCount: 4100,
    isActive: true,
  },
  {
    name: "KEXP 90.3 FM",
    url: "https://kexp-mp3-128.streamguys1.com/kexp128.mp3",
    genre: "Alternative",
    country: "United States",
    city: "Seattle",
    description: "Where the music matters - eclectic music discovery",
    logoUrl: null,
    listenerCount: 8900,
    isActive: true,
  },
  {
    name: "NTS Radio 1",
    url: "https://stream-relay-geo.ntslive.net/stream",
    genre: "Electronic",
    country: "United Kingdom",
    city: "London",
    description: "Cutting-edge music and culture from around the world",
    logoUrl: null,
    listenerCount: 7200,
    isActive: true,
  },
  {
    name: "Radio Paradise",
    url: "http://stream.radioparadise.com/aac-320",
    genre: "Eclectic",
    country: "United States",
    city: "Paradise",
    description: "Eclectic online rock radio",
    logoUrl: null,
    listenerCount: 12000,
    isActive: true,
  },
];

export async function seedRadioStations() {
  try {
    console.log("Seeding radio stations...");
    
    // Get existing stations
    const existingStations = await storage.getRadioStations();
    const existingUrls = new Set(existingStations.map(s => s.url));
    
    // Only create stations that don't already exist
    let createdCount = 0;
    for (const station of sampleStations) {
      if (!existingUrls.has(station.url)) {
        await storage.createRadioStation(station);
        createdCount++;
      }
    }

    if (createdCount > 0) {
      console.log(`Successfully seeded ${createdCount} new radio stations`);
    } else {
      console.log("All sample stations already exist, skipping seed");
    }
  } catch (error) {
    console.error("Error seeding radio stations:", error);
  }
}

export async function seedDummyUser() {
  try {
    console.log("Seeding dummy user...");
    const dummyUser = {
      id: "dummy_user_id",
      email: "dummy@example.com",
      firstName: "Dummy",
      lastName: "User",
      profileImageUrl: null,
    };
    await storage.upsertUser(dummyUser);
    console.log("Dummy user seeded successfully.");
  } catch (error) {
    console.error("Error seeding dummy user:", error);
  }
}