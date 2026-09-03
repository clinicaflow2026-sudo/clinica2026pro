import { ConsentTermType, ConsentTermClause } from '../../types';

export interface ConsentTermTemplate {
  id: ConsentTermType;
  title: string;
  category: string;
  description: string;
  defaultContent: string;
  defaultClauses: ConsentTermClause[];
}

export const CONSENT_TERM_TEMPLATES: ConsentTermTemplate[] = [
  {
    id: 'physiotherapy',
    title: 'Termo de Consentimento Livre e Esclarecido (TCLE) - Fisioterapia & Reabilitação',
    category: 'Fisioterapia Traumato-Ortopédica',
    description: 'Reabilitação física, cinesioterapia, terapia manual e recursos terapêuticos.',
    defaultContent: `Eu, {NOME_PACIENTE}, portador(a) do CPF nº {CPF}, declaro que fui devidamente informado(a) pelo(a) fisioterapeuta responsável sobre os objetivos, benefícios, métodos, duração estimada e eventuais desconfortos transitórios decorrentes do plano de tratamento fisioterapêutico proposto na clínica {CLINICA}.

Compreendo que a fisioterapia visa a restauração funcional, alívio de sintomas dolorosos e melhora da qualidade de vida, dependendo também do meu comprometimento em seguir as orientações domiciliares, ergonomia e comparecimento às sessões agendadas.

Fui informado(a) de que posso esclarecer dúvidas a qualquer momento do tratamento e que tenho liberdade para revogar este consentimento caso deseje suspender o acompanhamento.`,
    defaultClauses: [
      {
        id: 'c1',
        title: 'Compreensão do Diagnóstico Cinesiológico-Funcional',
        description: 'Fui informado(a) sobre a condição física atual e as condutas terapêuticas indicadas.',
        required: true,
        agreed: true,
      },
      {
        id: 'c2',
        title: 'Ciência sobre Desconfortos Musculares Transitórios',
        description: 'Estou ciente de que dores musculares tardias ou desconfortos leves podem ocorrer após mobilizações e exercícios.',
        required: true,
        agreed: true,
      },
      {
        id: 'c3',
        title: 'Compromisso com o Plano Terapêutico e Orientações',
        description: 'Comprometo-me a seguir os cuidados posturais, exercícios domiciliares e frequência prescrita.',
        required: true,
        agreed: true,
      },
      {
        id: 'c4',
        title: 'Comunicação Imediata de Sintomas Incomuns',
        description: 'Concordo em comunicar imediatamente ao profissional qualquer sensação atípica ou alteração do quadro.',
        required: true,
        agreed: true,
      },
    ],
  },
  {
    id: 'pilates',
    title: 'Termo de Consentimento - Studio de Pilates Clínico & Condicionamento',
    category: 'Pilates Clínico & Postural',
    description: 'Aparelhos Cadillac, Reformer, Chair, Barrel e Mat Pilates.',
    defaultContent: `Eu, {NOME_PACIENTE}, inscrito(a) no CPF nº {CPF}, autorizo minha participação nas aulas/sessões de Pilates Clínico e Condicionamento Funcional conduzidas na clínica {CLINICA}.

Declaro que informei com veracidade todo meu histórico de saúde, lesões prévias, cirurgias, dores articulares e/ou uso de próteses ou medicações. Entendo os princípios do método Pilates (concentração, controle, fluidez, precisão e respiração) e concordo em executar os movimentos sob estrita supervisão do instrutor fisioterapeuta.`,
    defaultClauses: [
      {
        id: 'p1',
        title: 'Veracidade das Informações de Saúde',
        description: 'Confirmo que respondi com precisão a anamnese inicial e informarei qualquer nova condição física.',
        required: true,
        agreed: true,
      },
      {
        id: 'p2',
        title: 'Uso Correto de Aparelhos e Molas',
        description: 'Concordo em aguardar a orientação do instrutor antes de ajustar molas, travas e acessórios dos equipamentos.',
        required: true,
        agreed: true,
      },
      {
        id: 'p3',
        title: 'Vestuário Adequado e Meias Antiderrapantes',
        description: 'Comprometo-me a utilizar roupas confortáveis que permitam amplitude de movimento e meias apropriadas.',
        required: true,
        agreed: true,
      },
    ],
  },
  {
    id: 'dry_needling',
    title: 'TCLE - Agulhamento a Seco (Dry Needling) & Eletroterapia Avançada',
    category: 'Procedimentos Invasivos Mínimos / Eletroanalgesia',
    description: 'Desativação de pontos-gatilho miofasciais e estimulação com agulhas estéreis.',
    defaultContent: `Eu, {NOME_PACIENTE}, CPF nº {CPF}, manifesto minha concordância em ser submetido(a) à técnica de Agulhamento a Seco (Dry Needling) e/ou Eletroterapia invasiva/não-invasiva na clínica {CLINICA}.

Fui esclarecido(a) de que o procedimento utiliza agulhas filiformes estéreis descartáveis de uso único para desativação de pontos-gatilho miofasciais (nódulos de dor), com o objetivo de restaurar a mobilidade tecidual e diminuir a dor.

Fui advertido(a) quanto aos possíveis efeitos esperados: sensação de peso, espasmo local reflexo ("twitch"), pequeno hematoma superficial (equimose) ou dor residual temporária por 24 a 48 horas.`,
    defaultClauses: [
      {
        id: 'dn1',
        title: 'Utilização Exclusiva de Material Descartável Estéril',
        description: 'Fui informado(a) de que as agulhas são 100% descartáveis e abertas na minha presença.',
        required: true,
        agreed: true,
      },
      {
        id: 'dn2',
        title: 'Inexistência de Contraindicações Absolutas',
        description: 'Declaro que não possuo distúrbios graves de coagulação, infecções cutâneas locais ativas ou fobia incontrolável de agulhas.',
        required: true,
        agreed: true,
      },
      {
        id: 'dn3',
        title: 'Ciência sobre Possíveis Hematomas e Dor Pós-Agulhamento',
        description: 'Estou ciente da possibilidade de dor muscular temporária por até 48 horas e pequenos hematomas benignos.',
        required: true,
        agreed: true,
      },
    ],
  },
  {
    id: 'lgpd_privacy',
    title: 'Termo de Consentimento para Tratamento de Dados Pessoais e de Saúde (LGPD)',
    category: 'Privacidade & Proteção de Dados (Lei 13.709/2018)',
    description: 'Armazenamento de prontuário, exames, imagens diagnósticas e comunicações.',
    defaultContent: `Em conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 - LGPD), eu, {NOME_PACIENTE}, CPF {CPF}, consinto livremente que a clínica {CLINICA} colete, armazene e processe meus dados pessoais e dados pessoais sensíveis de saúde para as seguintes finalidades exclusivas:

1. Abertura, evolução e guarda do Prontuário Eletrônico de Saúde pelo prazo legal obrigatório (Resolução COFFITO / CFM).
2. Agendamento, confirmação de horários e lembretes de consultas via WhatsApp/SMS/E-mail.
3. Emissão de recibos, notas fiscais e relatórios para reembolso em planos de saúde.
4. Compartilhamento estritamente clínico entre os profissionais envolvidos na minha linha de cuidado.`,
    defaultClauses: [
      {
        id: 'lgpd1',
        title: 'Guarda Segura de Prontuários e Sigilo Profissional',
        description: 'Autorizo a guarda segura de meus registros clínicos sob sigilo e confidencialidade ética.',
        required: true,
        agreed: true,
      },
      {
        id: 'lgpd2',
        title: 'Envio de Lembretes e Mensagens de Agendamento',
        description: 'Autorizo o envio de lembretes automáticos de consulta e orientações via WhatsApp ou E-mail.',
        required: true,
        agreed: true,
      },
      {
        id: 'lgpd3',
        title: 'Direito de Acesso e Retificação de Dados',
        description: 'Estou ciente de que posso solicitar cópia do meu prontuário e atualizar meus dados cadastrais a qualquer momento.',
        required: true,
        agreed: true,
      },
    ],
  },
  {
    id: 'aesthetic',
    title: 'TCLE - Procedimentos de Fisioterapia Dermatofuncional & Estética',
    category: 'Dermatofuncional & Estética',
    description: 'Radiofrequência, drenagem linfática, ultrassom e remodelamento corporal.',
    defaultContent: `Eu, {NOME_PACIENTE}, CPF nº {CPF}, autorizo a realização de procedimentos em Fisioterapia Dermatofuncional na clínica {CLINICA}.

Fui devidamente orientado(a) sobre a tecnologia utilizada, a necessidade de cuidados pré e pós-procedimento (hidratação, proteção solar, alimentação), o número estimado de sessões e a variabilidade de respostas biológicas individuais.`,
    defaultClauses: [
      {
        id: 'ae1',
        title: 'Orientações Pré e Pós-Sessão',
        description: 'Comprometo-me a seguir as orientações de ingestão hídrica, cuidados com a pele e proteção solar.',
        required: true,
        agreed: true,
      },
      {
        id: 'ae2',
        title: 'Registro Fotográfico Terapêutico Confidencial',
        description: 'Autorizo o registro de fotos de antes/depois para acompanhamento exclusivo no meu prontuário.',
        required: false,
        agreed: true,
      },
    ],
  },
  {
    id: 'custom',
    title: 'Termo de Consentimento Personalizado da Clínica',
    category: 'Modelo Livre Customizável',
    description: 'Crie ou edite cláusulas personalizadas para procedimentos específicos.',
    defaultContent: `Eu, {NOME_PACIENTE}, CPF {CPF}, declaro que fui orientado(a) pela equipe da clínica {CLINICA} em {DATA} sobre o procedimento específico a ser realizado, concordando plenamente com os termos estabelecidos.`,
    defaultClauses: [
      {
        id: 'cu1',
        title: 'Declaração de Consentimento Livre e Esclarecido',
        description: 'Declaro que li, compreendi e concordo com todas as disposições apresentadas.',
        required: true,
        agreed: true,
      },
    ],
  },
];
