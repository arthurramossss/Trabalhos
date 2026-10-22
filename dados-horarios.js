// ============================================================
// DADOS-HORARIOS.JS
// Tudo que o site do CLIENTE (index.html) e o site do BARBEIRO
// (barbeiro.html) precisam em comum: conexão com o banco, horário
// de funcionamento e feriados. Botar num arquivo só evita ter que
// editar a mesma coisa em dois lugares.
//
// Esse arquivo precisa ser carregado DEPOIS da biblioteca do
// Supabase e ANTES do script de cada página.
// ============================================================

// ---------- Conexão com o Supabase ----------
// A chave abaixo é a "publishable" (antiga "anon") — ela é SEGURA
// de ficar aqui no código do site, foi feita pra isso. As regras
// de segurança de verdade ficam no banco (veja os arquivos
// criar-tabela-agendamentos.sql e atualizar-tabela-barbeiros.sql).
var SUPABASE_URL = 'https://zxmzbpeqglcxoyxsmzxe.supabase.co';
var SUPABASE_KEY = 'sb_publishable_9JVaq55qNtC2SmP8z9ZyFQ_GX_G5Tl3';
var supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ---------- Nomes usados nos calendários ----------
var NOMES_MESES_TODOS = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];
var NOMES_SEMANA = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];

// ---------- Horário de funcionamento ----------
// Cada dia da semana tem uma lista de turnos [início, fim] em minutos
// desde a meia-noite. Domingo fica com lista vazia (fechado).
//   0 = Domingo … 6 = Sábado (mesmo padrão do Date.getDay())
function hm(h, m){ return h * 60 + m; }

var FUNCIONAMENTO = {
  0: [],                                                                     // Domingo: fechado
  1: [[hm(9,0), hm(11,15)], [hm(13,35), hm(16,45)], [hm(17,15), hm(20,0)]],   // Segunda
  2: [[hm(7,30), hm(12,0)], [hm(14,0), hm(16,50)], [hm(17,15), hm(19,0)]],    // Terça
  3: [[hm(7,30), hm(11,15)], [hm(13,35), hm(16,50)]],                        // Quarta
  4: [[hm(7,30), hm(11,15)], [hm(13,35), hm(16,50)], [hm(17,15), hm(19,0)]], // Quinta
  5: [[hm(7,30), hm(11,15)], [hm(13,35), hm(16,45)], [hm(17,15), hm(20,0)]], // Sexta
  6: [[hm(7,30), hm(12,0)], [hm(13,30), hm(18,35)]]                          // Sábado
};

// Duração de cada horário oferecido, em minutos.
// Se cada corte durar outro tempo, é só mudar esse número.
var INTERVALO_MINUTOS = 30;

function formatarMinutos(totalMin){
  var h = Math.floor(totalMin / 60);
  var m = totalMin % 60;
  return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
}

function horariosDoDia(diaSemana){
  var turnos = FUNCIONAMENTO[diaSemana];
  var lista = [];
  turnos.forEach(function(turno){
    for(var min = turno[0]; min < turno[1]; min += INTERVALO_MINUTOS){
      lista.push(formatarMinutos(min));
    }
  });
  return lista;
}

// ---------- Feriados de 2026 ----------
// Nacionais + estaduais da Bahia + municipais de Conceição do Coité
// (fonte dos municipais: Decreto Judiciário nº 09/2026 do TJBA).
// Chave = "MM-DD" (sem ano, funciona em qualquer ano). ATENÇÃO:
// Carnaval, Quarta de Cinzas e Corpus Christi mudam de data todo
// ano (dependem da Páscoa) — as datas abaixo são as de 2026; em
// 2027 em diante alguém precisa atualizar essas três à mão. Esses
// três também são "ponto facultativo", não feriado obrigatório —
// como é uma barbearia (negócio privado), quem decide se fecha
// nesses dias é o próprio barbeiro. Se ele quiser abrir, é só
// apagar a linha correspondente.
var FERIADOS = {
  '01-01': 'Confraternização Universal',
  '02-16': 'Carnaval (ponto facultativo)',
  '02-17': 'Carnaval (ponto facultativo)',
  '02-18': 'Quarta-feira de Cinzas (ponto facultativo)',
  '04-03': 'Sexta-feira Santa',
  '04-21': 'Tiradentes',
  '05-01': 'Dia do Trabalho',
  '06-04': 'Corpus Christi (ponto facultativo)',
  '06-24': 'São João / aniversário de Conceição do Coité',
  '07-02': 'Independência da Bahia',
  '07-07': 'Aniversário de Conceição do Coité',
  '08-16': 'Aniversário de Conceição do Coité',
  '09-07': 'Independência do Brasil',
  '09-23': 'Aniversário de Conceição do Coité',
  '10-12': 'Nossa Senhora Aparecida',
  '11-02': 'Finados',
  '11-15': 'Proclamação da República',
  '11-20': 'Consciência Negra',
  '12-08': 'Nossa Senhora da Conceição da Praia / aniversário de Conceição do Coité',
  '12-25': 'Natal'
};

function feriadoDoDia(data){
  var mm = (data.getMonth() + 1 < 10 ? '0' : '') + (data.getMonth() + 1);
  var dd = (data.getDate() < 10 ? '0' : '') + data.getDate();
  return FERIADOS[mm + '-' + dd] || null;
}

// ---------- Data no formato do banco (AAAA-MM-DD) ----------
function paraISO(data){
  var mm = (data.getMonth() + 1 < 10 ? '0' : '') + (data.getMonth() + 1);
  var dd = (data.getDate() < 10 ? '0' : '') + data.getDate();
  return data.getFullYear() + '-' + mm + '-' + dd;
}
