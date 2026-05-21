import { useState, useEffect } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { AppText, AppButton } from '@oichat/ui';
import { getSupabaseClient, getAgents } from '@oichat/api';
import type { Agent } from '@oichat/types';
import { Link } from 'expo-router';

// Initialize supabase client
// Note: In a real app, these should come from process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'dummy_key';
const supabase = getSupabaseClient(supabaseUrl, supabaseKey);

export default function Home() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hardcoded user ID for POC. In a real app, this comes from Supabase Auth session.
  const dummyUserId = "user_123";

  useEffect(() => {
    async function loadAgents() {
      try {
        setLoading(true);
        // Using the shared API function
        const data = await getAgents(supabase, dummyUserId);
        setAgents(data);
      } catch (err: any) {
        // If dummy keys are used, this will likely fail
        console.log("Supabase fetch failed (expected if dummy keys are used):", err.message);
        setError("Erro ao carregar agentes. Configure as chaves do Supabase no .env");
      } finally {
        setLoading(false);
      }
    }

    loadAgents();
  }, []);

  return (
    <View className="flex-1 bg-zinc-900">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="mb-8 mt-4">
          <AppText className="text-white text-3xl font-bold text-center mb-2">
            Meus Agentes
          </AppText>
          <AppText className="text-zinc-400 text-center">
            Consumindo @oichat/api no Mobile
          </AppText>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#ffffff" className="mt-8" />
        ) : error ? (
          <View className="bg-red-500/10 p-4 rounded-xl border border-red-500/20">
            <AppText className="text-red-400 text-center">{error}</AppText>
          </View>
        ) : agents.length === 0 ? (
          <View className="bg-zinc-800/50 p-6 rounded-2xl items-center border border-zinc-800">
            <AppText className="text-zinc-400 text-center mb-4">
              Nenhum agente encontrado para este usuário.
            </AppText>
            <AppButton onPress={() => alert('Criar novo!')}>
              Criar Primeiro Agente
            </AppButton>
          </View>
        ) : (
          <View className="space-y-4 gap-4">
            {agents.map((agent) => (
              <View key={agent.id} className="bg-zinc-800 p-4 rounded-2xl border border-zinc-700">
                <AppText className="text-white text-lg font-bold">{agent.name}</AppText>
                <AppText className="text-zinc-400 mt-1">Status: {agent.is_active ? 'Ativo' : 'Inativo'}</AppText>
                
                <View className="mt-4 flex-row justify-end">
                  <AppButton variant="outline" className="mr-2" onPress={() => alert(`Editar ${agent.name}`)}>
                    Editar
                  </AppButton>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
