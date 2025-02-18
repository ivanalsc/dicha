export const fetchPlaces = async (query: string) => {
    if (!query) return [];
  
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10`
      );
  
      if (!res.ok) {
        throw new Error('Error en la solicitud: ' + res.statusText);
      }
  
      const data = await res.json();
      return data.map((place: any) => ({
        label: place.display_name,
        value: place.display_name,
        lat: place.lat,
        lon: place.lon,
      }));
    } catch (error) {
      console.error('Error fetching places:', error);
      return [];
    }
  };
  