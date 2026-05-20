// Função para obter a data atual no formato YYYYMMDD (sem traços)
function getDataAtual() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    return `${ano}${mes}${dia}`;
}

// Função para converter data do input (YYYY-MM-DD) para YYYYMMDD
function converterDataInputParaArquivo(dataInput) {
    if (!dataInput) return '';
    return dataInput.replace(/-/g, '');
}

// Função para formatar data para exibição (DD/MM/YYYY)
function formatarDataParaExibicao(dataStr) {
    if (!dataStr) return '';
    if (dataStr.length === 8 && !dataStr.includes('-')) {
        const ano = dataStr.substring(0, 4);
        const mes = dataStr.substring(4, 6);
        const dia = dataStr.substring(6, 8);
        return `${dia}/${mes}/${ano}`;
    }
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}/${ano}`;
}

// Função para processar os códigos
function processarCodigos(codigosStr) {
    let codigos = codigosStr.split(',').map(codigo => codigo.trim());
    codigos = codigos.filter(codigo => codigo !== '');
    return codigos;
}

// Função para construir a URL completa da prova
function construirURLProva(baseUrl, parametros, codigo) {
    let base = baseUrl.trim();
    if (base.endsWith('/')) {
        base = base.slice(0, -1);
    }
    let params = parametros.trim();
    if (params.startsWith('/')) {
        params = params.substring(1);
    }
    let url = base + '/' + params + codigo + '.pdf';
    return url;
}

// Função para construir a URL do gabarito
function construirURLGabarito(baseUrl, parametros, data) {
    let base = baseUrl.trim();
    if (base.endsWith('/')) {
        base = base.slice(0, -1);
    }
    
    // Converter a data para o formato YYYYMMDD (sem traços)
    let dataArquivo = data;
    if (data.includes('-')) {
        dataArquivo = converterDataInputParaArquivo(data);
    }
    
    let params = parametros.trim();
    if (params.startsWith('/')) {
        params = params.substring(1);
    }
    
    const url = base + '/' + params + 'gabarito_' + dataArquivo + '.pdf';
    return url;
}

// Função para construir a URL do link de provas (padrão Chapecó)
function construirURLProvasChapeco(baseUrl, data) {
    let base = baseUrl.trim();
    if (base.endsWith('/')) {
        base = base.slice(0, -1);
    }
    
    // Converter a data para o formato YYYYMMDD (sem traços)
    let dataArquivo = data;
    if (data.includes('-')) {
        dataArquivo = converterDataInputParaArquivo(data);
    }
    
    const url = base + '/?go=provas_' + dataArquivo;
    return url;
}

// Função para gerar links das provas
function gerarLinksProvas(baseUrl, parametros, codigos) {
    const links = [];
    for (const codigo of codigos) {
        const url = construirURLProva(baseUrl, parametros, codigo);
        links.push({
            codigo: codigo,
            url: url,
            tipo: 'prova'
        });
    }
    return links;
}

// Função para gerar links dos gabaritos
function gerarLinksGabaritos(baseUrl, parametros, data) {
    const links = [];
    if (data) {
        const url = construirURLGabarito(baseUrl, parametros, data);
        const dataExibicao = formatarDataParaExibicao(data);
        
        links.push({
            codigo: `Gabarito (${dataExibicao})`,
            url: url,
            tipo: 'gabarito',
            data: data
        });
    }
    return links;
}

// Função para gerar o link especial Chapecó
function gerarLinkChapeco(baseUrl, data) {
    if (!data) return null;
    const url = construirURLProvasChapeco(baseUrl, data);
    const dataExibicao = formatarDataParaExibicao(data);
    const dataArquivo = converterDataInputParaArquivo(data);
    
    return {
        codigo: `Link geral (${dataExibicao})`,
        url: url,
        tipo: 'chapeco',
        data: data,
        descricao: `?go=provas_${dataArquivo}`
    };
}

// Função para exibir os links
function exibirLinks(links, titulo = 'Links Gerados') {
    const resultsContainer = document.getElementById('results');
    const summaryDiv = document.getElementById('summary');
    const summaryContent = document.getElementById('summaryContent');
    
    if (!links || links.length === 0) {
        resultsContainer.innerHTML = '<p class="empty-message">Nenhum link para exibir.</p>';
        summaryDiv.style.display = 'none';
        return;
    }
    
    const provas = links.filter(l => l.tipo === 'prova');
    const gabaritos = links.filter(l => l.tipo === 'gabarito');
    const chapeco = links.filter(l => l.tipo === 'chapeco');
    const total = links.length;
    
    let html = '<div class="info-box" style="margin-bottom: 15px;">';
    html += '<strong>📝 Instruções:</strong>';
    html += '<ul>';
    html += '<li>Clique em cada botão "Abrir" para verificar se o arquivo existe</li>';
    html += '<li>Arquivos existentes abrirão o PDF diretamente</li>';
    html += '<li>Arquivos inexistentes mostrarão a mensagem "Erro: Arquivo inexistente."</li>';
    html += '<li>Use Ctrl+Click (ou Cmd+Click no Mac) para abrir múltiplos links rapidamente</li>';
    html += '</ul>';
    html += '</div>';
    
    // Exibir link Chapecó primeiro (se houver)
    if (chapeco.length > 0) {
        html += '<h3 style="margin: 20px 0 10px 0; color: #ff6b6b;">🌐 Link geral</h3>';
        for (const link of chapeco) {
            html += `
                <div class="result-item" style="background: #fff5f5;">
                    <div class="result-info">
                        <div class="result-codigo">
                            ${escapeHtml(link.codigo)}
                            <span class="badge badge-chapeco">Geral</span>
                        </div>
                        <div class="result-url">${escapeHtml(link.url)}</div>
                        <div style="font-size: 11px; color: #888; margin-top: 5px;">
                            Formato: ${escapeHtml(link.descricao)}
                        </div>
                    </div>
                    <div class="result-status">
                        <a href="${escapeHtml(link.url)}" target="_blank" class="btn-link btn-chapeco">🌐 Abrir geral</a>
                    </div>
                </div>
            `;
        }
    }
    
    // Exibir gabaritos
    if (gabaritos.length > 0) {
        html += '<h3 style="margin: 20px 0 10px 0; color: #28a745;">📊 Gabaritos</h3>';
        for (const link of gabaritos) {
            html += `
                <div class="result-item">
                    <div class="result-info">
                        <div class="result-codigo">
                            ${escapeHtml(link.codigo)}
                            <span class="badge badge-gabarito">Gabarito</span>
                        </div>
                        <div class="result-url">${escapeHtml(link.url)}</div>
                    </div>
                    <div class="result-status">
                        <a href="${escapeHtml(link.url)}" target="_blank" class="btn-link">📄 Abrir Gabarito</a>
                    </div>
                </div>
            `;
        }
    }
    
    // Exibir provas
    if (provas.length > 0) {
        html += '<h3 style="margin: 20px 0 10px 0; color: #667eea;">📚 Provas</h3>';
        for (const link of provas) {
            html += `
                <div class="result-item">
                    <div class="result-info">
                        <div class="result-codigo">
                            ${escapeHtml(link.codigo)}.pdf
                            <span class="badge badge-prova">Prova</span>
                        </div>
                        <div class="result-url">${escapeHtml(link.url)}</div>
                    </div>
                    <div class="result-status">
                        <a href="${escapeHtml(link.url)}" target="_blank" class="btn-link">📄 Abrir Prova</a>
                    </div>
                </div>
            `;
        }
    }
    
    resultsContainer.innerHTML = html;
    
    const summaryHtml = `
        <div class="summary-stats">
            <div class="stat-card">
                <div class="stat-number">${total}</div>
                <div class="stat-label">Total de Links</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${chapeco.length}</div>
                <div class="stat-label">Link Chapecó</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${gabaritos.length}</div>
                <div class="stat-label">Gabaritos</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${provas.length}</div>
                <div class="stat-label">Provas</div>
            </div>
        </div>
        <div class="info-box">
            <strong>💡 Dica:</strong> 
            <ul>
                <li>Clique com o botão direito e escolha "Abrir em nova aba" para não perder a lista</li>
                <li>O formato do gabarito segue o padrão: gabarito_AAAAMMDD.pdf (ex: gabarito_20260419.pdf)</li>
                <li>O link Chapecó segue o padrão: ?go=provas_AAAAMMDD</li>
                <li>A data padrão é sempre a data atual do sistema</li>
                <li>Você pode alterar a data no campo acima para verificar links de outras datas</li>
            </ul>
        </div>
    `;
    
    summaryContent.innerHTML = summaryHtml;
    summaryDiv.style.display = 'block';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function atualizarStatus(mensagem, isError = false) {
    const statusDiv = document.getElementById('status');
    const bgColor = isError ? '#f8d7da' : '#f8f9fa';
    const borderColor = isError ? '#dc3545' : '#667eea';
    statusDiv.innerHTML = `<div style="background: ${bgColor}; border-left-color: ${borderColor}; padding: 10px;">${escapeHtml(mensagem)}</div>`;
}

function limparResultados() {
    const resultsContainer = document.getElementById('results');
    const summaryDiv = document.getElementById('summary');
    
    resultsContainer.innerHTML = '<p class="empty-message">Clique em um dos botões acima para gerar os links.</p>';
    summaryDiv.style.display = 'none';
    atualizarStatus('Resultados limpos. Pronto para gerar novos links.');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const btnGerarProvas = document.getElementById('btnGerarProvas');
    const btnGerarGabaritos = document.getElementById('btnGerarGabaritos');
    const btnGerarTudo = document.getElementById('btnGerarTudo');
    const btnLimpar = document.getElementById('btnLimpar');
    const baseUrlInput = document.getElementById('baseUrl');
    const codigosTextarea = document.getElementById('codigos');
    const parametrosInput = document.getElementById('parametros');
    const dataInput = document.getElementById('data');
    
    // Definir data padrão como hoje no formato YYYY-MM-DD (para o input date)
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    dataInput.value = `${ano}-${mes}-${dia}`;
    
    // Carregar dados salvos
    const savedCodigos = localStorage.getItem('codigosFepese');
    if (savedCodigos) {
        codigosTextarea.value = savedCodigos;
    }
    
    const savedBaseUrl = localStorage.getItem('baseUrlFepese');
    if (savedBaseUrl) {
        baseUrlInput.value = savedBaseUrl;
    }
    
    const savedParametros = localStorage.getItem('parametrosFepese');
    if (savedParametros) {
        parametrosInput.value = savedParametros;
    }
    
    const savedData = localStorage.getItem('dataFepese');
    if (savedData) {
        dataInput.value = savedData;
    }
    
    codigosTextarea.addEventListener('change', () => {
        localStorage.setItem('codigosFepese', codigosTextarea.value);
    });
    
    baseUrlInput.addEventListener('change', () => {
        localStorage.setItem('baseUrlFepese', baseUrlInput.value);
    });
    
    parametrosInput.addEventListener('change', () => {
        localStorage.setItem('parametrosFepese', parametrosInput.value);
    });
    
    dataInput.addEventListener('change', () => {
        localStorage.setItem('dataFepese', dataInput.value);
    });
    
    btnGerarProvas.addEventListener('click', () => {
        const baseUrl = baseUrlInput.value.trim();
        const parametros = parametrosInput.value.trim();
        let codigosStr = codigosTextarea.value.trim();
        
        if (!baseUrl) {
            alert('Por favor, informe a URL base.');
            return;
        }
        
        if (!codigosStr) {
            alert('Por favor, informe os códigos dos arquivos.');
            return;
        }
        
        if (!parametros) {
            alert('Por favor, informe os parâmetros da URL.');
            return;
        }
        
        const codigos = processarCodigos(codigosStr);
        
        if (codigos.length === 0) {
            alert('Por favor, informe pelo menos um código válido.');
            return;
        }
        
        const links = gerarLinksProvas(baseUrl, parametros, codigos);
        exibirLinks(links, 'Links das Provas');
        atualizarStatus(`${links.length} links de provas gerados com sucesso!`);
    });
    
    btnGerarGabaritos.addEventListener('click', () => {
        const baseUrl = baseUrlInput.value.trim();
        const parametros = parametrosInput.value.trim();
        const data = dataInput.value;
        
        if (!baseUrl) {
            alert('Por favor, informe a URL base.');
            return;
        }
        
        if (!parametros) {
            alert('Por favor, informe os parâmetros da URL.');
            return;
        }
        
        if (!data) {
            alert('Por favor, informe a data do gabarito.');
            return;
        }
        
        const linksGabaritos = gerarLinksGabaritos(baseUrl, parametros, data);
        
        if (linksGabaritos.length === 0) {
            alert('Nenhum gabarito gerado. Verifique a data informada.');
            return;
        }
        
        exibirLinks(linksGabaritos, 'Links dos Gabaritos');
        const dataExibicao = formatarDataParaExibicao(data);
        const dataArquivo = converterDataInputParaArquivo(data);
        atualizarStatus(`Link do gabarito (${dataExibicao}) gerado com sucesso! Formato: gabarito_${dataArquivo}.pdf`);
    });
    
    btnGerarTudo.addEventListener('click', () => {
        const baseUrl = baseUrlInput.value.trim();
        const parametros = parametrosInput.value.trim();
        let codigosStr = codigosTextarea.value.trim();
        const data = dataInput.value;
        
        if (!baseUrl) {
            alert('Por favor, informe a URL base.');
            return;
        }
        
        if (!codigosStr) {
            alert('Por favor, informe os códigos dos arquivos.');
            return;
        }
        
        if (!parametros) {
            alert('Por favor, informe os parâmetros da URL.');
            return;
        }
        
        const codigos = processarCodigos(codigosStr);
        
        if (codigos.length === 0) {
            alert('Por favor, informe pelo menos um código válido.');
            return;
        }
        
        const linksProvas = gerarLinksProvas(baseUrl, parametros, codigos);
        const linksGabaritos = data ? gerarLinksGabaritos(baseUrl, parametros, data) : [];
        
        // Adicionar link Chapecó usando a mesma URL base
        const linkChapeco = gerarLinkChapeco(baseUrl, data);
        let todosLinks = [...linksProvas, ...linksGabaritos];
        
        if (linkChapeco) {
            todosLinks = [linkChapeco, ...todosLinks];
        }
        
        exibirLinks(todosLinks, 'Todos os Links');
        
        const dataExibicao = data ? formatarDataParaExibicao(data) : 'não informada';
        const dataArquivo = data ? converterDataInputParaArquivo(data) : '';
        atualizarStatus(`${linksProvas.length} provas, ${linksGabaritos.length} gabarito e 1 link Chapecó (${dataExibicao}) gerados com sucesso!`);
    });
    
    btnLimpar.addEventListener('click', () => {
        limparResultados();
    });
    
    const defaultCodigos = [
        'M1', 'M2', 'M3', 'M4',
        'S01', 'S02', 'S03', 'S04', 'S05',
        'S06', 'S07', 'S08', 'S09', 'S10'
    ].join(', ');
    
    if (!codigosTextarea.value) {
        codigosTextarea.value = defaultCodigos;
    }
    
    atualizarStatus('Pronto! Selecione uma opção para gerar os links. A data padrão é hoje (formato: AAAAMMDD). O link Chapecó será gerado automaticamente com a mesma data.');
});