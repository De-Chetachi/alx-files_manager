#!/usr/bin/env node
import { createClient } from "redis";

class RedisClient {
    constructor() {
        this.client = createClient();
        this.client.on("error", (error) => {
            console.error(error);
        });
    }

    isAlive() {
        return this.client.connected;
    }

    async get(key) {
        return new Promise((resolve, reject) => {
            this.client.get(key, (err, reply) => {
                if (err) reject(err);
                resolve(reply);
            });
        });
    }

    async set(key, value, duration) {
        return new Promise((resolve, reject) => {
            this.client.setex(key, duration, value, (err, reply) => {
                if (err) reject(err);
                resolve(reply);
            });
        });
    }

    async del(key) {
        return new Promise((resolve, reject) => {
            this.client.del(key, (err, reply) => {
                if (err) reject(err);
                resolve(reply);
            });
        });
    }
}

const redisClient = new RedisClient();

//redisClient.client.connect();

export default redisClient;