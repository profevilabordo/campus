// services/progress.service.ts
import { supabase } from '../supabase';

export class ProgressService {
  /**
   * Marca un bloque como completado o lo desmarca (toggle)
   */
  static async markBlockComplete(
    userId: string,
    courseId: number,
    blockId: number,
    unitNumber: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Verificar si ya existe el registro
      const { data: existing, error: fetchError } = await supabase
        .from('progress')
        .select('id, status')
        .eq('user_id', userId)
        .eq('block_id', blockId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existing) {
        // Ya existe: hacer toggle del estado
        const newStatus = existing.status === 'completed' ? 'in_progress' : 'completed';
        
        const { error: updateError } = await supabase
          .from('progress')
          .update({
            status: newStatus,
            ...(newStatus === 'completed' && { 
              completed_at: new Date().toISOString() 
            })
          })
          .eq('id', existing.id);

        if (updateError) throw updateError;
        
        console.log(`[Progress] Block ${blockId} toggled to ${newStatus}`);
        return { success: true };
      }

      // No existe: crear nuevo registro como completado
      const unitId = `${courseId}-U${unitNumber}`;
      
      const { error: insertError } = await supabase
        .from('progress')
        .insert({
          user_id: userId,
          course_id: courseId,
          block_id: blockId,
          unit_id: unitId,
          status: 'completed',
          completed_at: new Date().toISOString()
        });

      if (insertError) throw insertError;
      
      console.log(`[Progress] Block ${blockId} marked as completed`);
      return { success: true };

    } catch (error: any) {
      console.error('[ProgressService] markBlockComplete error:', error);
      return { 
        success: false, 
        error: error.message || 'Error al guardar progreso' 
      };
    }
  }

  /**
   * Obtiene los IDs de bloques completados de una unidad
   */
  static async getUnitProgress(
    userId: string,
    courseId: number,
    unitNumber: number
  ): Promise<Set<number>> {
    try {
      const unitId = `${courseId}-U${unitNumber}`;
      
      const { data, error } = await supabase
        .from('progress')
        .select('block_id')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('unit_id', unitId)
        .eq('status', 'completed');

      if (error) throw error;

      const blockIds = new Set<number>(data?.map(p => p.block_id) || []);
      console.log(`[Progress] Unit ${unitId} has ${blockIds.size} blocks completed`);
      
      return blockIds;

    } catch (error: any) {
      console.error('[ProgressService] getUnitProgress error:', error);
      return new Set<number>();
    }
  }

  /**
   * Calcula el progreso total de un curso
   */
  static async getCourseProgress(
    userId: string,
    courseId: number
  ): Promise<{ completed: number; total: number; percentage: number }> {
    try {
      // Total de bloques activos del curso
      const { count: totalBlocks, error: countError } = await supabase
        .from('blocks')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', courseId)
        .eq('is_active', true);

      if (countError) throw countError;

      // Bloques completados por el usuario
      const { count: completedBlocks, error: progressError } = await supabase
        .from('progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('status', 'completed');

      if (progressError) throw progressError;

      const total = totalBlocks || 0;
      const completed = completedBlocks || 0;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      console.log(`[Progress] Course ${courseId}: ${completed}/${total} (${percentage}%)`);

      return { completed, total, percentage };

    } catch (error: any) {
      console.error('[ProgressService] getCourseProgress error:', error);
      return { completed: 0, total: 0, percentage: 0 };
    }
  }
}