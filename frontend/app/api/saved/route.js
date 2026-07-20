import { createClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { data } = await supabaseAdmin
      .from("saved_schemes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    return Response.json({ schemes: data || [] });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { scheme_name, scheme_details } = await req.json();
    const { data, error } = await supabaseAdmin
      .from("saved_schemes")
      .insert({ user_id: user.id, scheme_name, scheme_details })
      .select()
      .single();
    if (error) throw error;
    return Response.json({ scheme: data });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await req.json();
    await supabaseAdmin.from("saved_schemes").delete().eq("id", id).eq("user_id", user.id);
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
