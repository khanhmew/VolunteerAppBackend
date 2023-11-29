import Redis from 'ioredis';

export const redisClient = new Redis({
  port: 12586,
  host: 'redis-12586.c244.us-east-1-2.ec2.cloud.redislabs.com',
  password: 'h0StMgZf2IilbJnKH0gmwYkgQuLET8x4',
  connectTimeout: 10000
});

export const saveLikeForPost = (postId: string, userId: string) => {
  return redisClient.sadd(`post_likes:${postId}`, userId);
};

export const getTotalLikesForPost = (postId: string) => {
  return redisClient.smembers(`post_likes:${postId}`);
};

export const unlikeForPost = (postId: string, userId: string) => {
  return redisClient.srem(`post_likes:${postId}`, userId);
};

export const hasUserLikedPost = (postId: any, userId: string) => {
  return redisClient.sismember(`post_likes:${postId}`, userId);
};

//#region POST cache
const CACHE_EXPIRY_SECONDS = 1800 // 30 phút 
export const getCache = async (key: string): Promise<any | null> => {
  const cachedData = await redisClient.get(key);
  return cachedData ? JSON.parse(cachedData) : null;
};

export const updateCache = async (key: string, data: any): Promise<void> => {
  await redisClient.setex(key, CACHE_EXPIRY_SECONDS, JSON.stringify(data));
};

export const cacheAllPosts = async (_posts: any): Promise<void> => {
  await redisClient.setex('all_posts', CACHE_EXPIRY_SECONDS, JSON.stringify(_posts));
};

//#endregion POST cache




//#region JOIN cache
//#endregion