import React from 'react';
import './formacao-claude.css';

// Landing da Formação Presencial em Claude (Escol.ai), portada da LP feita no
// claude.ai, no mesmo modelo do RH Experience Lab. A inscrição é o formulário da
// própria LP, sem login e sem currículo: cada participante vira uma candidatura
// da vaga do evento (POST /api/public/eventos/formacao-claude/inscricao) e chega
// no admin do Vagas como qualquer candidatura, com turma, empresa, cargo e quem
// inscreveu na mensagem. A vaga não aparece na listagem pública
// (jobs.listada = false); só existe para receber as inscrições.
//
// Arquivos (logo, fotos, prévia e ícones) em public/jobs/formacao-claude/.
const { useEffect, useRef, useState } = React;

const BASE = '/jobs/formacao-claude/';
const API_INSCRICAO = '/api/public/eventos/formacao-claude/inscricao';
const API_VAGAS = '/api/public/eventos/formacao-claude/vagas'; // vagas restantes por turma (limite de 30)
const PRECO = 2500;
// Cupons de parceiros. A chave é o SHA-256 do código em maiúsculas (o código não aparece
// no fonte da página). Valor = desconto em reais por participante.
// Para criar outro cupom, gere o SHA-256 do código e adicione aqui.
// O desconto aqui só mostra o valor na tela: o servidor (API de inscrição) e o Asaas
// precisam validar o cupom e cobrar o valor certo.
const CUPONS = {
  '6ffbb87e10df60338342877f8fd9fce9021e3fcd78d19ad0895b0e6e189c5210': 100,
};
async function hashCupom(codigo) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codigo));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
}
const INICIO_TURMA_1 = new Date('2026-12-07T19:00:00-03:00');

const TURMAS = [
  { id: 'Turma 1', titulo: 'TURMA 1', datas: '7 a 11 de dezembro', curto: '7, 8, 9 e 11/12', dias: ['Seg 7/12', 'Ter 8/12', 'Qua 9/12', 'Sex 11/12'] },
  { id: 'Turma 2', titulo: 'TURMA 2', datas: '14 a 17 de dezembro', curto: '14, 15, 16 e 17/12', dias: ['Seg 14/12', 'Ter 15/12', 'Qua 16/12', 'Qui 17/12'] },
];

const STATS = [
  ['88%', 'das empresas já usam IA com frequência em pelo menos uma área do negócio.', 'McKinsey, The State of AI in 2025'],
  ['62%', 'já testam ou escalam agentes de IA, que executam tarefas inteiras sozinhos.', 'McKinsey, The State of AI in 2025'],
  ['95%', 'dos pilotos de IA generativa não geram impacto mensurável no resultado financeiro.', 'MIT NANDA, The GenAI Divide (2025)'],
];

const NIVEIS = [
  { code: 'L0', cor: '#F2603D', h: 40, titulo: 'Não uso', texto: 'Ou uso como se fosse o Google.' },
  { code: 'L1', cor: '#E0607A', h: 80, titulo: 'Básico', texto: 'Chat para e-mails, textos e imagens.', badge: 'A maioria está aqui', classe: 'here' },
  { code: 'L2', cor: '#C46DB0', h: 120, titulo: 'Essencial', texto: 'Projetos, skills, conectores e escolha de modelos.' },
  { code: 'L3', cor: '#9A78F2', h: 160, titulo: 'Intermediário', texto: 'Agentes, automações e integrações.', badge: 'Você sai daqui', classe: 'goal' },
  { code: 'L4', cor: '#6C5CE7', barra: '#5B45E8', h: 200, titulo: 'Avançado', texto: 'Orquestração de agentes e melhoria contínua.' },
];

const PARA_QUEM = [
  ['Quem sabe que dá para fazer mais com IA', 'E quer parar de adiar e aprender com método.'],
  ['Quem faz planilhas e slides à mão', 'E quer ganhar horas na semana com a IA fazendo o trabalho pesado.'],
  ['Quem quer delegar o operacional', 'Com skills e assistentes respondendo e-mails e fazendo parte do trabalho do dia a dia.'],
  ['Quem quer criar seus próprios agentes', 'E sair do curso com fluxos prontos para usar no trabalho.'],
];

const METODO = [
  ['bolt', 'Mão na massa em todo encontro', 'Atividades práticas no Claude, com tarefas reais do seu trabalho.'],
  ['grupo', 'Prática em grupo', 'A turma discute, compara soluções e aprende junto com outros profissionais.'],
  ['livro', 'Teoria só como apoio', 'Explicação curta, e logo a turma vai para a prática.'],
];

const PARTES = [
  {
    nome: 'PARTE 1', titulo: 'Cenário e diagnóstico', modulos: [
      ['01', 'Panorama da IA', 'A evolução da IA e por que agora mudou o jogo para os negócios.'],
      ['02', 'Principais ferramentas', 'ChatGPT, Gemini, Claude, Copilot e outras: o que cada uma faz melhor.'],
      ['03', 'Ferramentas x áreas', 'As melhores IAs para financeiro, RH, comercial, operações e atendimento.'],
      ['04', 'Os 5 níveis de IA', 'O mapa de maturidade: do "não uso" à orquestração de agentes.'],
      ['05', 'Assessment ao vivo', 'Cada pessoa identifica o próprio nível com IA e vê o próximo passo.'],
      ['06', 'Engenharia de prompt', 'Objetivo, contexto e formato de saída para receber exatamente o que precisa.'],
    ],
  },
  {
    nome: 'PARTE 2', titulo: 'Prática e aplicação', modulos: [
      ['07', 'Engenharia de contexto', 'Documentos, exemplos e regras certas para respostas confiáveis.'],
      ['08', 'Conectores e Skills', 'Gmail, Docs e Planilhas: e-mails, relatórios e análises em minutos.'],
      ['09', 'Desafio prático', 'Cada participante resolve uma tarefa real do seu trabalho com IA, ao vivo.'],
      ['10', 'Cases de sucesso', 'O que empresas do mercado já ganham com IA em tempo, custo e receita.'],
      ['11', 'Agentes de IA', 'Cada participante cria o primeiro agente para uma tarefa do seu trabalho.'],
      ['12', 'Segurança e governança', 'Dados que não entram na IA, LGPD, ferramentas aprovadas e revisão humana.'],
    ],
  },
];

const FATOS = [
  ['relogio', '19h às 21h30', '4 noites, 10 horas de formação.'],
  ['pino', 'Escritório da Escol.ai', 'Rua Tangará, 132 · Vila Mariana, São Paulo.'],
  ['bolt', 'Aulas práticas', 'No Claude, com tarefas reais do trabalho.'],
  ['grupo', 'Troca entre profissionais', 'Turma presencial, aprendendo junto.'],
];

const PROFESSORES = [
  {
    foto: 'pietro.jpg', nome: 'Pietro Baptista', papel: 'Professor · Fundador e CEO da Escol.ai',
    texto: 'Foi professor por 5 anos no Instituto TOTVS, nos cursos de gestão empresarial. Liderou programas de treinamento em empresas de marketing e tecnologia.',
    formacao: 'PUC-SP, ESPM e Insper', carreira: 'TOTVS, Novo Nordisk, Cia. Hering, Locaweb e Cyrela',
  },
  {
    foto: 'danilo.jpg', nome: 'Danilo Sousa', papel: 'Professor · CTO da Escol.ai',
    texto: 'Cientista de dados. Foi professor no SENAI e no Senac, líder de BI na Droga Leste e hoje está à frente de todos os projetos de IA da Escol.ai.',
    formacao: 'FIAP · Sistemas de Informação e pós em Data Science e IA', carreira: 'TOTVS, Mutant, Droga Leste, Senac, SENAI e Gocase',
  },
];

const NUMEROS = [['+50', 'empresas atendidas'], ['+20 mil', 'pessoas impactadas'], ['+2 anos', 'ensinando e usando IA todos os dias']];

const CASES = [
  ['LWSA', '+5.000 pessoas treinadas e um agente de reembolso que levou o processo de dias para minutos. NPS 88.'],
  ['GoGroup', 'R$ 800 mil gerados por um agente de lembrete de pagamento, criado na formação do administrativo. NPS 92.'],
  ['V.tal', '30 líderes saíram dos workshops com agentes criados por eles mesmos. NPS 90.'],
  ['Mundial Logistics', '+70 pessoas treinadas em IA para liderança e atendimento. NPS 96.'],
];

const LOGOS = ['Livelo', 'Cyrela', 'Locaweb', 'SPC Brasil', 'DPaschoal', 'Fidelidade', 'Vivaz', 'Wake', 'Gocase', 'Credsystem', 'Buddha Spa', 'Dona Deôla', 'V.tal', 'Abril'];

const CHECKS = [
  'Usar o Claude além do básico', 'Engenharia de prompt e de contexto', 'Conectores e skills no dia a dia',
  'Planilhas, relatórios e slides com IA', 'Criar seu primeiro agente', 'Usar IA com segurança',
];

const ICONES = {
  cal: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
  relogio: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  pino: <><path d="M12 21s-7-6.1-7-11a7 7 0 1 1 14 0c0 4.9-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></>,
  bolt: <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />,
  grupo: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><circle cx="17" cy="9" r="2.5" /><path d="M16 14.2a5 5 0 0 1 5.5 5.8" /></>,
  livro: <><path d="M4 19.5V5a2 2 0 0 1 2-2h14v15H6a2 2 0 0 0-2 2z" /><path d="M8 7h8M8 11h6" /></>,
  check: <path d="M20 6 9 17l-5-5" />,
};

function Icone({ n, largura = 2, ...resto }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={largura} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...resto}>
      {ICONES[n]}
    </svg>
  );
}

const Seta = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

function rolarPara(id) {
  return (e) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
}

const brl = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

function mascaraTelefone(valor) {
  let v = valor.replace(/\D/g, '').slice(0, 11);
  if (v.length > 6) v = `(${v.slice(0, 2)}) ${v.slice(2, v.length - 4)}-${v.slice(-4)}`;
  else if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
  return v;
}

const valido = {
  texto: (v) => v.trim().length > 1,
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
  tel: (v) => v.replace(/\D/g, '').length >= 10,
};

let seq = 0;
const novaPessoa = () => ({ id: ++seq, nome: '', email: '', whatsapp: '', cargo: '', turma: 'mesma' });

function Formulario() {
  const [dados, setDados] = useState({ nome: '', email: '', whatsapp: '', empresa: '', cargo: '' });
  const [turma, setTurma] = useState('Turma 1');
  const [euVou, setEuVou] = useState(true);
  const [pessoas, setPessoas] = useState([]);
  const [consent, setConsent] = useState(false);
  const [tentou, setTentou] = useState(false);
  const [erro, setErro] = useState('');
  const [estado, setEstado] = useState('livre'); // livre | enviando | feito
  const [resultado, setResultado] = useState(null);
  const honeypot = useRef(null);
  const sucessoRef = useRef(null);
  const ultimaPessoa = useRef(null);
  const [vagas, setVagas] = useState(null); // { 'Turma 1': { limite, restantes }, ... }
  const [cupomTexto, setCupomTexto] = useState('');
  const [cupom, setCupom] = useState(null); // { codigo, desconto } quando válido
  const [cupomMsg, setCupomMsg] = useState({ tipo: '', texto: '' });

  async function aplicarCupom(valor = cupomTexto) {
    const codigo = valor.trim().toUpperCase().replace(/\s+/g, '');
    setCupomTexto(codigo);
    if (!codigo) { setCupom(null); setCupomMsg({ tipo: '', texto: '' }); return; }
    const desconto = CUPONS[await hashCupom(codigo)];
    if (desconto) {
      setCupom({ codigo, desconto });
      setCupomMsg({ tipo: 'ok', texto: `Cupom aplicado: ${brl(desconto)} de desconto por participante.` });
    } else {
      setCupom(null);
      setCupomMsg({ tipo: 'bad', texto: 'Cupom não encontrado. Confira o código e tente de novo.' });
    }
  }
  // Link de parceiro: ?cupom=CODIGO já preenche e aplica
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get('cupom');
    if (c) aplicarCupom(c);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const carregarVagas = () => fetch(API_VAGAS).then((r) => (r.ok ? r.json() : null)).then((v) => v && setVagas(v)).catch(() => {});
  useEffect(() => { carregarVagas(); }, []);
  const lotada = (t) => vagas?.[t] ? vagas[t].restantes <= 0 : vagas ? !vagas[t] : false;
  // Turma escolhida lotou: passa para a outra, se ela tiver vaga.
  useEffect(() => {
    if (!vagas || !lotada(turma)) return;
    const outra = TURMAS.find((t) => !lotada(t.id));
    if (outra) setTurma(outra.id);
  }, [vagas]); // eslint-disable-line react-hooks/exhaustive-deps
  const avisoVagas = (t) => {
    const v = vagas?.[t];
    if (!vagas) return null;
    if (!v || v.restantes <= 0) return 'Turma esgotada';
    return v.restantes <= 10 ? `Últimas ${v.restantes} ${v.restantes === 1 ? 'vaga' : 'vagas'}` : `${v.restantes} vagas`;
  };

  const total = (euVou ? 1 : 0) + pessoas.length;
  const desconto = cupom ? cupom.desconto : 0;
  const valorTotal = (n) => n * Math.max(0, PRECO - desconto);

  const campo = (k, v) => setDados((d) => ({ ...d, [k]: k === 'whatsapp' ? mascaraTelefone(v) : v }));
  const campoPessoa = (id, k, v) => setPessoas((ps) => ps.map((p) => (p.id === id ? { ...p, [k]: k === 'whatsapp' ? mascaraTelefone(v) : v } : p)));
  const adicionar = () => setPessoas((ps) => [...ps, novaPessoa()]);
  useEffect(() => { ultimaPessoa.current?.focus(); }, [pessoas.length]);

  const marca = (ok) => (tentou && !ok ? 'err' : undefined);
  const responsavelOk = valido.texto(dados.nome) && valido.email(dados.email) && valido.tel(dados.whatsapp)
    && valido.texto(dados.empresa) && valido.texto(dados.cargo);
  const pessoasOk = pessoas.every((p) => valido.texto(p.nome) && valido.email(p.email) && valido.tel(p.whatsapp) && valido.texto(p.cargo));

  async function enviar(e) {
    e.preventDefault();
    setTentou(true);
    setErro('');
    if (!responsavelOk || !pessoasOk) { setErro('Confira os campos destacados.'); return; }
    if (total < 1) { setErro('Inclua pelo menos um participante.'); return; }
    if (!consent) { setErro('Para enviar, marque a autorização de uso dos dados.'); return; }
    const q = new URLSearchParams(window.location.search);
    const payload = {
      responsavel: { ...dados },
      turma,
      eu_vou: euVou,
      participantes: pessoas.map((p) => ({ nome: p.nome, email: p.email, whatsapp: p.whatsapp, cargo: p.cargo, turma: p.turma === 'mesma' ? turma : p.turma })),
      consentimento: true,
      cupom: cupom ? cupom.codigo : '',
      site: honeypot.current?.value || '',
      origem: ['utm_source', 'utm_medium', 'utm_campaign', 'ref'].reduce((o, k) => ({ ...o, [k]: q.get(k) || '' }), {}),
    };
    setEstado('enviando');
    try {
      const res = await fetch(API_INSCRICAO, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const json = await res.json().catch(() => ({}));
      if (res.status === 409) carregarVagas();
      if (!res.ok) throw new Error(json.error || 'Não foi possível enviar agora. Tente de novo em instantes.');
      setResultado({ inscritos: json.inscritos ?? total, ja: json.ja_inscritos ?? 0, desconto });
      setEstado('feito');
      setTimeout(() => {
        document.getElementById('inscricao')?.scrollIntoView({ behavior: 'smooth' });
        sucessoRef.current?.focus();
      }, 0);
    } catch (err) {
      setErro(err.message);
      setEstado('livre');
    }
  }

  if (estado === 'feito') {
    const n = resultado.inscritos + resultado.ja;
    const convite = `Vou fazer a Formação Presencial em Claude da Escol.ai: 4 noites em SP, do zero ao primeiro agente. Bora junto? ${window.location.origin}/?utm_source=indicacao`;
    return (
      <div className="form-card">
        <div className="success" style={{ display: 'block' }} role="status" tabIndex={-1} ref={sucessoRef}>
          <div className="icon"><Icone n="check" largura={2.6} style={{ width: 30, height: 30 }} /></div>
          <h3>Inscrição recebida!</h3>
          <p>
            {n === 1 ? '1 participante inscrito' : `${n} participantes inscritos`} ({brl(n * Math.max(0, PRECO - (resultado.desconto || 0)))}). Vamos confirmar as vagas pelo
            WhatsApp e enviar o boleto por e-mail.
            {resultado.ja > 0 && ` ${resultado.ja === 1 ? '1 pessoa já estava inscrita' : `${resultado.ja} pessoas já estavam inscritas`} e não foi duplicada.`}
          </p>
          <a href={`https://wa.me/?text=${encodeURIComponent(convite)}`} className="btn btn-ghost" style={{ marginTop: 24 }} target="_blank" rel="noopener noreferrer">
            Enviar para um colega no WhatsApp
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="form-card">
      <form noValidate onSubmit={enviar}>
        <h3>Formação Presencial em Claude</h3>
        <p className="hint">Todos os campos são obrigatórios.</p>

        <div className="fs">
          <div className="fs-title">1. Seus dados</div>
          <div className="grid2">
            <label className="f">Nome completo<input name="nome" autoComplete="name" value={dados.nome} onChange={(e) => campo('nome', e.target.value)} className={marca(valido.texto(dados.nome))} /></label>
            <label className="f">E-mail profissional<input name="email" type="email" autoComplete="email" value={dados.email} onChange={(e) => campo('email', e.target.value)} className={marca(valido.email(dados.email))} /></label>
            <label className="f">WhatsApp<input name="whatsapp" type="tel" inputMode="tel" autoComplete="tel" placeholder="(11) 90000-0000" value={dados.whatsapp} onChange={(e) => campo('whatsapp', e.target.value)} className={marca(valido.tel(dados.whatsapp))} /></label>
            <label className="f">Empresa<input name="empresa" autoComplete="organization" value={dados.empresa} onChange={(e) => campo('empresa', e.target.value)} className={marca(valido.texto(dados.empresa))} /></label>
            <label className="f">Cargo<input name="cargo" autoComplete="organization-title" value={dados.cargo} onChange={(e) => campo('cargo', e.target.value)} className={marca(valido.texto(dados.cargo))} /></label>
          </div>
        </div>

        <div className="fs">
          <div className="fs-title">2. Turma</div>
          <div className="radios">
            {TURMAS.map((t) => (
              <label className="radio" key={t.id} style={lotada(t.id) ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}>
                <input type="radio" name="turma" value={t.id} checked={turma === t.id} disabled={lotada(t.id)} onChange={() => setTurma(t.id)} />
                <div>
                  <b>{t.id}</b><span>{t.curto} · 19h às 21h30</span>
                  {avisoVagas(t.id) && <span style={{ display: 'block', marginTop: 6, fontWeight: 700, color: lotada(t.id) ? '#F79A84' : 'var(--violet)' }}>{avisoVagas(t.id)}</span>}
                </div>
              </label>
            ))}
          </div>
          <label className="check"><input type="checkbox" checked={euVou} onChange={(e) => setEuVou(e.target.checked)} /> Eu também vou participar da formação</label>
        </div>

        <div className="fs">
          <div className="fs-title">3. Pessoas da sua empresa <span style={{ color: 'var(--muted)', letterSpacing: 0, textTransform: 'none', fontWeight: 600 }}>(opcional)</span></div>
          <div className="people">
            {pessoas.map((p, i) => (
              <div className="person" key={p.id}>
                <div className="person-head"><b>Participante {i + 1}</b><button type="button" className="rm" onClick={() => setPessoas((ps) => ps.filter((x) => x.id !== p.id))}>Remover</button></div>
                <div className="grid2">
                  <label className="f">Nome completo<input ref={i === pessoas.length - 1 ? ultimaPessoa : undefined} value={p.nome} onChange={(e) => campoPessoa(p.id, 'nome', e.target.value)} className={marca(valido.texto(p.nome))} /></label>
                  <label className="f">E-mail profissional<input type="email" value={p.email} onChange={(e) => campoPessoa(p.id, 'email', e.target.value)} className={marca(valido.email(p.email))} /></label>
                  <label className="f">WhatsApp<input type="tel" inputMode="tel" placeholder="(11) 90000-0000" value={p.whatsapp} onChange={(e) => campoPessoa(p.id, 'whatsapp', e.target.value)} className={marca(valido.tel(p.whatsapp))} /></label>
                  <label className="f">Cargo<input value={p.cargo} onChange={(e) => campoPessoa(p.id, 'cargo', e.target.value)} className={marca(valido.texto(p.cargo))} /></label>
                  <label className="f">Turma
                    <select value={p.turma} onChange={(e) => campoPessoa(p.id, 'turma', e.target.value)}>
                      <option value="mesma">Mesma turma que a minha</option>
                      {TURMAS.map((t) => <option key={t.id} value={t.id} disabled={lotada(t.id)}>{t.id} · {t.curto}{lotada(t.id) ? ' (esgotada)' : ''}</option>)}
                    </select>
                  </label>
                </div>
              </div>
            ))}
          </div>
          <button type="button" className="add" onClick={adicionar}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
            Adicionar participante
          </button>
        </div>

        {/* armadilha para robô: pessoas não veem este campo */}
        <input ref={honeypot} type="text" name="site" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />

        <div className="fs">
          <div className="fs-title">4. Cupom <span style={{ color: 'var(--muted)', letterSpacing: 0, textTransform: 'none', fontWeight: 600 }}>(opcional)</span></div>
          <div className="coupon">
            <label className="f" htmlFor="cupom" style={{ flex: 1, minWidth: 0 }}>
              Código do cupom
              <input
                id="cupom" name="cupom" autoComplete="off" autoCapitalize="characters" spellCheck={false}
                value={cupomTexto}
                onChange={(e) => { setCupomTexto(e.target.value); if (cupom) { setCupom(null); setCupomMsg({ tipo: '', texto: '' }); } }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); aplicarCupom(); } }}
              />
            </label>
            <button type="button" className="btn btn-ghost" onClick={() => aplicarCupom()}>Aplicar</button>
          </div>
          <div className={`coupon-msg ${cupomMsg.tipo}`} role="status" aria-live="polite">{cupomMsg.texto}</div>
        </div>

        <div className="summary">
          <div>
            <div className="t">Total de participantes: <b>{total}</b></div>
            <div className="t">
              {cupom
                ? `${brl(PRECO - cupom.desconto)} por pessoa com o cupom ${cupom.codigo} · boleto após a confirmação`
                : 'R$ 2.500 por pessoa · boleto após a confirmação'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            {cupom && <div className="t"><s>{brl(total * PRECO)}</s></div>}
            <div className="v grad-text">{brl(valorTotal(total))}</div>
          </div>
        </div>

        <label className="check"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} /> Autorizo a Escol.ai a usar os dados informados para entrar em contato sobre esta formação, conforme a LGPD. Posso revogar a autorização a qualquer momento.</label>
        <div className="form-msg" role="alert">{erro}</div>
        <button type="submit" className="btn btn-primary" disabled={estado === 'enviando'}>{estado === 'enviando' ? 'Enviando...' : 'Enviar inscrição'}</button>
      </form>
    </div>
  );
}

function useContagem() {
  const [texto, setTexto] = useState('--');
  useEffect(() => {
    const tick = () => {
      const ms = INICIO_TURMA_1 - new Date();
      if (ms <= 0) { setTexto('Turma 2: 14/12'); return; }
      const d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60;
      setTexto(`${d}d ${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`);
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);
  return texto;
}

export default function FormacaoClaudeLanding() {
  const contagem = useContagem();
  const [mostrarBarra, setMostrarBarra] = useState(false);

  // Fonte da LP (o Vagas já usa o Google Fonts para a Inter).
  useEffect(() => {
    const id = 'fonte-manrope';
    if (document.getElementById(id)) return;
    const l = document.createElement('link');
    l.id = id; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap';
    document.head.appendChild(l);
  }, []);

  // Barra fixa: aparece depois da capa e some quando o formulário está na tela.
  useEffect(() => {
    const onScroll = () => {
      const form = document.getElementById('inscricao');
      const r = form?.getBoundingClientRect();
      const noForm = r ? r.top < window.innerHeight && r.bottom > 0 : false;
      setMostrarBarra(window.scrollY > window.innerHeight * 0.7 && !noForm);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const inscrever = rolarPara('inscricao');

  return (
    <div className="fpc">
      <div className="topbar" />

      <header className="hero">
        <div className="wrap">
          <nav className="nav">
            <img src={`${BASE}logo.png`} alt="Escol.ai" />
            <a href="#inscricao" className="btn btn-ghost" onClick={inscrever}>Inscrever-se</a>
          </nav>
          <div className="hero-grid">
            <div>
              <span className="eyebrow">Formação presencial · Dezembro 2026</span>
              <h1>Formação Presencial em Claude</h1>
              <div className="sub grad-text">do zero ao primeiro agente</div>
              <p className="desc">Para quem já usa IA no básico e quer destravar o potencial da ferramenta. São 4 noites de mão na massa no Claude, com tarefas reais do seu trabalho, e você sai com o seu primeiro agente funcionando.</p>
              <div className="chips">
                <span className="chip"><Icone n="cal" />4 noites</span>
                <span className="chip"><Icone n="relogio" />19h às 21h30</span>
                <span className="chip"><Icone n="pino" />Escritório Escol.ai · Vila Mariana</span>
              </div>
              <div className="hero-ctas">
                <a href="#inscricao" className="btn btn-primary" onClick={inscrever}>Quero me inscrever <Seta /></a>
                <a href="#conteudo" className="btn btn-ghost" onClick={rolarPara('conteudo')}>Ver o conteúdo</a>
              </div>
            </div>
            <div className="hero-photo">
              <img src={`${BASE}turma.jpg`} alt="Turma da Escol.ai em aula prática de Claude, com o professor Danilo Sousa no telão" />
              <div className="tag"><b>Turma 1:</b> 7, 8, 9 e 11/12 &nbsp;·&nbsp; <b>Turma 2:</b> 14 a 17/12</div>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section id="video" style={{ paddingTop: 40 }}>
          <div className="wrap video-grid">
            <div>
              <span className="eyebrow">O convite em vídeo</span>
              <h2>Veja em 34 segundos <span className="grad-text">como é a formação</span>.</h2>
              <p className="lead">Um intensivo presencial e 100% prático, para quem gosta de aprender fazendo. Você sai usando o Claude no dia a dia do seu trabalho.</p>
              <div className="video-points">
                {['Skills e conectores com Gmail, Docs e Planilhas', 'Seu primeiro agente de IA, criado em aula', 'Turma presencial, trocando com outros profissionais'].map((t) => (
                  <div key={t}><Icone n="check" largura={2.4} />{t}</div>
                ))}
              </div>
              <a href="#inscricao" className="btn btn-primary" style={{ marginTop: 32 }} onClick={inscrever}>Quero me inscrever</a>
            </div>
            <div className="vplayer">
              <video src={`${BASE}convite.mp4#t=0.5`} controls playsInline preload="metadata" aria-label="Vídeo de convite da Formação Presencial em Claude" />
            </div>
          </div>
        </section>

        <section id="cenario" style={{ background: 'var(--bg2)' }}>
          <div className="wrap center reveal">
            <span className="eyebrow">Por que agora</span>
            <h2>As empresas já foram além do básico.<br /><span className="grad-text">A maioria das pessoas, não.</span></h2>
            <p className="lead">Quem garante o retorno da IA é o time de negócios, mas a maior parte ainda usa a ferramenta só para e-mails, textos e imagens, sem saber automatizar processos.</p>
            <div className="stats">
              {STATS.map(([n, t, f]) => <div className="stat" key={n}><div className="n grad-text">{n}</div><p>{t}</p><small>{f}</small></div>)}
            </div>
          </div>
        </section>

        <section id="niveis">
          <div className="wrap reveal">
            <span className="eyebrow">Níveis de IA</span>
            <h2>Onde você está hoje,<br />e <span className="grad-text">aonde vai chegar</span>.</h2>
            <p className="lead">A formação leva você do uso básico de chat até criar agentes e automações aplicados ao seu dia a dia.</p>
            <div className="levels">
              {NIVEIS.map((l) => (
                <div className={`lvl${l.classe ? ` ${l.classe}` : ''}`} key={l.code}>
                  {l.badge && <span className="badge">{l.badge}</span>}
                  <div className="code" style={{ color: l.cor }}>{l.code}</div>
                  <h3>{l.titulo}</h3>
                  <p>{l.texto}</p>
                  <div className="bar" style={{ '--h': `${l.h}px`, '--c': l.barra || l.cor }} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="para-quem" style={{ background: 'var(--bg2)' }}>
          <div className="wrap two">
            <div className="reveal">
              <span className="eyebrow">Para quem é</span>
              <h2>Para quem já usa IA e quer <span className="grad-text">produzir mais</span> no dia a dia.</h2>
              <div className="list">
                {PARA_QUEM.map(([t, p], i) => (
                  <div className="li" key={t}><div className="num grad-text">{String(i + 1).padStart(2, '0')}</div><div><h3>{t}</h3><p>{p}</p></div></div>
                ))}
              </div>
            </div>
            <div className="side-photo reveal"><img src={`${BASE}palco.jpg`} alt="Danilo Sousa em palestra sobre IA nas empresas" /></div>
          </div>
        </section>

        <section id="metodologia">
          <div className="wrap center reveal">
            <span className="eyebrow">Metodologia</span>
            <h2>Aqui você <span className="grad-text">aprende fazendo</span>.</h2>
            <p className="lead">Adultos retêm muito mais quando praticam e ensinam do que quando só ouvem: cerca de 75% praticando, contra 5% em aula expositiva. Por isso a formação é montada no topo da pirâmide de aprendizagem.</p>
            <div className="method">
              {METODO.map(([ic, t, p]) => <div className="mcard" key={t}><div className="icon"><Icone n={ic} /></div><h3>{t}</h3><p>{p}</p></div>)}
            </div>
          </div>
        </section>

        <section id="conteudo" style={{ background: 'var(--bg2)' }}>
          <div className="wrap reveal">
            <span className="eyebrow">Conteúdo programático</span>
            <h2>12 módulos, do panorama ao <span className="grad-text">seu primeiro agente</span>.</h2>
            {PARTES.map((parte) => (
              <div className="part" key={parte.nome}>
                <div className="part-head"><b>{parte.nome}</b><span>{parte.titulo}</span></div>
                <div className="mods">
                  {parte.modulos.map(([n, t, p]) => <div className="mod" key={n}><div className="n">{n}</div><h3>{t}</h3><p>{p}</p></div>)}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="formato" className="light">
          <div className="wrap reveal">
            <span className="eyebrow">Formato e datas</span>
            <h2>Escolha a sua turma.</h2>
            <p className="lead">Cada turma tem 4 encontros presenciais à noite, em São Paulo. O conteúdo é o mesmo nas duas.</p>
            <div className="turmas">
              {TURMAS.map((t) => (
                <div className="turma" key={t.id}><b>{t.titulo}</b><div className="dates">{t.datas}</div><div className="days">{t.dias.map((d) => <span className="day" key={d}>{d}</span>)}</div></div>
              ))}
            </div>
            <div className="facts">
              {FATOS.map(([ic, t, p]) => <div className="fact" key={t}><Icone n={ic} /><h3>{t}</h3><p>{p}</p></div>)}
            </div>
          </div>
        </section>

        <section id="professores">
          <div className="wrap reveal">
            <span className="eyebrow">Professores</span>
            <h2>Quem vai conduzir a <span className="grad-text">formação</span>.</h2>
            <div className="profs">
              {PROFESSORES.map((p) => (
                <div className="prof" key={p.nome}>
                  <img src={`${BASE}${p.foto}`} alt={p.nome} />
                  <div className="body">
                    <h3>{p.nome}</h3>
                    <div className="role grad-text">{p.papel}</div>
                    <p>{p.texto}</p>
                    <div className="meta">
                      <div><b>FORMAÇÃO</b>{p.formacao}</div>
                      <div><b>CARREIRA</b>{p.carreira}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="cases" style={{ background: 'var(--bg2)' }}>
          <div className="wrap reveal">
            <div className="center">
              <span className="eyebrow">Quem somos</span>
              <h2>A Escol.ai leva IA para o <span className="grad-text">dia a dia dos times</span>.</h2>
              <p className="lead">Somos uma empresa AI First, especialista em educação e IA.</p>
            </div>
            <div className="proof">
              {NUMEROS.map(([n, p]) => <div className="stat" key={n}><div className="n grad-text">{n}</div><p>{p}</p></div>)}
            </div>
            <div className="cases">
              {CASES.map(([t, p]) => <div className="case" key={t}><b>CASE</b><h3>{t}</h3><p>{p}</p></div>)}
            </div>
            <div className="logos">{LOGOS.map((l) => <span key={l}>{l}</span>)}</div>
          </div>
        </section>

        <section id="investimento">
          <div className="wrap reveal">
            <span className="eyebrow">Investimento</span>
            <h2>Uma formação completa, <span className="grad-text">pronta para aplicar</span>.</h2>
            <div className="price-card">
              <div>
                <div className="price-old"><span>De</span> <s>R$ 3.000</s> <span className="off">Desconto de R$ 500</span></div>
                <div className="price grad-text">R$ 2.500</div>
                <div className="per">por pessoa · 4 encontros presenciais noturnos</div>
                <div className="per" style={{ fontSize: 16, fontWeight: 600, color: 'var(--muted)', marginTop: 10 }}>Pagamento por boleto, emitido depois que a inscrição é confirmada.</div>
                <a href="#inscricao" className="btn btn-primary" style={{ marginTop: 28 }} onClick={inscrever}>Garantir minha vaga</a>
              </div>
              <div className="checks">
                {CHECKS.map((c) => <div key={c}><Icone n="check" largura={2.4} />{c}</div>)}
              </div>
            </div>
          </div>
        </section>

        <section id="inscricao" style={{ background: 'var(--bg2)' }}>
          <div className="wrap">
            <div className="center reveal">
              <span className="eyebrow">Inscrição</span>
              <h2>Garanta sua vaga e <span className="grad-text">leve o seu time</span>.</h2>
              <p className="lead">Preencha seus dados e, se quiser, inscreva também pessoas da sua empresa no mesmo formulário. Depois de confirmar as vagas, enviamos o boleto para pagamento.</p>
            </div>
            <Formulario />
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap">
          <img src={`${BASE}logo.png`} alt="Escol.ai" />
          <span>Escol.ai · Impulsionar negócios por meio do conhecimento.</span>
        </div>
      </footer>

      <div className={`sticky${mostrarBarra ? ' show' : ''}`}>
        <div className="cd"><span className="dot" /><span className="lbl">Turma 1 começa em</span> <b>{contagem}</b></div>
        <a href="#inscricao" className="btn btn-primary" onClick={inscrever}>Inscrever-se</a>
      </div>
    </div>
  );
}
