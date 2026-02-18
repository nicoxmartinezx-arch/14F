import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type Couple = Database['public']['Tables']['couples']['Row'];
type PairingSession = Database['public']['Tables']['pairing_sessions']['Row'];

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

function generateSessionToken(): string {
  return 'token_' + Math.random().toString(36).substr(2, 32) + '_' + Date.now();
}

export class CoupleService {
  static async generatePairingPin(coupleId: string): Promise<{ pin: string; expiresAt: string; sessionToken: string }> {
    const deviceId = getOrCreateDeviceId();
    const pin = generatePin();
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('pairing_sessions')
      .insert({
        couple_id: coupleId,
        device_id_1: deviceId,
        device_id_2: '',
        session_token_1: sessionToken,
        session_token_2: '',
        pin_code: pin,
        pin_expires_at: expiresAt,
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;

    localStorage.setItem('pairingPin', pin);
    localStorage.setItem('pairingSessionToken', sessionToken);
    localStorage.setItem('pairingSessionId', data.id);

    return { pin, expiresAt, sessionToken };
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

  static async acceptPairingPin(pin: string): Promise<{ couple: Couple; sessionToken: string }> {
    const deviceId = getOrCreateDeviceId();
    const sessionToken = generateSessionToken();

    const { data: pairingSession, error: sessionError } = await supabase
      .from('pairing_sessions')
      .select('*')
      .eq('pin_code', pin)
      .eq('status', 'active')
      .maybeSingle();

    if (sessionError) throw sessionError;
    if (!pairingSession) throw new Error('PIN not found or already used');

    if (new Date(pairingSession.pin_expires_at) < new Date()) {
      throw new Error('PIN has expired');
    }

    const { error: updateError } = await supabase
      .from('pairing_sessions')
      .update({
        device_id_2: deviceId,
        session_token_2: sessionToken,
      })
      .eq('id', pairingSession.id);

    if (updateError) throw updateError;

    const { data: couple, error: coupleError } = await supabase
      .from('couples')
      .select('*')
      .eq('id', pairingSession.couple_id)
      .single();

    if (coupleError) throw coupleError;

    localStorage.setItem('sessionToken', sessionToken);
    localStorage.setItem('coupleId', couple.id);
    localStorage.setItem('deviceId', deviceId);

    return { couple, sessionToken };
  }

  static async getMyCouple(): Promise<Couple | null> {
    const deviceId = getOrCreateDeviceId();
    const sessionToken = localStorage.getItem('sessionToken');
    const coupleId = localStorage.getItem('coupleId');

    if (sessionToken && coupleId) {
      const { data: couple, error: coupleError } = await supabase
        .from('couples')
        .select('*')
        .eq('id', coupleId)
        .eq('status', 'active')
        .maybeSingle();

      if (coupleError) throw coupleError;

      if (couple) {
        await this.updateDeviceSession(deviceId, coupleId);
        return couple;
      }
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
      if (!sessionToken) {
        const newToken = generateSessionToken();
        localStorage.setItem('sessionToken', newToken);
      }
      await this.updateDeviceSession(deviceId, data.id);
    }
    return data;
  }

  static async updateDeviceSession(deviceId: string, coupleId: string): Promise<void> {
    const deviceToken = localStorage.getItem('deviceToken') || generateSessionToken();

    if (!localStorage.getItem('deviceToken')) {
      localStorage.setItem('deviceToken', deviceToken);
    }

    const { error } = await supabase
      .from('device_sessions')
      .upsert({
        device_id: deviceId,
        couple_id: coupleId,
        device_token: deviceToken,
        last_seen_at: new Date().toISOString(),
      }, {
        onConflict: 'device_id'
      });

    if (error) throw error;
  }

  static async validateSession(): Promise<boolean> {
    const deviceId = getOrCreateDeviceId();
    const sessionToken = localStorage.getItem('sessionToken');
    const coupleId = localStorage.getItem('coupleId');

    if (!sessionToken || !coupleId) return false;

    const { data: couple, error } = await supabase
      .from('couples')
      .select('*')
      .eq('id', coupleId)
      .eq('status', 'active')
      .maybeSingle();

    if (error || !couple) return false;

    const isUserInCouple = couple.user1_id === deviceId || couple.user2_id === deviceId;
    return isUserInCouple;
  }

  static async updateCouple(coupleId: string, updates: Partial<Couple>): Promise<void> {
    const { error } = await supabase
      .from('couples')
      .update(updates)
      .eq('id', coupleId);

    if (error) throw error;
  }

  static clearSession(): void {
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('coupleId');
    localStorage.removeItem('pairingPin');
  }
}
