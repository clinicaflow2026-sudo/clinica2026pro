import { getSupabaseClient } from './supabase';

/** Extrai o content-type e os bytes brutos de uma data URL (ex: "data:image/png;base64,....."). */
function parseDataUrl(dataUrl: string): { contentType: string; bytes: Uint8Array } | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  const contentType = match[1];
  const binary = atob(match[2]);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return { contentType, bytes };
}

/**
 * Faz upload de uma imagem em base64 (o formato que o DigitalSignaturePad e
 * outros lugares do app já produzem) para um bucket do Supabase Storage, e
 * devolve uma URL assinada para usar direto como `src` de imagem — sem
 * precisar mudar nenhum componente que já espera uma string de URL.
 *
 * Os buckets (prontuarios/assinaturas/documentos) são privados, então a URL
 * é assinada com validade longa (1 ano). Depois desse prazo ela para de
 * funcionar e precisaria ser gerada de novo — um refresh automático fica
 * como próximo passo, não foi implementado nesta fase.
 */
export async function uploadDataUrlToStorage(bucket: string, path: string, dataUrl: string): Promise<string> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase não está configurado.');

  const parsed = parseDataUrl(dataUrl);
  if (!parsed) {
    // Não é uma data URL válida (ex: já é uma URL http normal, ou um SVG
    // inline usado como placeholder) — devolve como veio, sem tentar upload.
    return dataUrl;
  }

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, parsed.bytes, { contentType: parsed.contentType, upsert: true });
  if (uploadError) throw uploadError;

  const oneYearInSeconds = 60 * 60 * 24 * 365;
  const { data: signedData, error: signError } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, oneYearInSeconds);
  if (signError) throw signError;

  return signedData.signedUrl;
}

/** Upload de arquivo público (logo da clínica) — bucket "logos" é público, então devolve a URL direta, sem assinatura/expiração. */
export async function uploadDataUrlToPublicStorage(path: string, dataUrl: string): Promise<string> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase não está configurado.');

  const parsed = parseDataUrl(dataUrl);
  if (!parsed) return dataUrl;

  const { error: uploadError } = await supabase.storage
    .from('logos')
    .upload(path, parsed.bytes, { contentType: parsed.contentType, upsert: true });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('logos').getPublicUrl(path);
  return data.publicUrl;
}
