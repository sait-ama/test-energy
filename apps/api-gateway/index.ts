import cors from "@fastify/cors";
import fastifyHttpProxy from "@fastify/http-proxy";
import { config } from "dotenv";
import Fastify from "fastify";

config();

const gateway = Fastify({ logger: true });

gateway.register(cors, {
  origin: true,
  credentials: true,
});

gateway.register(fastifyHttpProxy, {
  upstream: process.env.BACKEND_API_URL!,
  prefix: "/api",
  rewritePrefix: "/api",
  disableCache: true,
});

gateway.register(fastifyHttpProxy, {
  upstream: process.env.CARD_API_URL!,
  prefix: "/card-api",
  rewritePrefix: "/",
  disableCache: true,
});

gateway.register(fastifyHttpProxy, {
  upstream: process.env.BATTLEPASS_API_URL!,
  prefix: "/minigames-api",
  rewritePrefix: "/",
  disableCache: true,
});

gateway.register(fastifyHttpProxy, {
  upstream: process.env.CHAT_API_URL!,
  prefix: "/api/v2/chat",
  rewritePrefix: "/",
  disableCache: true,
});

gateway.setErrorHandler((error, _request, reply) => {
  gateway.log.error(error);
  reply.status(500).send({ error: "Internal Server Error" });
});

gateway.listen({ port: 3001 }, (err) => {
  if (err) {
    gateway.log.error(err);
    process.exit(1);
  }
});
