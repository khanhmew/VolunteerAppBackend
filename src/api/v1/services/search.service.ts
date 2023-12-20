import { serverConfig } from "../../../config/server.config";

const { Client } = require('@elastic/elasticsearch');

// Thay đổi URL và các cài đặt khác tùy thuộc vào yêu cầu của bạn
export const elasticClient = new Client(serverConfig.esclient);
  
export const search = async(query: any, defaultField = '*') => {
    const indeces = ['search-volunteer-be', 'search-volunteer']
    try {
        const result = await elasticClient.search({
          index: indeces,
          body: {
            query: {
              query_string: {
                query: query,
                default_field: defaultField,
              },
            },
          },
        });
    
        if (result.hits) {
          return result.hits.hits;
        } else {
          console.error('Unexpected Elasticsearch response:', result);
          throw new Error('Search failed');
        }
      } catch (error) {
        console.error('Error:', error);
        throw new Error('Search failed');
      }
}
module.exports = {
    search
};
