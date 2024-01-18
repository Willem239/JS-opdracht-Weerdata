document.addEventListener('DOMContentLoaded', function() {

    class DataManager {
        constructor() {
          this.cache = new Map();
          this.defaultTTL = 3600; // Default time-to-live in seconds (1 hour)
        }
      
        async fetchData(url) {
          try {
            const response = await fetch(url);
            const data = await response.json();
            this.cache.set(url, { data, timestamp: Date.now() });
            return data;
          } catch (error) {
            console.error('Error:', error);
          }
        }
      
        async getData(url, ttl = this.defaultTTL) {
          if (this.cache.has(url)) {
            const { data, timestamp } = this.cache.get(url);
            if (Date.now() - timestamp < ttl * 1000) {
              return data;
            }
            this.cache.delete(url); // Cache has expired, remove the data
          }
          return this.fetchData(url);
        }
      
        clearCache() {
          this.cache.clear();
        }
      }
      


})