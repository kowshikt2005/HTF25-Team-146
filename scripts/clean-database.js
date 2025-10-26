const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env.local' });

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/collab-workspace');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Clean all collections but keep the structure
async function cleanDatabase() {
  try {
    console.log('🧹 Starting database cleanup...');
    
    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    console.log(`📋 Found ${collections.length} collections:`);
    collections.forEach(col => console.log(`   - ${col.name}`));
    
    // Clear each collection
    for (const collection of collections) {
      const collectionName = collection.name;
      const result = await mongoose.connection.db.collection(collectionName).deleteMany({});
      console.log(`🗑️  Cleared ${collectionName}: ${result.deletedCount} documents removed`);
    }
    
    console.log('\n✅ Database cleanup completed!');
    console.log('📝 Collections preserved with their schemas');
    console.log('🔄 You can now register new users and create fresh data');
    
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
  }
}

// Main execution
async function main() {
  await connectDB();
  await cleanDatabase();
  
  console.log('\n🎯 Next steps:');
  console.log('1. Start your server: node server/index.js');
  console.log('2. Start your frontend: npm run dev');
  console.log('3. Register new users at /auth/register');
  
  await mongoose.connection.close();
  console.log('🔌 Database connection closed');
}

// Run the script
main().catch(console.error);