// Simple manual database cleaner
// Run with: node manual-clean.js

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function manualClean() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('Found collections:', collections.map(c => c.name));
    
    // Ask user which collections to clean
    console.log('\nCleaning all collections...');
    
    for (const collection of collections) {
      const result = await db.collection(collection.name).deleteMany({});
      console.log(`Cleared ${collection.name}: ${result.deletedCount} documents`);
    }
    
    console.log('\nDatabase cleaned successfully!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

manualClean();