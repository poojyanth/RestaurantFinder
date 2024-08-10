const fs = require('fs');
const csv = require('csv-parser');
const { MongoClient } = require('mongodb');

// MongoDB Atlas connection string
const uri = 'mongodb+srv://poojyanth2004:projectfotoflask@cluster0.q3pe61c.mongodb.net/Fotoflask';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const csvFilePath = 'src/scripts/zomato.csv';  // Replace with your CSV file path
const dbName = 'zomatoData';  // Replace with your database name
const collectionName = 'restaurants';  // Replace with your collection name

async function uploadCSVtoMongo() {
  try {
    // Connect to MongoDB Atlas
    await client.connect();
    console.log('Connected to MongoDB Atlas');

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Read and parse the CSV file
    const data = [];
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        data.push(row);
      })
      .on('end', async () => {
        console.log('CSV file successfully processed.');

        // Insert data into MongoDB
        if (data.length > 0) {
          const result = await collection.insertMany(data);
          console.log(`${result.insertedCount} documents were inserted.`);
        } else {
          console.log('No data to insert.');
        }

        // Close the connection
        await client.close();
        console.log('MongoDB connection closed.');
      });
  } catch (err) {
    console.error('Error uploading CSV to MongoDB:', err);
  }
}

uploadCSVtoMongo();
