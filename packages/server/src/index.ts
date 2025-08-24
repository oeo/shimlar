#!/usr/bin/env bun
/**
 * @shimlar/server - game state api server
 * provides rest api for react client to manage game state
 */

import { GameStateRepository } from "@shimlar/engine";

const PORT = Bun.env.PORT || 3001;
const DB_PATH = Bun.env.DB_PATH || "./data/shimlar.db";

// initialize repository
const repository = new GameStateRepository(DB_PATH);

// simple cors headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

const server = Bun.serve({
  port: PORT,
  
  async fetch(req) {
    const url = new URL(req.url);
    
    // handle cors preflight
    if (req.method === "OPTIONS") {
      return new Response(null, { 
        status: 200, 
        headers: corsHeaders 
      });
    }
    
    // health check
    if (url.pathname === "/health") {
      return Response.json({ status: "ok", timestamp: Date.now() }, {
        headers: corsHeaders
      });
    }
    
    // api routes
    if (url.pathname.startsWith("/api/")) {
      try {
        const result = await handleApiRequest(req, url);
        return Response.json(result, { headers: corsHeaders });
      } catch (error) {
        console.error("api error:", error);
        return Response.json(
          { error: "internal server error" }, 
          { status: 500, headers: corsHeaders }
        );
      }
    }
    
    return Response.json(
      { error: "not found" }, 
      { status: 404, headers: corsHeaders }
    );
  }
});

async function handleApiRequest(req: Request, url: URL) {
  const path = url.pathname.replace("/api", "");
  const method = req.method;
  
  // player management
  if (path === "/players" && method === "GET") {
    return await repository.getPlayerList();
  }
  
  if (path === "/players" && method === "POST") {
    const data = await req.json();
    await repository.savePlayer(data);
    return { success: true };
  }
  
  if (path.startsWith("/players/")) {
    const playerId = path.split("/")[2];
    
    if (method === "GET") {
      const player = await repository.loadPlayer(playerId);
      if (!player) {
        throw new Error("player not found");
      }
      return player;
    }
    
    if (method === "PUT") {
      const data = await req.json();
      await repository.savePlayer({ ...data, id: playerId });
      return { success: true };
    }
  }
  
  // session management
  if (path.startsWith("/sessions/")) {
    const sessionId = path.split("/")[2];
    
    if (method === "GET") {
      const session = await repository.loadSession(sessionId);
      if (!session) {
        throw new Error("session not found");
      }
      return session;
    }
    
    if (method === "PUT") {
      const data = await req.json();
      await repository.saveSession(data);
      return { success: true };
    }
    
    if (method === "DELETE") {
      await repository.deleteSession(sessionId);
      return { success: true };
    }
  }
  
  throw new Error("endpoint not found");
}

console.log(`🎮 Shimlar server running on port ${PORT}`);
console.log(`📁 Database: ${DB_PATH}`);

export { server };