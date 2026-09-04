import { createTenantCrud } from '../lib/tenantCrud';
import type { PhysicalEvaluation, Evolution, Prescription, PatientConsentTerm, PatientSignatureData } from '../types';

const evaluationsCrud = createTenantCrud<PhysicalEvaluation>('physical_evaluations');
const evolutionsCrud = createTenantCrud<Evolution>('evolutions');
const prescriptionsCrud = createTenantCrud<Prescription>('prescriptions');
const consentTermsCrud = createTenantCrud<PatientConsentTerm>('consent_terms');

/** Hash de verificação (SHA-256) do conteúdo assinado — usado para provar que o termo não foi alterado depois da assinatura. */
async function computeVerificationHash(content: string): Promise<string> {
  const data = new TextEncoder().encode(content);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export const medicalRecordService = {
  // Avaliações físicas (SOAP inicial)
  listEvaluations: (tenantId: string) => evaluationsCrud.list(tenantId, { orderBy: 'date', ascending: false }),
  createEvaluation: evaluationsCrud.create,
  updateEvaluation: evaluationsCrud.update,
  removeEvaluation: evaluationsCrud.remove,

  async evaluationsByPatient(tenantId: string, patientId: string): Promise<PhysicalEvaluation[]> {
    const all = await evaluationsCrud.list(tenantId, { orderBy: 'date', ascending: false });
    return all.filter((e) => e.patientId === patientId);
  },

  // Evoluções (registro de cada atendimento)
  listEvolutions: (tenantId: string) => evolutionsCrud.list(tenantId, { orderBy: 'date', ascending: false }),
  createEvolution: evolutionsCrud.create,
  removeEvolution: evolutionsCrud.remove,

  async evolutionsByPatient(tenantId: string, patientId: string): Promise<Evolution[]> {
    const all = await evolutionsCrud.list(tenantId, { orderBy: 'date', ascending: false });
    return all.filter((e) => e.patientId === patientId);
  },

  // Prescrições
  listPrescriptions: (tenantId: string) => prescriptionsCrud.list(tenantId, { orderBy: 'date', ascending: false }),
  createPrescription: prescriptionsCrud.create,
  removePrescription: prescriptionsCrud.remove,

  // Termos de consentimento (TCLE / LGPD)
  listConsentTerms: (tenantId: string) => consentTermsCrud.list(tenantId, { orderBy: 'created_at', ascending: false }),
  createConsentTerm: consentTermsCrud.create, // usa quando o hash já vem pronto do front (ver ConsentTermSignModal)
  updateConsentTerm: consentTermsCrud.update,
  removeConsentTerm: consentTermsCrud.remove,

  async consentTermsByPatient(tenantId: string, patientId: string): Promise<PatientConsentTerm[]> {
    const all = await consentTermsCrud.list(tenantId, { orderBy: 'created_at', ascending: false });
    return all.filter((c) => c.patientId === patientId);
  },

  /**
   * Cria o termo já assinado: calcula o hash de verificação a partir do
   * conteúdo + dados de quem assinou, garantindo que qualquer alteração
   * posterior no texto invalida a assinatura original.
   */
  async signConsentTerm(
    tenantId: string,
    payload: Omit<PatientConsentTerm, 'id' | 'tenantId' | 'createdAt' | 'patientSignature'> & {
      patientSignature: Omit<PatientSignatureData, 'verificationHash'>;
    }
  ): Promise<PatientConsentTerm> {
    const hashInput = `${payload.content}|${payload.patientSignature.signedByName}|${payload.patientSignature.signedByCpf}|${payload.patientSignature.timestamp}`;
    const verificationHash = await computeVerificationHash(hashInput);
    return consentTermsCrud.create(tenantId, {
      ...payload,
      status: 'signed',
      signedAt: payload.patientSignature.timestamp,
      patientSignature: { ...payload.patientSignature, verificationHash },
    } as unknown as Partial<PatientConsentTerm>);
  },

  async revokeConsentTerm(id: string, reason: string): Promise<PatientConsentTerm> {
    return consentTermsCrud.update(id, {
      status: 'revoked',
      revokedAt: new Date().toISOString(),
      revokeReason: reason,
    } as Partial<PatientConsentTerm>);
  },
};
