// testFirebase.js
import { database } from './firebaseConfig';
import { ref, set, get, child } from "firebase/database";

// Function to write sample data
const writeSampleData = () => {
  set(ref(database, 'test/sample'), {
    message: 'Hello, Firebase!',
    timestamp: Date.now(),
  })
  .then(() => console.log('Data written successfully'))
  .catch((error) => console.error('Error writing data:', error));
};

// Function to read sample data
const readSampleData = async () => {
  const dbRef = ref(database);
  try {
    const snapshot = await get(child(dbRef, 'test/sample'));
    if (snapshot.exists()) {
      console.log('Data read successfully:', snapshot.val());
    } else {
      console.log('No data available');
    }
  } catch (error) {
    console.error('Error reading data:', error);
  }
};

// Execute the functions to test connectivity
writeSampleData();
readSampleData();
