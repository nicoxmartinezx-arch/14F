import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type Couple = Database['public']['Tables']['couples']['Row'];
type CoupleInvitation = Database['public']['Tables']['couple_invitations']['Row'];

export class CoupleService {
  static async getMyCouple(): Promise<Couple | null> {
    const { data, error } = await supabase
      .from('couples')
      .select('*')
      .eq('status', 'active')
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async createInvitation(recipientEmail: string): Promise<CoupleInvitation> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('couple_invitations')
      .insert({
        sender_id: user.id,
        recipient_email: recipientEmail,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getMyInvitations(): Promise<CoupleInvitation[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('couple_invitations')
      .select('*')
      .or(`sender_id.eq.${user.id},recipient_email.eq.${user.email}`)
      .eq('status', 'pending');

    if (error) throw error;
    return data || [];
  }

  static async acceptInvitation(invitationCode: string): Promise<Couple> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: invitation, error: invError } = await supabase
      .from('couple_invitations')
      .select('*')
      .eq('invitation_code', invitationCode)
      .eq('status', 'pending')
      .maybeSingle();

    if (invError) throw invError;
    if (!invitation) throw new Error('Invitation not found or already used');

    if (new Date(invitation.expires_at) < new Date()) {
      throw new Error('Invitation has expired');
    }

    const { error: updateError } = await supabase
      .from('couple_invitations')
      .update({
        status: 'accepted',
        recipient_id: user.id,
      })
      .eq('id', invitation.id);

    if (updateError) throw updateError;

    const { data: couple, error: coupleError } = await supabase
      .from('couples')
      .insert({
        user1_id: invitation.sender_id,
        user2_id: user.id,
        status: 'active',
      })
      .select()
      .single();

    if (coupleError) throw coupleError;
    return couple;
  }

  static async updateCouple(coupleId: string, updates: Partial<Couple>): Promise<void> {
    const { error } = await supabase
      .from('couples')
      .update(updates)
      .eq('id', coupleId);

    if (error) throw error;
  }

  static async getCouplePartner(coupleId: string): Promise<any> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: couple, error: coupleError } = await supabase
      .from('couples')
      .select('user1_id, user2_id')
      .eq('id', coupleId)
      .single();

    if (coupleError) throw coupleError;

    const partnerId = couple.user1_id === user.id ? couple.user2_id : couple.user1_id;

    const { data: partner, error: partnerError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', partnerId)
      .single();

    if (partnerError) throw partnerError;
    return partner;
  }
}
