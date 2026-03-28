import { createServerClient } from "@/lib/supabase";
import { verifyAdmin } from "@/lib/admin-auth";

const DUMMY_USERS = [
  { name: "Ayush Jain", phone: "9999999901", password: "password123" },
  { name: "SPIDER Automation", phone: "9999999902", password: "password123" },
  { name: "Sharon Pereira", phone: "9999999903", password: "password123" },
  { name: "Ameen Vittal", phone: "9999999904", password: "password123" },
  { name: "Salim Sheikh", phone: "9999999905", password: "password123" },
  { name: "Rahul Sharma", phone: "9999999906", password: "password123" },
  { name: "Priya Das", phone: "9999999907", password: "password123" },
  { name: "Vikram Singh", phone: "9999999908", password: "password123" },
  { name: "Ananya Iyer", phone: "9999999909", password: "password123" },
  { name: "Zaid Khan", phone: "9999999910", password: "password123" },
];

const GAME_TEMPLATES = [
  { moves: 16, time: 24500, score: 6285 },
  { moves: 18, time: 28200, score: 4815 },
  { moves: 20, time: 32100, score: 3795 },
  { moves: 22, time: 35400, score: 3200 },
  { moves: 24, time: 39000, score: 2850 },
  { moves: 26, time: 42500, score: 2400 },
  { moves: 28, time: 45000, score: 2100 },
  { moves: 30, time: 48000, score: 1850 },
  { moves: 32, time: 52000, score: 1600 },
  { moves: 35, time: 58000, score: 1400 },
];

export async function POST() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServerClient();

    // 1. Create/Upsert Users
    const usersCreated = [];
    for (const u of DUMMY_USERS) {
      const { data, error } = await supabase
        .from("users")
        .upsert({ 
          name: u.name, 
          phone: u.phone, 
          password_hash: u.password // In a real app, hash this properly
        }, { onConflict: 'phone' })
        .select()
        .single();
      
      if (!error && data) {
        usersCreated.push(data);
      }
    }

    // 2. Clear existing game records to start fresh
    await supabase.from("games").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // 3. Insert Game Records
    let inserted = 0;
    for (let i = 0; i < usersCreated.length; i++) {
        const user = usersCreated[i];
        const template = GAME_TEMPLATES[i % GAME_TEMPLATES.length];
        
        // Add some randomness to score/time so it's not identical across seeds
        const randomTime = template.time + Math.floor(Math.random() * 2000);
        const randomScore = template.score + Math.floor(Math.random() * 100);

        const { error } = await supabase.from("games").insert({
          user_id: user.id,
          moves: template.moves,
          time_taken: randomTime,
          score: randomScore,
          mode: "memory"
        });

        if (!error) inserted++;
    }

    return Response.json({ 
      success: true, 
      users: usersCreated.length, 
      gamesInserted: inserted 
    });
  } catch (error) {
    console.error("Seed error:", error);
    return Response.json({ error: "Failed to seed game records" }, { status: 500 });
  }
}
