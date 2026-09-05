// Edge Function: create-staff-user
// Cria um login real (Supabase Auth) para um funcionário (profissional ou
// secretária) e o profile correspondente, vinculado ao MESMO tenant de quem
// está chamando. É a única forma seguindo de fazer isso: a service_role key
// nunca pode ficar no navegador, só aqui dentro (variável de ambiente da
// própria função, configurada pelo Supabase).
//
// Deploy: veja instruções no chat — supabase functions deploy create-staff-user
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.112.4';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: 'Não autenticado.' }, 401);
    }

    // Cliente "do chamador": usa o JWT de quem está logado, respeitando a
    // RLS normalmente — serve só para descobrir quem é e qual o tenant dele.
    const callerClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user: callerUser },
    } = await callerClient.auth.getUser();
    if (!callerUser) {
      return json({ error: 'Sessão inválida.' }, 401);
    }

    const { data: callerProfile, error: callerProfileError } = await callerClient
      .from('profiles')
      .select('tenant_id, role')
      .eq('id', callerUser.id)
      .maybeSingle();

    if (callerProfileError || !callerProfile) {
      return json({ error: 'Perfil do usuário chamador não encontrado.' }, 403);
    }

    if (!['admin', 'superadmin'].includes(callerProfile.role)) {
      return json({ error: 'Só administradores podem criar novos usuários.' }, 403);
    }

    const body = await req.json();
    const { name, email, role, professionalId, patientId } = body as {
      name: string;
      email: string;
      role: 'admin' | 'professional' | 'secretary';
      professionalId?: string;
      patientId?: string;
    };

    if (!name || !email || !role) {
      return json({ error: 'Nome, e-mail e perfil são obrigatórios.' }, 400);
    }
    if (!['admin', 'professional', 'secretary'].includes(role)) {
      return json({ error: 'Perfil inválido — use admin, professional ou secretary.' }, 400);
    }

    // Cliente com service_role: só a partir daqui usamos privilégio elevado,
    // e só para as duas ações abaixo (convidar usuário + criar profile).
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: { invited_to_tenant: callerProfile.tenant_id, invited_name: name },
    });
    if (inviteError || !inviteData.user) {
      return json({ error: `Erro ao convidar usuário: ${inviteError?.message || 'desconhecido'}` }, 400);
    }

    const { data: newProfile, error: profileError } = await adminClient
      .from('profiles')
      .insert({
        id: inviteData.user.id,
        tenant_id: callerProfile.tenant_id,
        name,
        email,
        role,
        status: 'active',
        professional_id: professionalId || null,
        patient_id: patientId || null,
      })
      .select()
      .single();

    if (profileError) {
      // Se o profile falhar, desfaz o convite pra não deixar um usuário Auth órfão sem profile.
      await adminClient.auth.admin.deleteUser(inviteData.user.id);
      return json({ error: `Erro ao criar profile: ${profileError.message}` }, 400);
    }

    return json({ profile: newProfile }, 200);
  } catch (err: any) {
    return json({ error: err.message || 'Erro inesperado.' }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
