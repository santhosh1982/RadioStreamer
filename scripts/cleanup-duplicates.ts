import 'dotenv/config';
import { storage } from "../server/storage";

async function cleanupDuplicates() {
  try {
    console.log("Starting cleanup of duplicate radio stations...");
    
    // Get all stations to see current state
    const allStations = await storage.getRadioStations();
    console.log(`Found ${allStations.length} total stations in database`);
    
    // Remove duplicates
    const deletedCount = await storage.removeDuplicateRadioStations();
    
    // Get updated count
    const remainingStations = await storage.getRadioStations();
    console.log(`Cleanup complete. Removed ${deletedCount} duplicates.`);
    console.log(`${remainingStations.length} stations remaining in database`);
    
    // Show remaining stations
    console.log("\nRemaining stations:");
    remainingStations.forEach((station, index) => {
      console.log(`${index + 1}. ${station.name} (${station.genre}) - ${station.url}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error("Error during cleanup:", error);
    process.exit(1);
  }
}

cleanupDuplicates();