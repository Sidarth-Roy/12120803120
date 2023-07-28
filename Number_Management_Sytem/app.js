const express = require('express');
const axios = require('axios');

const app = express();
const port = 8008;

// Helper function to merge and sort unique integers
function mergeAndSortNumbers(arrays) {
  const mergedArray = [].concat(...arrays);
  const uniqueNumbers = Array.from(new Set(mergedArray));
  return uniqueNumbers.sort((a, b) => a - b);
}

app.get('/numbers', async (req, res) => {
  const urls = req.query.url;

  if (!urls) {
    return res.status(400).json({ error: 'Invalid or missing query parameter "url"' });
  }

  // Convert to an array if a single URL is provided as a non-array value
  const urlsArray = Array.isArray(urls) ? urls : [urls.toString()];

  const validResponses = [];

  // Helper function to handle each request
  async function handleRequest(urlString) {
    try {
      const response = await axios.get(urlString);
      if (response.data && Array.isArray(response.data.Numbers)) {
        validResponses.push(response.data.Numbers);
      } else {
        console.error(`Invalid response from URL ${urlString}:`, response.data);
      }
    } catch (error) {
      console.error(`Error fetching URL ${urlString}: ${error.message}`);
    }
  }

  // Fetch data from each URL sequentially using async/await
  for (const urlString of urlsArray) {
    await handleRequest(urlString);
  }

  // Merge and sort unique numbers from valid responses
  const mergedNumbers = mergeAndSortNumbers(validResponses);

  return res.json({ numbers: mergedNumbers });
});

app.listen(port, () => {
  console.log(`number-management-service is running on http://localhost:${port}`);
});
