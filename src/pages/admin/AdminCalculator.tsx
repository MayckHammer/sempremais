import { useMemo, useState } from 'react';

const fmt = (v: number) => 'R$ ' + v.toFixed(2).replace('.', ',');

const CATEGORY_OPTIONS = [
  { value: '60a', label: 'Estética e Beleza (taxa 60%)', rate: 60 },
  { value: '65a', label: 'Saúde e Odontologia (taxa 65%)', rate: 65 },
  { value: '50', label: 'Alimentação (taxa 50%)', rate: 50 },
  { value: '60b', label: 'Serviços Automotivos (taxa 60%)', rate: 60 },
  { value: '70a', label: 'Educação e Cursos (taxa 70%)', rate: 70 },
  { value: '55', label: 'Varejo e Comércio (taxa 55%)', rate: 55 },
  { value: '65b', label: 'Turismo e Lazer (taxa 65%)', rate: 65 },
  { value: '70b', label: 'Marketing e Design (taxa 70%)', rate: 70 },
  { value: 'custom', label: 'Taxa personalizada...', rate: 60 },
];

const TABLE_ROWS = [
  { name: 'Estética e Beleza', sub: 'Salão, tatuagem, unhas, cílios', rate: 60, badge: 'blue', limit: '200 SB$', logic: 'Alto ticket, margem confortável' },
  { name: 'Saúde e Odontologia', sub: 'Consultas, procedimentos', rate: 65, badge: 'teal', limit: '300 SB$', logic: 'Alta margem no setor' },
  { name: 'Alimentação', sub: 'Restaurante, delivery, lanchonete', rate: 50, badge: 'amber', limit: '100 SB$', logic: 'Margem baixa — protege parceiro' },
  { name: 'Serviços Automotivos', sub: 'Oficina, funilaria, borracheiro', rate: 60, badge: 'blue', limit: '400 SB$', logic: 'Tickets altos, desconto diluído' },
  { name: 'Educação e Cursos', sub: 'Escola, plataforma online', rate: 70, badge: 'green', limit: '500 SB$', logic: 'Custo marginal quase zero' },
  { name: 'Varejo e Comércio', sub: 'Loja física, supermercado', rate: 55, badge: 'amber', limit: '300 SB$', logic: 'Margem apertada no varejo' },
  { name: 'Turismo e Lazer', sub: 'Hotel, passeio, evento', rate: 65, badge: 'teal', limit: '500 SB$', logic: 'Preenche capacidade ociosa' },
  { name: 'Marketing e Design', sub: 'Agência, freelancer', rate: 70, badge: 'green', limit: '600 SB$', logic: 'Serviço intelectual, custo baixo' },
];

const badgeClass = (b: string) => {
  switch (b) {
    case 'blue': return 'bg-[#DBEAFE] text-[#1E40AF]';
    case 'teal': return 'bg-[#CCFBF1] text-[#115E59]';
    case 'amber': return 'bg-[#FEF3C7] text-[#92400E]';
    case 'green': return 'bg-[#DCFCE7] text-[#166534]';
    default: return 'bg-slate-100 text-slate-700';
  }
};

export default function AdminCalculator() {
  const [category, setCategory] = useState('60a');
  const [price, setPrice] = useState(150);
  const [sb, setSb] = useState(50);
  const [rate, setRate] = useState(60);

  const calc = useMemo(() => {
    const r = rate / 100;
    const fee = 0.075;
    const internal = sb * 1;
    const discount = Math.round(sb * r * 100) / 100;
    const finalPrice = Math.max(0, price - discount);
    const pct = price > 0 ? (discount / price) * 100 : 0;
    const spread = Math.round((internal - discount) * 100) / 100;
    const feeVal = Math.round(finalPrice * fee * 100) / 100;
    const totalProfit = Math.round((spread + feeVal) * 100) / 100;
    const marginPct = internal > 0 ? (totalProfit / internal) * 100 : 0;
    return { internal, discount, finalPrice, pct, spread, feeVal, totalProfit, marginPct };
  }, [price, sb, rate]);

  const handleCategoryChange = (v: string) => {
    setCategory(v);
    const opt = CATEGORY_OPTIONS.find(o => o.value === v);
    if (opt && v !== 'custom') setRate(opt.rate);
  };

  return (
    <div className="max-w-[1200px] mx-auto pb-10">
      <style>{`
        .calc-range { width: 100%; height: 4px; border-radius: 2px; background: #E2E8F0; outline: none; -webkit-appearance: none; cursor: pointer; }
        .calc-range::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #2B6CB8; border: 2px solid #fff; box-shadow: 0 1px 4px rgba(0,0,0,.2); cursor: pointer; }
        .calc-range.gold::-webkit-slider-thumb { background: #C9A227; }
        .calc-range.teal::-webkit-slider-thumb { background: #0891B2; }
      `}</style>

      {/* HERO */}
      <div className="bg-[#0D1F3C] rounded-2xl p-9 mb-7 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#C9A227]" />
        <h1 className="text-[28px] font-bold text-white mb-1.5">Calculadora de Spread SB$</h1>
        <p className="text-sm text-[#CBD5E1] italic mb-6">
          Como o SB$ se converte em desconto real para o cliente — e em margem para a Sempre+
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-[11px] text-white/50 uppercase tracking-wider mb-1.5">Valor facial interno</div>
            <div className="text-[22px] font-bold text-white mb-1">1 SB$ = R$ 1,00</div>
            <div className="text-[11px] text-white/45">Apenas para uso interno (contábil)</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-[11px] text-white/50 uppercase tracking-wider mb-1.5">Poder de compra real</div>
            <div className="text-[22px] font-bold text-[#E8C44A] mb-1">≈ R$ 0,60</div>
            <div className="text-[11px] text-white/45">Média de 60% (varia por categoria)</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-[11px] text-white/50 uppercase tracking-wider mb-1.5">Spread retido</div>
            <div className="text-[22px] font-bold text-[#E8C44A] mb-1">R$ 0,40 / SB$</div>
            <div className="text-[11px] text-white/45">Margem direta da Sempre+</div>
          </div>
        </div>
      </div>

      {/* FLOW */}
      <div className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 mb-3.5 pb-2 border-b border-slate-200">
        Como funciona a transação — do SB$ ao desconto final
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] gap-2 mb-7 items-stretch">
        <div className="bg-white border border-slate-200 rounded-[10px] p-4 text-xs text-slate-500 leading-relaxed">
          <strong className="block text-slate-800 text-[13px] font-semibold mb-1">Valor interno SB$</strong>
          A Sempre+ emite 1 SB$ com valor contábil de R$1,00. Apenas uso interno — o cliente não vê este número.
        </div>
        <div className="hidden lg:flex items-center justify-center px-2 text-slate-300 text-xl font-light">›</div>
        <div className="bg-[#EFF6FF] border border-[#2B6CB8] rounded-[10px] p-4 text-xs text-slate-500 leading-relaxed">
          <strong className="block text-[#1B4F9B] text-[13px] font-semibold mb-1">Cliente usa SB$ no parceiro</strong>
          O app exibe: "Você tem 50 SB$. Use para ganhar desconto neste serviço."
        </div>
        <div className="hidden lg:flex items-center justify-center px-2 text-slate-300 text-xl font-light">›</div>
        <div className="bg-white border border-slate-200 rounded-[10px] p-4 text-xs text-slate-500 leading-relaxed">
          <strong className="block text-slate-800 text-[13px] font-semibold mb-1">Taxa de resgate aplicada</strong>
          50 SB$ × 60% = R$30 de desconto real concedido ao associado.
        </div>
        <div className="hidden lg:flex items-center justify-center px-2 text-slate-300 text-xl font-light">›</div>
        <div className="bg-[#FFFBEB] border border-[#C9A227] rounded-[10px] p-4 text-xs text-slate-500 leading-relaxed">
          <strong className="block text-[#92400E] text-[13px] font-semibold mb-1">Spread retido pela Sempre+</strong>
          R$50 (valor interno) − R$30 (desconto real) = <strong className="text-[#92400E]">R$20 direto para o caixa</strong> da Sempre+.
        </div>
      </div>

      {/* CALCULATOR */}
      <div className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 mb-3.5 pb-2 border-b border-slate-200">
        Simulador interativo — ajuste os parâmetros
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-7">
        {/* Inputs */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="text-[15px] font-semibold text-slate-800 mb-5">Parâmetros da transação</div>

          <div className="mb-[18px]">
            <div className="text-xs text-slate-500 mb-1.5">Categoria do serviço</div>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] text-slate-800 bg-white outline-none cursor-pointer focus:border-[#2B6CB8] focus:ring-2 focus:ring-[#2B6CB8]/10"
            >
              {CATEGORY_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="mb-[18px]">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs text-slate-500">Preço original do serviço (R$)</span>
              <span className="text-sm font-semibold text-slate-800">R$ {price.toLocaleString('pt-BR')}</span>
            </div>
            <input type="range" className="calc-range" min={50} max={3000} step={10} value={price} onChange={(e) => setPrice(+e.target.value)} />
          </div>

          <div className="mb-[18px]">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs text-slate-500">SB$ utilizados pelo cliente</span>
              <span className="text-sm font-semibold text-slate-800">{sb} SB$</span>
            </div>
            <input type="range" className="calc-range teal" min={10} max={800} step={10} value={sb} onChange={(e) => setSb(+e.target.value)} />
          </div>

          <div className="mb-[18px]">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs text-slate-500">Taxa de resgate (%)</span>
              <span className="text-sm font-semibold text-slate-800">{rate}%</span>
            </div>
            <input
              type="range"
              className="calc-range gold"
              min={30}
              max={90}
              step={5}
              value={rate}
              onChange={(e) => setRate(+e.target.value)}
            />
          </div>

          <div className="bg-slate-50 border border-slate-200 border-l-[3px] border-l-[#2B6CB8] rounded-r-lg p-3.5 text-xs text-slate-500 leading-relaxed mt-3.5">
            Cliente gastou {sb} SB$ e recebe {fmt(calc.discount)} de desconto real. A Sempre+ retém {fmt(calc.spread)} ({(100 - rate)}% do valor interno) — sem que o cliente perceba a diferença.
          </div>
        </div>

        {/* Results */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="text-[15px] font-semibold text-slate-800 mb-5">Resultado da transação</div>

          <div className="flex flex-col">
            <Row k="Preço original do serviço" v={fmt(price)} />
            <Row k="SB$ utilizados" v={`${sb} SB$`} color="text-[#1B4F9B]" />
            <Row k="Valor interno SB$ (R$1,00/SB$)" v={fmt(calc.internal)} color="text-[#1B4F9B]" />
            <Row k="Taxa de resgate aplicada" v={`${rate}%`} />
            <Row k="Desconto real concedido" v={`− ${fmt(calc.discount)}`} color="text-[#DC2626]" />
            <Row k="Preço final para o cliente" v={fmt(calc.finalPrice)} color="text-[#16A34A]" />
            <Row k="% de desconto percebido pelo cliente" v={`${calc.pct.toFixed(1).replace('.', ',')}%`} />
            <Row k="Fee Sempre+ sobre transação (7,5%)" v={fmt(calc.feeVal)} color="text-[#92400E]" />
          </div>

          <div className="bg-gradient-to-br from-[#0D1F3C] to-[#1B4F9B] rounded-xl p-[18px] mt-4 flex justify-between items-center">
            <div>
              <div className="text-xs text-white/60">Ganho total da Sempre+ nesta transação</div>
              <div className="text-[28px] font-bold text-[#E8C44A]">{fmt(calc.totalProfit)}</div>
              <div className="text-[11px] text-white/45 mt-0.5">Spread SB$ {fmt(calc.spread)} + Fee {fmt(calc.feeVal)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-white/60">% sobre valor interno</div>
              <div className="text-2xl font-bold text-[#E8C44A]">{calc.marginPct.toFixed(1).replace('.', ',')}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 mb-3.5 pb-2 border-b border-slate-200">
        Tabela de taxas por categoria de serviço
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-7">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                <th className="bg-[#0D1F3C] text-white/70 text-[10px] font-semibold tracking-wider uppercase px-4 py-3 text-left" style={{ width: '22%' }}>Categoria</th>
                <th className="bg-[#0D1F3C] text-white/70 text-[10px] font-semibold tracking-wider uppercase px-4 py-3 text-left" style={{ width: '12%' }}>Taxa resgate</th>
                <th className="bg-[#0D1F3C] text-white/70 text-[10px] font-semibold tracking-wider uppercase px-4 py-3 text-left" style={{ width: '16%' }}>100 SB$ valem</th>
                <th className="bg-[#0D1F3C] text-white/70 text-[10px] font-semibold tracking-wider uppercase px-4 py-3 text-left" style={{ width: '16%' }}>Spread Sempre+</th>
                <th className="bg-[#0D1F3C] text-white/70 text-[10px] font-semibold tracking-wider uppercase px-4 py-3 text-left" style={{ width: '16%' }}>Limite/transação</th>
                <th className="bg-[#0D1F3C] text-white/70 text-[10px] font-semibold tracking-wider uppercase px-4 py-3 text-left" style={{ width: '18%' }}>Lógica</th>
              </tr>
            </thead>
            <tbody>
              {TABLE_ROWS.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-4 py-3 border-b border-slate-200 align-middle text-slate-800">
                    <strong>{r.name}</strong>
                    <small className="block text-[11px] text-slate-500 mt-0.5">{r.sub}</small>
                  </td>
                  <td className="px-4 py-3 border-b border-slate-200 align-middle">
                    <span className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${badgeClass(r.badge)}`}>{r.rate}%</span>
                  </td>
                  <td className="px-4 py-3 border-b border-slate-200 align-middle text-slate-800">R$ {r.rate} em desconto</td>
                  <td className="px-4 py-3 border-b border-slate-200 align-middle text-[#92400E] font-semibold">R$ {100 - r.rate} retidos</td>
                  <td className="px-4 py-3 border-b border-slate-200 align-middle text-slate-800">{r.limit}</td>
                  <td className="px-4 py-3 border-b border-slate-200 align-middle text-xs text-slate-500">{r.logic}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* NOTE */}
      <div className="bg-[#FFF7ED] border border-[#FED7AA] rounded-[10px] p-4 text-xs text-[#92400E] leading-relaxed">
        <strong className="text-[#78350F]">Como funciona o split entre parceiro e Sempre+:</strong><br />
        O desconto concedido ao cliente pode ser absorvido integralmente pelo parceiro (como custo de aquisição de novo cliente), integralmente pela Sempre+ (como subsídio), ou dividido entre os dois — conforme negociado no contrato de adesão do parceiro. Em todos os casos, o spread do SB$ (diferença entre valor interno e desconto real) fica integralmente com a Sempre+. O cliente vê apenas o desconto final — nunca o mecanismo.
      </div>
    </div>
  );
}

function Row({ k, v, color }: { k: string; v: string; color?: string }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-slate-200 last:border-b-0 text-[13px]">
      <span className="text-slate-500">{k}</span>
      <span className={`font-semibold ${color || 'text-slate-800'}`}>{v}</span>
    </div>
  );
}
