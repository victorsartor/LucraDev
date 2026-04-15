/* ================================================
   LUCRA DEV - ENGENHARIA FINANCEIRA
   Componente: Interface de Usuário (DOM / Events)
   ================================================ */

// Instanciando a lógica matemática pura (Modelo)
const financas = new LucraDevFinance();

// Estado exclusivo de Interface da Aplicação
const appState = {
    etapaAtual: 1,
    totalEtapas: 4,
};

// ------------------------------------------------
// INICIALIZAÇÃO
// ------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    
    configurarInputsNumericos();
    configurarSliders();
    configurarRegimeTributario();
    configurarNavegacao();
    configurarBotoesResultado();
    
    atualizarTodosSliders();
});

// ------------------------------------------------
// CONFIGURAÇÃO: INPUTS NUMÉRICOS
// ------------------------------------------------
function configurarInputsNumericos() {
    const inputs = document.querySelectorAll('.field__input[data-category]');
    
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            const valor = parseFloat(input.value) || 0;
            const id = input.id;
            
            // Passando o "input" visual para a Engine Matemática
            switch(id) {
                case 'aluguel':
                case 'internet':
                case 'software':
                    financas.setCusto(id, valor);
                    break;
                case 'outrosCustos':
                    financas.setCusto('outros', valor);
                    break;
                case 'salario':
                    financas.setMeta('salario', valor);
                    break;
            }
            
            atualizarResumosEtapa();
        });
        
        input.addEventListener('focus', () => {
            input.select();
        });
    });
}

// ------------------------------------------------
// CONFIGURAÇÃO: SLIDERS (RANGE INPUTS)
// ------------------------------------------------
function configurarSliders() {
    // Mapeamento: ID do slider → { método do motor matemático, categoria interna, label do badge, sufixo }
    const slidersConfig = {
        'margem':          { engineSet: 'setMeta',       prop: 'margem',         sufixo: '%' },
        'reserva':         { engineSet: 'setMeta',       prop: 'reserva',        sufixo: '%' },
        'aliquota':        { engineSet: 'setImposto',    prop: 'aliquota',       sufixo: '%' },
        'taxaPlataforma':  { engineSet: 'setImposto',    prop: 'taxaPlataforma', sufixo: '%' },
        'horasDia':        { engineSet: 'setTempo',      prop: 'horasDia',       sufixo: 'h' },
        'diasSemana':      { engineSet: 'setTempo',      prop: 'diasSemana',     sufixo: ' dias' },
        'semanasMes':      { engineSet: 'setTempo',      prop: 'semanasMes',     sufixo: ' sem.' }
    };
    
    Object.entries(slidersConfig).forEach(([id, config]) => {
        const slider = document.getElementById(id);
        if (!slider) return;
        
        slider.addEventListener('input', () => {
            const valor = parseFloat(slider.value);
            
            // Chama dinamicamente o método da classe matemática
            financas[config.engineSet](config.prop, valor);
            
            const badge = document.getElementById(`${id}Value`);
            if (badge) {
                badge.textContent = valor + config.sufixo;
            }
            
            atualizarProgressoSlider(slider);
            atualizarResumosEtapa();
        });
    });
}

function atualizarProgressoSlider(slider) {
    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    const valor = parseFloat(slider.value);
    const porcentagem = ((valor - min) / (max - min)) * 100;
    slider.style.setProperty('--slider-progress', `${porcentagem}%`);
}

function atualizarTodosSliders() {
    const sliders = document.querySelectorAll('.field__slider');
    sliders.forEach(slider => atualizarProgressoSlider(slider));
}

// ------------------------------------------------
// CONFIGURAÇÃO: REGIME TRIBUTÁRIO
// ------------------------------------------------
function configurarRegimeTributario() {
    const cards = document.querySelectorAll('.regime-card');
    const sliderAliquota = document.getElementById('aliquota');
    
    cards.forEach(card => {
        card.addEventListener('click', () => {
            cards.forEach(c => c.classList.remove('regime-card--active'));
            card.classList.add('regime-card--active');
            
            const regime = card.dataset.regime;
            const aliquota = parseFloat(card.dataset.aliquota);
            
            // Passa as config. fiscais para a Engine
            financas.setImposto('regime', regime);
            financas.setImposto('aliquota', aliquota);
            
            if (sliderAliquota) {
                sliderAliquota.value = aliquota;
                atualizarProgressoSlider(sliderAliquota);
                
                const badge = document.getElementById('aliquotaValue');
                if (badge) badge.textContent = aliquota + '%';
            }
        });
    });
}

// ------------------------------------------------
// RESUMOS DE ETAPA
// ------------------------------------------------
function atualizarResumosEtapa() {
    // 1 - Pede o dado formatado e calculado pela matemática pura (sem manipular lógica)
    const custosTotalEl = document.getElementById('custosTotalValue');
    if (custosTotalEl) {
        custosTotalEl.textContent = formatarMoeda(financas.getTotalCustos());
    }
    
    atualizarResumoHoras();
}

function atualizarResumoHoras() {
    // A logica está na API financas
    const horasTotais = financas.getHorasTotaisBrutas();
    const horasNaoFaturaveis = financas.getHorasNaoFaturaveis();
    const horasFaturaveis = financas.getHorasFaturaveis();
    
    const elTotais = document.getElementById('horasTotais');
    const elNaoFat = document.getElementById('horasNaoFaturaveis');
    const elFat = document.getElementById('horasFaturaveis');
    
    if (elTotais) elTotais.textContent = horasTotais + 'h';
    if (elNaoFat) elNaoFat.textContent = '-' + horasNaoFaturaveis + 'h';
    if (elFat) elFat.textContent = horasFaturaveis + 'h';
}

// ------------------------------------------------
// NAVEGAÇÃO DO WIZARD
// ------------------------------------------------
function configurarNavegacao() {
    const btnNext = document.getElementById('btnNext');
    const btnPrev = document.getElementById('btnPrev');
    
    btnNext.addEventListener('click', () => {
        if (appState.etapaAtual < appState.totalEtapas) {
            irParaEtapa(appState.etapaAtual + 1);
        } else {
            calcularEExibirResultado();
        }
    });
    
    btnPrev.addEventListener('click', () => {
        if (appState.etapaAtual > 1) {
            irParaEtapa(appState.etapaAtual - 1);
        }
    });
}

function irParaEtapa(novaEtapa) {
    const etapaAtualEl = document.getElementById(`step${appState.etapaAtual}`);
    if (etapaAtualEl) etapaAtualEl.classList.remove('step--active');
    
    const novaEtapaEl = document.getElementById(`step${novaEtapa}`);
    if (novaEtapaEl) novaEtapaEl.classList.add('step--active');
    
    appState.etapaAtual = novaEtapa;
    
    atualizarProgresso();
    atualizarBotoesNavegacao();
    atualizarResumosEtapa();
    lucide.createIcons();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function atualizarProgresso() {
    const fill = document.getElementById('progressFill');
    const porcentagem = (appState.etapaAtual / appState.totalEtapas) * 100;
    fill.style.width = `${porcentagem}%`;
    
    for (let i = 1; i <= appState.totalEtapas; i++) {
        const stepEl = document.getElementById(`progressStep${i}`);
        stepEl.classList.remove('progress__step--active', 'progress__step--completed');
        
        if (i === appState.etapaAtual) {
            stepEl.classList.add('progress__step--active');
        } else if (i < appState.etapaAtual) {
            stepEl.classList.add('progress__step--completed');
        }
    }
}

function atualizarBotoesNavegacao() {
    const btnPrev = document.getElementById('btnPrev');
    const btnNext = document.getElementById('btnNext');
    
    btnPrev.style.visibility = appState.etapaAtual === 1 ? 'hidden' : 'visible';
    
    if (appState.etapaAtual === appState.totalEtapas) {
        btnNext.innerHTML = '<i data-lucide="sparkles"></i> Calcular LucraDev';
        btnNext.classList.remove('btn--primary');
        btnNext.classList.add('btn--calculate');
    } else {
        btnNext.innerHTML = 'Próximo <i data-lucide="arrow-right"></i>';
        btnNext.classList.remove('btn--calculate');
        btnNext.classList.add('btn--primary');
    }
    lucide.createIcons();
}

// ------------------------------------------------
// EXIBIÇÃO DO RESULTADO FINAL
// ------------------------------------------------
function calcularEExibirResultado() {
    // 💡 Invoca o cálculo encapsulado direto da biblioteca Matemática Pura: 
    const resultado = financas.calculate();
    
    document.getElementById('wizard').style.display = 'none';
    document.getElementById('wizardNav').style.display = 'none';
    document.querySelector('.progress').style.display = 'none';
    
    const resultSection = document.getElementById('resultSection');
    resultSection.style.display = 'block';
    
    const parteInteira = Math.floor(resultado.valorHora);
    const parteDecimal = Math.round((resultado.valorHora - parteInteira) * 100);
    
    animarContagem('resultValue', 0, parteInteira, 1200);
    document.getElementById('resultCents').textContent = ',' + 
        parteDecimal.toString().padStart(2, '0');
    
    const tempoData = financas.getTempo();
    document.getElementById('projHora').textContent = formatarMoeda(resultado.valorHora);
    document.getElementById('projDia').textContent = formatarMoeda(resultado.valorHora * tempoData.horasDia);
    document.getElementById('projMes').textContent = formatarMoeda(resultado.totalMensal);
    
    gerarGraficoDonut(resultado);
    gerarInsight(resultado);
    lucide.createIcons();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ------------------------------------------------
// ANIMAÇÕES & CHARTS DA UI
// ------------------------------------------------
function animarContagem(elementId, inicio, fim, duracao) {
    const elemento = document.getElementById(elementId);
    const diferenca = fim - inicio;
    const incremento = diferenca / (duracao / 16); 
    let atual = inicio;
    
    const timer = setInterval(() => {
        atual += incremento;
        if (atual >= fim) {
            atual = fim;
            clearInterval(timer);
        }
        elemento.textContent = Math.floor(atual).toLocaleString('pt-BR');
    }, 16);
}

function gerarGraficoDonut(resultado) {
    const donut = document.getElementById('donutChart');
    const legend = document.getElementById('donutLegend');
    const totalEl = document.getElementById('donutTotal');
    
    const { breakdown, totalMensal } = resultado;
    totalEl.textContent = formatarMoedaCurta(totalMensal);
    
    let acumulado = 0;
    const fatias = [];
    const legendaHTML = [];
    
    const coresReais = {
        custos:   '#8b5cf6',
        salario:  '#3b82f6',
        impostos: '#f59e0b',
        margem:   '#10b981',
        reserva:  '#ec4899'
    };
    
    Object.entries(breakdown).forEach(([chave, dados]) => {
        const porcentagem = totalMensal > 0 ? (dados.valor / totalMensal) * 100 : 0;
        const inicioFatia = acumulado;
        acumulado += porcentagem;
        
        fatias.push(`${coresReais[chave]} ${inicioFatia}% ${acumulado}%`);
        
        legendaHTML.push(`
            <div class="legend-item">
                <span class="legend-item__dot" style="background: ${coresReais[chave]}"></span>
                <span class="legend-item__label">${dados.label}</span>
                <span class="legend-item__value">${formatarMoedaCurta(dados.valor)}</span>
                <span class="legend-item__percent">${porcentagem.toFixed(0)}%</span>
            </div>
        `);
    });
    
    donut.style.background = `conic-gradient(${fatias.join(', ')})`;
    legend.innerHTML = legendaHTML.join('');
}

function gerarInsight(resultado) {
    const textEl = document.getElementById('resultInsightText');
    const valorHora = resultado.valorHora;
    let dica = '';
    
    if (valorHora < 30) {
        dica = '⚠️ Seu valor/hora está abaixo da média do mercado freelancer brasileiro. Considere revisar seus custos ou aumentar sua margem de lucro.';
    } else if (valorHora < 80) {
        dica = '👍 Seu valor está na faixa de entrada do mercado freelancer. Com experiência e portfólio sólido, você pode aumentar gradualmente.';
    } else if (valorHora < 150) {
        dica = '🎯 Ótimo! Seu valor está na faixa intermediária, compatível com profissionais experientes. Mantenha a qualidade das entregas.';
    } else if (valorHora < 300) {
        dica = '🚀 Excelente! Seu valor reflete um profissional sênior. Foque em clientes de alto valor e projetos estratégicos.';
    } else {
        dica = '💎 Valor premium! Você está na faixa de especialistas e consultores de alto nível. Certifique-se de que sua marca pessoal justifique esse posicionamento.';
    }
    
    const horasFat = resultado.horasFaturaveis;
    dica += ` | Com ${horasFat.toFixed(0)}h faturáveis/mês, você precisa faturar ${formatarMoeda(resultado.totalMensal)} para atingir suas metas.`;
    
    textEl.textContent = dica;
}

// ------------------------------------------------
// BOTÕES DO RESULTADO & EXPORTAÇÃO (DOM)
// ------------------------------------------------
function configurarBotoesResultado() {
    document.getElementById('btnRefazer').addEventListener('click', () => {
        document.getElementById('resultSection').style.display = 'none';
        document.getElementById('wizard').style.display = 'block';
        document.getElementById('wizardNav').style.display = 'flex';
        document.querySelector('.progress').style.display = 'block';
        irParaEtapa(1);
    });
    
    document.getElementById('btnExportar').addEventListener('click', () => {
        exportarResultado();
    });
}

function exportarResultado() {
    // Baseado na engine pura
    const resultado = financas.calculate();
    const tempoData = financas.getTempo();
    
    const texto = `
═══════════════════════════════════
  LUCRA DEV - ENGENHARIA FINANCEIRA
═══════════════════════════════════

💰 SEU VALOR/HORA: ${formatarMoeda(resultado.valorHora)}

📊 PROJEÇÕES:
  • Por hora:  ${formatarMoeda(resultado.valorHora)}
  • Por dia:   ${formatarMoeda(resultado.valorHora * tempoData.horasDia)}
  • Por mês:   ${formatarMoeda(resultado.totalMensal)}

📋 COMPOSIÇÃO:
  • Custos Fixos:    ${formatarMoeda(resultado.custos)}
  • Salário:         ${formatarMoeda(resultado.salario)}
  • Impostos/Taxas:  ${formatarMoeda(resultado.impostos + resultado.taxaPlataforma)}
  • Margem Lucro:    ${formatarMoeda(resultado.margem)}
  • Reserva:         ${formatarMoeda(resultado.reserva)}

⏰ DISPONIBILIDADE:
  • ${tempoData.horasDia}h/dia × ${tempoData.diasSemana} dias × ${tempoData.semanasMes} semanas
  • Horas faturáveis: ${resultado.horasFaturaveis.toFixed(0)}h/mês
  • (desconto de 20% para tempo não faturável)

═══════════════════════════════════
  Calculado em: ${new Date().toLocaleDateString('pt-BR')} via LucraDev
═══════════════════════════════════
    `.trim();
    
    navigator.clipboard.writeText(texto).then(() => {
        const btn = document.getElementById('btnExportar');
        const textoOriginal = btn.innerHTML;
        btn.innerHTML = '<i data-lucide="check"></i> Copiado!';
        btn.style.background = 'var(--accent-gradient)';
        btn.style.boxShadow = 'var(--shadow-glow-accent)';
        lucide.createIcons();
        
        setTimeout(() => {
            btn.innerHTML = textoOriginal;
            btn.style.background = '';
            btn.style.boxShadow = '';
            lucide.createIcons();
        }, 2000);
    }).catch(() => {
        prompt('Copie o resultado abaixo:', texto);
    });
}

// Utilitários Visiuais
function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function formatarMoedaCurta(valor) {
    if (valor >= 1000) {
        return 'R$ ' + (valor / 1000).toFixed(1).replace('.', ',') + 'k';
    }
    return formatarMoeda(valor);
}
