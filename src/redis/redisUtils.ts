import Redis, { RedisOptions } from 'ioredis';
import  {serverConfig}  from '../config/server.config';

const portNumber: number = parseInt(serverConfig.redis.port || '6379', 10);

const redisOptions: RedisOptions = {
  port: portNumber,
  host: serverConfig.redis.host || 'localhost',
  password: serverConfig.redis.password || undefined,
  connectTimeout: 10000,
};
export const redisClient = new Redis(redisOptions);

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