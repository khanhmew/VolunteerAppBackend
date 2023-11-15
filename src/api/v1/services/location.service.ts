import axios from "axios";


export async function getLocationFromAddress(address: any) {
    try {
      const encodedAddress = encodeURIComponent(address);
      const apiUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}`;
      
      const response = await axios.get(apiUrl);
  
      if (response.data && response.data.length > 0) {
        const location = {
          type: 'Point',
          coordinates: [parseFloat(response.data[0].lon), parseFloat(response.data[0].lat)],
        };
  
        return location;
      } else {
        throw new Error('Location not found');
      }
    } catch (error) {
      console.error('Error getting location from address:', error);
      throw error;
    }
  }