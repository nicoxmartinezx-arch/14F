import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type Couple = Database['public']['Tables']['couples']['Row'];
type CoupleInvitation = Database['public']['Tables']['couple_invitations']['Row'];

function getOrCreateDeviceId(): string {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
}

function generatePin(): string {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

export class CoupleService {
  static async generatePairingPin(): Promise<{ pin: string; expiresAt: string }> {
    const pin = generatePin();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    localStorage.setItem('pairingPin', pin);
    localStorage.setItem('pairingPinExpires', expiresAt);

    return { pin, expiresAt };
  }

  static getPairingPin(): { pin: string; expiresAt: string } | null {
    const pin = localStorage.getItem('pairingPin');
    const expiresAt = localStorage.getItem('pairingPinExpires');

    if (!pin || !expiresAt) return null;

    if (new Date(expiresAt) < new Date()) {
      localStorage.removeItem('pairingPin');
      localStorage.removeItem('pairingPinExpires');
      return null;
    }

    return { pin, expiresAt };
  }

  static async acceptPairingPin(pin: string): Promise<Couple> {
    const { data: invitation, error } = await supabase
      .from('couple_invitations')
      .select('*')
      .eq('invitation_code', pin)
      .eq('status', 'pending')
      .maybeSingle();

    if (error) throw error;
    if (!invitation) throw new Error('PIN not found or already used');

    if (new Date(invitation.expires_at) < new Date()) {
      throw new Error('PIN has expired');
    }

    const deviceId = getOrCreateDeviceId();

    const { error: updateError } = await supabase
      .from('couple_invitations')
      .update({
        status: 'accepted',
        recipient_id: deviceId,
      })
      .eq('id', invitation.id);

    if (updateError) throw updateError;

    const { data: couple, error: coupleError } = await supabase
      .from('couples')
      .insert({
        user1_id: invitation.sender_id,
        user2_id: deviceId,
        status: 'active',
      })
      .select()
      .single();

    if (coupleError) throw coupleError;
    return couple;
  }

  static async getMyCouple(): Promise<Couple | null> {
    const deviceId = getOrCreateDeviceId();
    const coupleId = localStorage.getItem('coupleId');

    if (coupleId) {
      const { data, error } = await supabase
        .from('couples')
        .select('*')
        .eq('id', coupleId)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      return data;
    }

    const { data, error } = await supabase
      .from('couples')
      .select('*')
      .or(`user1_id.eq.${deviceId},user2_id.eq.${deviceId}`)
      .eq('status', 'active')
      .maybeSingle();

    if (error) throw error;
    if (data) {
      localStorage.setItem('coupleId', data.id);
    }
    return data;
  }

  static async updateCouple(coupleId: string, updates: Partial<Couple>): Promise<void> {
    const { error } = await supabase
      .from('couples')
      .update(updates)
      .eq('id', coupleId);

    if (error) throw error;
  }
}
