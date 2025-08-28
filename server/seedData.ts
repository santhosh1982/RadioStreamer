import { storage } from "./storage";
import type { InsertRadioStation } from "@shared/schema";

const sampleStations: InsertRadioStation[] = [
  {
    name: "Jazz FM 91.3",
    url: "https://stream.jazzfm.com/91.3",
    genre: "Jazz",
    country: "United States",
    city: "New York",
    description: "Smooth jazz and classic standards for sophisticated listeners",
    logoUrl: null,
    listenerCount: 2100,
    isActive: true,
  },
  {
    name: "Rock 101.5 FM",
    url: "https://stream.rock101.com/live",
    genre: "Rock",
    country: "United States", 
    city: "Los Angeles",
    description: "Classic rock hits from the 70s, 80s, and 90s",
    logoUrl: null,
    listenerCount: 5800,
    isActive: true,
  },
  {
    name: "NPR News",
    url: "https://npr-ice.streamguys1.com/live.mp3",
    genre: "News",
    country: "United States",
    city: "Washington DC",
    description: "National public radio with in-depth news and analysis",
    logoUrl: null,
    listenerCount: 12400,
    isActive: true,
  },
  {
    name: "Classical WQXR",
    url: "https://stream.wqxr.org/wqxr",
    genre: "Classical",
    country: "United States",
    city: "New York",
    description: "World-class classical music and cultural programming",
    logoUrl: null,
    listenerCount: 3200,
    isActive: true,
  },
  {
    name: "Alt Rock 105",
    url: "https://altrock105.streamurl.com/live",
    genre: "Alternative",
    country: "United States",
    city: "Seattle",
    description: "Alternative rock and indie music from emerging artists",
    logoUrl: null,
    listenerCount: 4100,
    isActive: true,
  },
  {
    name: "Electronic Mix",
    url: "https://electronicmix.stream.com/live",
    genre: "Electronic",
    country: "United Kingdom",
    city: "London",
    description: "Electronic dance music and ambient soundscapes",
    logoUrl: null,
    listenerCount: 7900,
    isActive: true,
  },
  {
    name: "BBC Radio 1",
    url: "https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one",
    genre: "Pop",
    country: "United Kingdom",
    city: "London",
    description: "The UK's most popular radio station for current music",
    logoUrl: null,
    listenerCount: 15600,
    isActive: true,
  },
  {
    name: "Radio France Culture",
    url: "https://direct.franceinter.fr/live/franceculture-midfi.mp3",
    genre: "Culture",
    country: "France",
    city: "Paris",
    description: "French cultural programming and intellectual discussions",
    logoUrl: null,
    listenerCount: 2800,
    isActive: true,
  },
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
    name: "Country 95.5",
    url: "https://country955.streamhost.com/live",
    genre: "Country",
    country: "United States",
    city: "Nashville",
    description: "Today's country hits and classic favorites",
    logoUrl: null,
    listenerCount: 4700,
    isActive: true,
  },
  {
    name: "Hip Hop 94.7",
    url: "https://hiphop947.stream.com/live",
    genre: "Hip Hop",
    country: "United States",
    city: "Atlanta",
    description: "The hottest hip hop and R&B music",
    logoUrl: null,
    listenerCount: 8900,
    isActive: true,
  },
  {
    name: "Reggae Vibes",
    url: "https://reggaevibes.streamcast.com/live",
    genre: "Reggae",
    country: "Jamaica",
    city: "Kingston",
    description: "Classic and modern reggae from the heart of Jamaica",
    logoUrl: null,
    listenerCount: 3600,
    isActive: true,
  },
];

export async function seedRadioStations() {
  try {
    console.log("Seeding radio stations...");
    
    // Check if stations already exist
    const existingStations = await storage.getRadioStations();
    
    if (existingStations.length > 0) {
      console.log(`Found ${existingStations.length} existing stations, skipping seed`);
      return;
    }

    // Create sample stations
    for (const station of sampleStations) {
      await storage.createRadioStation(station);
    }

    console.log(`Successfully seeded ${sampleStations.length} radio stations`);
  } catch (error) {
    console.error("Error seeding radio stations:", error);
  }
}
