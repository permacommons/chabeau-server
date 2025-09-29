const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};

// Usage
fetchData('https://api.example.com/data')
  .then(result => {
    if (result) {
      console.log('Data received:', result);
    } else {
      console.log('Failed to fetch data');
    }
  });