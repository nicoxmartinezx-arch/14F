import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type Memory = Database['public']['Tables']['memories']['Row'];
type MemoryInsert = Database['public']['Tables']['memories']['Insert'];
type MemoryUpdate = Database['public']['Tables']['memories']['Update'];

export class MemoryService {
  static async getMemories(coupleId: string): Promise<Memory[]> {
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('couple_id', coupleId)
      .order('memory_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getMemoriesByDate(coupleId: string, year: number, month: number): Promise<Memory[]> {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('couple_id', coupleId)
      .gte('memory_date', startDate.toISOString().split('T')[0])
      .lte('memory_date', endDate.toISOString().split('T')[0])
      .order('memory_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async createMemory(memory: MemoryInsert): Promise<Memory> {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('deviceId', deviceId);
    }

    const { data, error } = await supabase
      .from('memories')
      .insert({
        ...memory,
        created_by: deviceId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateMemory(memoryId: string, updates: MemoryUpdate): Promise<Memory> {
    const { data, error } = await supabase
      .from('memories')
      .update(updates)
      .eq('id', memoryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteMemory(memoryId: string): Promise<void> {
    const { error } = await supabase
      .from('memories')
      .delete()
      .eq('id', memoryId);

    if (error) throw error;
  }

  static async toggleFavorite(memoryId: string, isFavorite: boolean): Promise<void> {
    const { error } = await supabase
      .from('memories')
      .update({ is_favorite: isFavorite })
      .eq('id', memoryId);

    if (error) throw error;
  }

  static async getFavorites(coupleId: string): Promise<Memory[]> {
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('couple_id', coupleId)
      .eq('is_favorite', true)
      .order('memory_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getMemoryStats(coupleId: string): Promise<{
    total: number;
    byCategory: Record<string, number>;
    favorites: number;
  }> {
    const { data, error } = await supabase
      .from('memories')
      .select('category, is_favorite')
      .eq('couple_id', coupleId);

    if (error) throw error;

    const byCategory: Record<string, number> = {};
    let favorites = 0;

    data?.forEach((memory) => {
      byCategory[memory.category] = (byCategory[memory.category] || 0) + 1;
      if (memory.is_favorite) favorites++;
    });

    return {
      total: data?.length || 0,
      byCategory,
      favorites,
    };
  }
}
