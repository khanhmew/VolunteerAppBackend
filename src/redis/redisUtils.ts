import Redis from 'ioredis';

const redisClient = new Redis({
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

export const hasUserLikedPost = (postId: string, userId: string) => {
  return redisClient.sismember(`post_likes:${postId}`, userId);
};
