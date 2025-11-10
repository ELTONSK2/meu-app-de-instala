class ControleInstalacoes {
    constructor() {
        this.tecnicoId = this.getTecnicoId();
        this.instalacoes = this.carregarDados();
        this.gasolina = this.carregarGasolina();
        this.init();
    }

    init() {
        document.getElementById('instalacaoForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.adicionarInstalacao();
        });

        document.getElementById('gasolinaForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.adicionarGasolina();
        });

        const hoje = this.getDataHoje();
        document.getElementById('data').value = hoje;
        document.getElementById('dataGasolina').value = hoje;
        
        this.atualizarInterface();
        this.mostrarTecnicoAtual();
    }

    getTecnicoId() {
        let id = localStorage.getItem('tecnicoId');
        if (!id) {
            id = 'tec_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('tecnicoId', id);
        }
        return id;
    }

    mostrarTecnicoAtual() {
        document.getElementById('tecnicoInfo').textContent = this.tecnicoId;
    }

    getDataHoje() {
        return new Date().toISOString().split('T')[0];
    }

    calcularValor(quantidadeDia) {
        if (quantidadeDia === 1) return 90;
        if (quantidadeDia === 2) return 100;
        return 110;
    }

    adicionarInstalacao() {
        const codigo = document.getElementById('codigo').value;
        const nome = document.getElementById('nome').value;
        const data = document.getElementById('data').value;

        // ✅ ACEITA 5 OU 7 DÍGITOS
        if (!/^\d{5}$/.test(codigo) && !/^\d{7}$/.test(codigo)) {
            alert('Código deve ter 5 ou 7 dígitos!');
            return;
        }

        const instalacao = {
            codigo,
            nome,
            data,
            id: Date.now()
        };

        this.instalacoes.push(instalacao);
        this.salvarDados();
        this.atualizarInterface();

        document.getElementById('instalacaoForm').reset();
        document.getElementById('data').value = data;
    }

    adicionarGasolina() {
        const data = document.getElementById('dataGasolina').value;
        const valor = parseFloat(document.getElementById('valorGasolina').value);
        const observacao = document.getElementById('observacaoGasolina').value;

        if (!valor || valor <= 0) {
            alert('Digite um valor válido para a gasolina!');
            return;
        }

        const registroGasolina = {
            data,
            valor,
            observacao,
            id: Date.now()
        };

        this.gasolina.push(registroGasolina);
        this.salvarDados();
        this.atualizarInterface();

        document.getElementById('gasolinaForm').reset();
        document.getElementById('dataGasolina').value = data;
    }

    // 🔥 FUNÇÃO PARA EXCLUIR INSTALAÇÃO
    excluirInstalacao(id) {
        if (confirm('Tem certeza que deseja excluir esta instalação?')) {
            this.instalacoes = this.instalacoes.filter(inst => inst.id !== id);
            this.salvarDados();
            this.atualizarInterface();
            alert('Instalação excluída com sucesso!');
        }
    }

    // 🔥 FUNÇÃO PARA EXCLUIR GASTO DE GASOLINA
    excluirGasolina(id) {
        if (confirm('Tem certeza que deseja excluir este gasto?')) {
            this.gasolina = this.gasolina.filter(gas => gas.id !== id);
            this.salvarDados();
            this.atualizarInterface();
            alert('Gasto excluído com sucesso!');
        }
    }

    getInstalacoesPorData() {
        const agrupadas = {};
        
        this.instalacoes.forEach(inst => {
            if (!agrupadas[inst.data]) {
                agrupadas[inst.data] = [];
            }
            agrupadas[inst.data].push(inst);
        });

        return agrupadas;
    }

    getGasolinaPorData() {
        const agrupadas = {};
        
        this.gasolina.forEach(gas => {
            if (!agrupadas[gas.data]) {
                agrupadas[gas.data] = [];
            }
            agrupadas[gas.data].push(gas);
        });

        return agrupadas;
    }

    calcularTotalGasolina() {
        return this.gasolina.reduce((total, item) => total + item.valor, 0);
    }

    calcularTotais() {
        const agrupadas = this.getInstalacoesPorData();
        let totalMes = 0;

        Object.keys(agrupadas).forEach(data => {
            const qtd = agrupadas[data].length;
            const valorUnitario = this.calcularValor(qtd);
            const totalDia = qtd * valorUnitario;
            totalMes += totalDia;
        });

        const totalGasolina = this.calcularTotalGasolina();
        const saldoFinal = totalMes - totalGasolina;

        return { 
            totalMes, 
            totalGasolina,
            saldoFinal
        };
    }

    atualizarInterface() {
        this.atualizarResumoDia();
        this.atualizarListaInstalacoes();
        this.atualizarTotalMes();
        this.atualizarListaGasolina();
    }

    atualizarResumoDia() {
        const dataHoje = this.getDataHoje();
        const instalacoesHoje = this.instalacoes.filter(inst => inst.data === dataHoje);
        const qtdHoje = instalacoesHoje.length;
        const valorUnitario = this.calcularValor(qtdHoje);
        const totalHoje = qtdHoje * valorUnitario;

        document.getElementById('resumoDia').innerHTML = `
            <div class="resumo-item">
                <div>Instalações Hoje</div>
                <div class="resumo-valor">${qtdHoje}</div>
            </div>
            <div class="resumo-item">
                <div>Valor Unitário</div>
                <div class="resumo-valor">R$ ${valorUnitario}</div>
            </div>
            <div class="resumo-item">
                <div>Total Hoje</div>
                <div class="resumo-valor">R$ ${totalHoje}</div>
            </div>
        `;
    }

    atualizarListaInstalacoes() {
        const lista = document.getElementById('listaInstalacoes');
        const agrupadas = this.getInstalacoesPorData();

        let html = '';
        
        Object.keys(agrupadas).sort().reverse().forEach(data => {
            const instalacoes = agrupadas[data];
            const qtd = instalacoes.length;
            const valorUnitario = this.calcularValor(qtd);
            const totalDia = qtd * valorUnitario;

            html += `
                <div class="dia-group">
                    <h4>${this.formatarData(data)} - ${qtd} instalação(ões) - R$ ${totalDia}</h4>
                    ${instalacoes.map(inst => `
                        <div class="instalacao-item">
                            <div class="instalacao-info">
                                <div class="instalacao-codigo">${inst.codigo}</div>
                                <div class="instalacao-nome">${inst.nome}</div>
                            </div>
                            <div class="instalacao-actions">
                                <div class="instalacao-valor">R$ ${valorUnitario}</div>
                                <button class="btn-excluir" onclick="controle.excluirInstalacao(${inst.id})" title="Excluir instalação">
                                    🗑️
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        });

        lista.innerHTML = html || '<p>Nenhuma instalação cadastrada ainda.</p>';
    }

    atualizarListaGasolina() {
        const lista = document.getElementById('listaGasolina');
        const agrupadas = this.getGasolinaPorData();
        const totalGasolina = this.calcularTotalGasolina();

        let html = '';
        
        Object.keys(agrupadas).sort().reverse().forEach(data => {
            const gastos = agrupadas[data];

            html += `
                <div class="dia-group">
                    <h4>${this.formatarData(data)}</h4>
                    ${gastos.map(gas => `
                        <div class="gasolina-item">
                            <div class="gasolina-info">
                                <div class="gasolina-valor">R$ ${gas.valor.toFixed(2)}</div>
                                <div class="gasolina-observacao">${gas.observacao || 'Sem observação'}</div>
                            </div>
                            <button class="btn-excluir" onclick="controle.excluirGasolina(${gas.id})" title="Excluir gasto">
                                🗑️
                            </button>
                        </div>
                    `).join('')}
                </div>
            `;
        });

        lista.innerHTML = html || '<p>Nenhum gasto com gasolina registrado.</p>';
        document.getElementById('totalGasolinaMes').textContent = totalGasolina.toFixed(2);
    }

    atualizarTotalMes() {
        const { totalMes, totalGasolina, saldoFinal } = this.calcularTotais();
        
        document.getElementById('totalMes').innerHTML = `
            <div class="total-item">
                <span>Total Instalações:</span>
                <span>R$ ${totalMes}</span>
            </div>
            <div class="total-item">
                <span>Total Gasolina:</span>
                <span>R$ ${totalGasolina.toFixed(2)}</span>
            </div>
            <div class="total-item total-final" style="color: ${saldoFinal >= 0 ? '#27AE60' : '#E74C3C'}">
                <span>Saldo Final:</span>
                <span>R$ ${saldoFinal.toFixed(2)}</span>
            </div>
        `;
    }

    formatarData(data) {
        return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
    }

    salvarDados() {
        const dados = {
            tecnicoId: this.tecnicoId,
            instalacoes: this.instalacoes,
            gasolina: this.gasolina
        };
        localStorage.setItem('controle_' + this.tecnicoId, JSON.stringify(dados));
    }

    carregarDados() {
        const dadosCompletos = localStorage.getItem('controle_' + this.tecnicoId);
        if (dadosCompletos) {
            const dados = JSON.parse(dadosCompletos);
            return dados.instalacoes || [];
        }
        return [];
    }

    carregarGasolina() {
        const dadosCompletos = localStorage.getItem('controle_' + this.tecnicoId);
        if (dadosCompletos) {
            const dados = JSON.parse(dadosCompletos);
            return dados.gasolina || [];
        }
        return [];
    }

    mostrarTodosTecnicos() {
        const tecnicos = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('controle_tec_')) {
                const dados = JSON.parse(localStorage.getItem(key));
                const total = this.calcularTotalTecnico(dados);
                
                tecnicos.push({
                    id: dados.tecnicoId,
                    instalacoes: dados.instalacoes.length,
                    gasolina: dados.gasolina.length,
                    total: total
                });
            }
        }
        
        const lista = document.getElementById('listaTecnicos');
        lista.innerHTML = '<h4 style="color: var(--dark); margin-bottom: 16px;">📊 Todos os Técnicos</h4>';
        
        tecnicos.forEach(tec => {
            lista.innerHTML += `
                <div class="tecnico-card">
                    <strong>${tec.id}</strong><br>
                    <div style="margin-top: 8px;">
                        <span class="badge badge-success">Instalações: ${tec.instalacoes}</span>
                        <span class="badge badge-warning" style="margin-left: 8px;">Gasolina: ${tec.gasolina}</span>
                    </div>
                    <div style="margin-top: 8px; font-weight: 600; color: var(--primary);">
                        Total: R$ ${tec.total}
                    </div>
                </div>
            `;
        });
        
        lista.style.display = 'block';
    }

    calcularTotalTecnico(dados) {
        let total = 0;
        const agrupadas = {};
        
        dados.instalacoes.forEach(inst => {
            if (!agrupadas[inst.data]) agrupadas[inst.data] = [];
            agrupadas[inst.data].push(inst);
        });
        
        Object.keys(agrupadas).forEach(data => {
            const qtd = agrupadas[data].length;
            const valorUnitario = this.calcularValor(qtd);
            total += qtd * valorUnitario;
        });
        
        const totalGasolina = dados.gasolina.reduce((sum, item) => sum + item.valor, 0);
        return (total - totalGasolina).toFixed(2);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.controle = new ControleInstalacoes();
});