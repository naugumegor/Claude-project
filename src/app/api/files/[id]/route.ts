import type { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { materialFiles, materials } from "@/db/schema";
import { getAdmin } from "@/lib/session";
import { fileResponse } from "@/lib/serve-file";

// A material's attached document. Drafts are visible only to the admin.
export async function GET(request: NextRequest, ctx: RouteContext<"/api/files/[id]">) {
  const id = Number((await ctx.params).id);
  if (!Number.isInteger(id)) return new Response("Not found", { status: 404 });

  const [row] = await db
    .select({ file: materialFiles, status: materials.status })
    .from(materialFiles)
    .innerJoin(materials, eq(materialFiles.materialId, materials.id))
    .where(eq(materialFiles.id, id))
    .limit(1);
  if (!row || (row.status !== "published" && !(await getAdmin()))) {
    return new Response("Not found", { status: 404 });
  }
  return fileResponse(row.file, {
    download: request.nextUrl.searchParams.has("download"),
    cache: row.status === "published",
  });
}
