// services/progress.service.ts
import { supabase } from "../supabase";

type ProgressStatus = "completed" | "in_progress";

type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * ProgressService (robusto)
 *
 * 🔑 Concepto:
 * - Tu UI trabaja con:
 *   - unitId: string (ej: "10-u1")  -> ES el ID real que usa tu App
 *   - blockKey: string (ej: "206-3A-Econ-U1-B1") -> viene del JSON (block.id)
 *
 * - Tu BD guarda:
 *   - progress.block_id: int8 -> referencia a blocks.id (numérico)
 *   - progress.unit_id: text  -> guardamos EXACTAMENTE el unitId real (ej "10-u1")
 *
 * ✅ Para evitar confusiones de courseId/unitNumber:
 * - Resolvemos blocks SOLO por block_key (debe ser único)
 * - Tomamos course_id y unit_number reales desde la fila de blocks
 */
export class ProgressService {
  // =========================
  // Helpers de retorno tipado
  // =========================
  private static ok<T>(data: T): ServiceResult<T> {
    return { success: true, data };
  }

  private static fail<T = never>(error: string): ServiceResult<T> {
    return { success: false, error };
  }

  // =========================
  // 1) Resolver blockKey -> (blockId, courseId, unitNumber) desde BD
  // =========================
  static async resolveBlockByKey(params: {
    blockKey: string;
  }): Promise<ServiceResult<{ blockId: number; courseId: number; unitNumber: number }>> {
    const blockKey = String(params.blockKey ?? "").trim();
    if (!blockKey) return this.fail("blockKey vacío");

    const { data, error } = await supabase
      .from("blocks")
      .select("id, course_id, unit_number")
      .eq("block_key", blockKey)
      .eq("is_active", true)
      .maybeSingle();

    if (error) return this.fail(error.message);
    if (!data?.id) return this.fail(`No existe block_key en blocks: ${blockKey}`);

    return this.ok({
      blockId: Number(data.id),
      courseId: Number((data as any).course_id),
      unitNumber: Number((data as any).unit_number),
    });
  }

  // =========================
  // 2) Toggle completar/descompletar (por unitId real + blockKey)
  // =========================
  /**
 * Toggle de completitud por blockKey (string).
 * Guarda en progress.block_id (int8) usando el id numérico de blocks.
 */
static async toggleBlockComplete(params: {
  userId: string;
  unitId: string;
  blockKey: string; // ej: "206-3A-Econ-U1-B1"
}): Promise<ServiceResult<{ status: ProgressStatus }>> {
  const { userId, unitId, blockKey } = params;

  try {
    // 1) Resolver blockKey -> (blockId numérico + courseId + unitNumber)
    const resolved = await this.resolveBlockByKey({ blockKey });

    // ✅ Narrowing explícito: acá TypeScript YA SABE que resolved tiene "error"
    if (resolved.success === false) {
      return { success: false, error: resolved.error };
    }

    // ✅ En este punto TypeScript YA SABE que resolved tiene "data"
    const { blockId, courseId } = resolved.data;

    // 2) Buscar registro existente (user + unit + block)
    const { data: existing, error: fetchError } = await supabase
      .from("progress")
      .select("id,status")
      .eq("user_id", userId)
      .eq("unit_id", unitId)
      .eq("block_id", blockId)
      .maybeSingle();

    if (fetchError) return { success: false, error: fetchError.message };

    // 3) Toggle si existe
    if (existing) {
      const nextStatus: ProgressStatus =
        existing.status === "completed" ? "in_progress" : "completed";

      const payload =
        nextStatus === "completed"
          ? { status: nextStatus, completed_at: new Date().toISOString() }
          : { status: nextStatus, completed_at: null };

      const { error: updErr } = await supabase
        .from("progress")
        .update(payload)
        .eq("id", existing.id);

      if (updErr) return { success: false, error: updErr.message };
      return { success: true, data: { status: nextStatus } };
    }

    // 4) Insert si no existe
    const { error: insErr } = await supabase.from("progress").insert({
      user_id: userId,
      course_id: courseId,
      unit_id: unitId,
      block_id: blockId,
      status: "completed",
      completed_at: new Date().toISOString(),
    });

    if (insErr) return { success: false, error: insErr.message };
    return { success: true, data: { status: "completed" } };
  } catch (e: any) {
    return { success: false, error: e?.message ?? "Error inesperado" };
  }
}


  // =========================
  // 3) Traer progreso de una unidad (devuelve Set<blockKey>)
  // =========================
  static async getUnitProgressKeys(params: {
    userId: string;
    unitId: string; // ej: "10-u1"
  }): Promise<ServiceResult<Set<string>>> {
    const userId = String(params.userId ?? "").trim();
    const unitId = String(params.unitId ?? "").trim();

    if (!userId) return this.fail("userId vacío");
    if (!unitId) return this.fail("unitId vacío");

    try {
      // 1) Traer block_id completados
      const { data: prog, error: progErr } = await supabase
        .from("progress")
        .select("block_id")
        .eq("user_id", userId)
        .eq("unit_id", unitId)
        .eq("status", "completed");

      if (progErr) return this.fail(progErr.message);

      const blockIds = (prog ?? []).map((r: any) => Number(r.block_id)).filter(Boolean);
      if (blockIds.length === 0) return this.ok(new Set<string>());

      // 2) Convertir block_id -> block_key (para matchear con tu JSON)
      const { data: blocks, error: blkErr } = await supabase
        .from("blocks")
        .select("id, block_key")
        .in("id", blockIds);

      if (blkErr) return this.fail(blkErr.message);

      const keys = new Set<string>((blocks ?? []).map((b: any) => String(b.block_key)));
      return this.ok(keys);
    } catch (e: any) {
      return this.fail(e?.message ?? "Error inesperado");
    }
  }
}
