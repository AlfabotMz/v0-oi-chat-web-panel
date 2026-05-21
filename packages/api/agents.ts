import type { Agent } from '@oichat/types';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Fetches all agents for a specific user.
 */
export async function getAgents(supabase: SupabaseClient, userId: string): Promise<Agent[]> {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching agents: ${error.message}`);
  }

  return data as Agent[];
}

/**
 * Fetches a single agent by ID for a specific user.
 */
export async function getAgentById(supabase: SupabaseClient, agentId: string, userId: string): Promise<Agent> {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('id', agentId)
    .eq('user_id', userId)
    .single();

  if (error) {
    throw new Error(`Error fetching agent: ${error.message}`);
  }

  return data as Agent;
}

/**
 * Toggles an agent's status.
 */
export async function toggleAgentStatus(supabase: SupabaseClient, agentId: string, userId: string, isActive: boolean): Promise<void> {
  const { error } = await supabase
    .from('agents')
    .update({ status: isActive ? 'active' : 'inactive' })
    .eq('id', agentId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Error updating agent status: ${error.message}`);
  }
}
