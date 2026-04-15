/**
 * LucraDev - Engenharia Financeira
 * Componente: Lógica Matemática Pura
 * Totalmente desacoplado de DOM, eventos e navegador.
 */
class LucraDevFinance {
    constructor() {
        this.estado = {
            custos: { aluguel: 0, internet: 0, software: 0, outros: 0 },
            metas: { salario: 0, margem: 20, reserva: 10 },
            impostos: { regime: 'mei', aliquota: 5, taxaPlataforma: 0 },
            tempo: { horasDia: 8, diasSemana: 5, semanasMes: 4 }
        };
    }

    // Setters
    setCusto(categoria, valor) { this.estado.custos[categoria] = parseFloat(valor) || 0; }
    setMeta(categoria, valor) { this.estado.metas[categoria] = parseFloat(valor) || 0; }
    setImposto(categoria, valor) { 
        if (categoria === 'regime') {
            this.estado.impostos[categoria] = String(valor);
        } else {
            this.estado.impostos[categoria] = parseFloat(valor) || 0; 
        }
    }
    setTempo(categoria, valor) { this.estado.tempo[categoria] = parseFloat(valor) || 0; }

    // Obter estado atual por categoria
    getTempo() { return this.estado.tempo; }
    getMetas() { return this.estado.metas; }
    getImpostos() { return this.estado.impostos; }

    // Cálculos Intermediários
    getTotalCustos() {
        const { aluguel, internet, software, outros } = this.estado.custos;
        return aluguel + internet + software + outros;
    }

    getHorasTotaisBrutas() {
        const { horasDia, diasSemana, semanasMes } = this.estado.tempo;
        return horasDia * diasSemana * semanasMes;
    }

    getHorasNaoFaturaveis() {
        // Desconto fixo de 20% para tempo não faturável
        return Math.round(this.getHorasTotaisBrutas() * 0.20);
    }

    getHorasFaturaveis() {
        return this.getHorasTotaisBrutas() - this.getHorasNaoFaturaveis();
    }

    // Cálculo Principal Otimizado Financeiramente
    calculate() {
        const custos = this.getTotalCustos();
        const salario = this.estado.metas.salario;
        const base = custos + salario;
        
        const margem = base * (this.estado.metas.margem / 100);
        const reserva = base * (this.estado.metas.reserva / 100);
        const subtotal = base + margem + reserva;
        
        const impostos = subtotal * (this.estado.impostos.aliquota / 100);
        const taxaPlataforma = subtotal * (this.estado.impostos.taxaPlataforma / 100);
        
        const totalMensal = subtotal + impostos + taxaPlataforma;
        const horasFaturaveis = this.getHorasFaturaveis();
        
        const valorHora = horasFaturaveis > 0 ? totalMensal / horasFaturaveis : 0;

        return {
            valorHora,
            totalMensal,
            custos,
            salario,
            margem,
            reserva,
            impostos,
            taxaPlataforma,
            horasFaturaveis,
            breakdown: {
                custos:   { valor: custos,        label: 'Custos Fixos',  cor: 'var(--chart-custos)' },
                salario:  { valor: salario,       label: 'Salário',       cor: 'var(--chart-salario)' },
                impostos: { valor: impostos + taxaPlataforma, label: 'Impostos/Taxas', cor: 'var(--chart-impostos)' },
                margem:   { valor: margem,        label: 'Margem Lucro',  cor: 'var(--chart-margem)' },
                reserva:  { valor: reserva,       label: 'Reserva',       cor: 'var(--chart-reserva)' }
            }
        };
    }
}
