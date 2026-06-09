import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing requests
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API base health route
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Gym Management System full-stack server running successfully!" });
  });

  // In-memory mock database collections starting at 0 items (as requested)
  // Connect your relational database (e.g. Supabase, Prisma, PostgreSQL, Firestore) securely right here!
  let membersDb: any[] = [];
  let transactionsDb: any[] = [];
  let adminDb: any = {
    fullName: "Alex Rivera",
    username: "arivera_admin",
    email: "alex.rivera@fitadminpro.com",
    role: "Super Administrator",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDHHjI-aC2dcBbVZbpbl0rThlZfPSmWyGsNGuJlgohNE67cxkPB5n9dqit5KZRwVI7Z1l1pd6tJ5PCPHkZFkQ8_TFAW8pULxiKdV-IVYX0iQtoKpYeTpNU2VPaKeOrSkpdSdhBJESq0qBvE-qJo2ltNVxwjYTFQTqkMTu3-kXJakRsqKnOWZSXxjs3o-z5SMYw_peF6YuvMj9NqSTi5CJu68MuzdM9wGsau0gKEjIyERXVdFcCBqo_hDv4347E_pcxhzCHcBP5zQF6R",
  };
  let gymDb: any = {
    name: "Iron Pulse Performance Center",
    address: "242 Innovation Way, Tech District, San Francisco, CA 94103",
    phone: "+1 (555) 012-3456",
    website: "www.ironpulse.gym",
  };
  let settingsDb: any = {
    theme: "Light",
    emailUpdates: true,
    desktopAlerts: false,
  };

  // MEMBERS CONTROLLERS
  app.get("/api/members", (req, res) => {
    res.json(membersDb);
  });

  app.post("/api/members", (req, res) => {
    const newMember = req.body;
    const exists = membersDb.some((m) => m.id === newMember.id);
    if (!exists) {
      membersDb.unshift(newMember);
    }
    res.status(201).json({ success: true, member: newMember });
  });

  app.put("/api/members/:id", (req, res) => {
    const { id } = req.params;
    const updated = req.body;
    membersDb = membersDb.map((m) => (m.id === id ? { ...m, ...updated } : m));
    res.json({ success: true, member: updated });
  });

  app.delete("/api/members", (req, res) => {
    membersDb = [];
    transactionsDb = [];
    res.json({ success: true, count: 0 });
  });

  app.delete("/api/members/:id", (req, res) => {
    const { id } = req.params;
    const targetMember = membersDb.find((m) => m.id === id);
    if (targetMember) {
      transactionsDb = transactionsDb.filter((t) => t.memberName !== targetMember.name);
    }
    membersDb = membersDb.filter((m) => m.id !== id);
    res.json({ success: true, deletedId: id });
  });

  // TRANSACTIONS / PAYMENT CONTROLLERS
  app.get("/api/transactions", (req, res) => {
    res.json(transactionsDb);
  });

  app.post("/api/transactions", (req, res) => {
    const newTx = req.body;
    const exists = transactionsDb.some((t) => t.id === newTx.id);
    if (!exists) {
      transactionsDb.unshift(newTx);
    }
    res.status(201).json({ success: true, transaction: newTx });
  });

  // CONFIGURATION & PROFILE CONTROLLERS
  app.get("/api/admin", (req, res) => {
    res.json(adminDb);
  });

  app.post("/api/admin", (req, res) => {
    adminDb = { ...adminDb, ...req.body };
    res.json({ success: true, admin: adminDb });
  });

  app.get("/api/gym", (req, res) => {
    res.json(gymDb);
  });

  app.post("/api/gym", (req, res) => {
    gymDb = { ...gymDb, ...req.body };
    res.json({ success: true, gym: gymDb });
  });

  app.get("/api/settings", (req, res) => {
    res.json(settingsDb);
  });

  app.post("/api/settings", (req, res) => {
    settingsDb = { ...settingsDb, ...req.body };
    res.json({ success: true, settings: settingsDb });
  });
  
  // Vite middleware for development vs static asset serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Server is boot-up on http://localhost:${PORT} in ${process.env.NODE_ENV || "development"} mode.`);
  });
}

startServer().catch((error) => {
  console.error("Critical: Failed to launch backend server", error);
});
