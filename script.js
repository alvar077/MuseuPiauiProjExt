/**
 * Guia Digital Acessível - Museu do Piauí
 * Script principal com funcionalidades de acessibilidade
 */

// Estado da aplicação
const AppState = {
    highContrastActive: false,
    fontSizeLevel: 0,
    vlibrasActive: false,
    screenReaderActive: false,
    currentAudio: null,
    maxFontSizeLevel: 2,
    minFontSizeLevel: 0
};

// Descrições de áudio para diferentes seções
const audioDescriptions = {
    hero: 'Bem-vindo ao Guia Digital Interativo e Acessível do Museu do Piauí. Este guia foi desenvolvido para proporcionar uma experiência cultural inclusiva para todos os visitantes, incluindo pessoas com deficiência visual e auditiva.',
    horarios: 'Horários de Funcionamento do Museu do Piauí. O museu funciona de terça a sexta-feira, das 8 horas às 17 horas. Aos sábados, o horário é das 9 horas às 15 horas. O museu permanece fechado aos domingos e segundas-feiras.',
    ingressos: 'Informações sobre Ingressos e Visitas. A entrada no Museu do Piauí é totalmente gratuita. Oferecemos visitas guiadas mediante agendamento prévio. Para grupos escolares, recomendamos fortemente o agendamento antecipado.',
    localizacao: 'Localização do Museu do Piauí. Estamos situados no Centro Histórico de Teresina, na Praça Marechal Deodoro, sem número. O museu está localizado em um prédio histórico de fácil acesso.',
    comousar: 'Como usar o Guia Digital. Primeiro passo: Abra a câmera do seu celular. Segundo passo: Escaneie o QR Code que está posicionado ao lado de cada peça do acervo. Terceiro passo: Ouça o conteúdo exclusivo com informações detalhadas sobre a peça. Quarto passo: Aproveite sua experiência cultural de forma acessível e interativa.',
    prehistoria: 'Sala de Pré-História. Esta sala apresenta fósseis e artefatos que contam a história dos primeiros habitantes do Piauí, incluindo importantes descobertas arqueológicas da região.',
    indigena: 'Sala de Cultura Indígena. Aqui você encontrará cerâmicas, utensílios e artefatos que representam a rica cultura dos povos indígenas que habitaram o território piauiense.',
    colonial: 'Sala do Período Colonial. Esta exposição conta a história do Piauí durante o período colonial brasileiro, com móveis, documentos históricos e objetos da época.'
};

// Nomes das salas para leitura
const roomNames = {
    'prehistoria': 'Pré-História',
    'indigena': 'Cultura Indígena',
    'colonial': 'Período Colonial'
};

// Configurações de síntese de voz
const speechConfig = {
    lang: 'pt-BR',
    rate: 0.9,
    pitch: 1
};

/**
 * Utilitários de síntese de voz
 */
const SpeechUtils = {
    /**
     * Verifica se a síntese de voz está disponível
     */
    isAvailable() {
        return 'speechSynthesis' in window;
    },

    /**
     * Cancela qualquer fala em andamento
     */
    cancel() {
        if (this.isAvailable()) {
            window.speechSynthesis.cancel();
        }
    },

    /**
     * Fala um texto usando síntese de voz
     * @param {string} text - Texto a ser falado
     * @param {Function} onEnd - Callback quando a fala terminar
     */
    speak(text, onEnd = null) {
        if (!this.isAvailable() || !text) {
            console.warn('Síntese de voz não disponível ou texto vazio');
            return;
        }

        this.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = speechConfig.lang;
        utterance.rate = speechConfig.rate;
        utterance.pitch = speechConfig.pitch;

        if (onEnd) {
            utterance.onend = onEnd;
        }

        try {
            window.speechSynthesis.speak(utterance);
        } catch (error) {
            console.error('Erro ao reproduzir áudio:', error);
        }
    }
};

/**
 * Funcionalidades de acessibilidade
 */
const Accessibility = {
    /**
     * Alterna o modo de alto contraste
     * @param {Event} event - Evento do clique
     */
    toggleHighContrast(event) {
        if (!event) {
            console.warn('Evento não fornecido para toggleHighContrast');
            return;
        }

        AppState.highContrastActive = !AppState.highContrastActive;
        document.body.classList.toggle('high-contrast', AppState.highContrastActive);

        const btn = event.target.closest('.accessibility-btn');
        if (btn) {
            btn.classList.toggle('active', AppState.highContrastActive);
        }

        const message = AppState.highContrastActive 
            ? 'Alto contraste ativado' 
            : 'Alto contraste desativado';
        SpeechUtils.speak(message);
    },

    /**
     * Aumenta o tamanho da fonte
     */
    increaseFontSize() {
        if (AppState.fontSizeLevel < AppState.maxFontSizeLevel) {
            AppState.fontSizeLevel++;
            this.updateFontSize();
            SpeechUtils.speak('Tamanho da fonte aumentado');
        } else {
            SpeechUtils.speak('Tamanho máximo de fonte atingido');
        }
    },

    /**
     * Diminui o tamanho da fonte
     */
    decreaseFontSize() {
        if (AppState.fontSizeLevel > AppState.minFontSizeLevel) {
            AppState.fontSizeLevel--;
            this.updateFontSize();
            SpeechUtils.speak('Tamanho da fonte diminuído');
        } else {
            SpeechUtils.speak('Tamanho mínimo de fonte atingido');
        }
    },

    /**
     * Atualiza o tamanho da fonte aplicando classes CSS
     */
    updateFontSize() {
        document.body.classList.remove('font-large', 'font-xlarge');
        if (AppState.fontSizeLevel === 1) {
            document.body.classList.add('font-large');
        } else if (AppState.fontSizeLevel === 2) {
            document.body.classList.add('font-xlarge');
        }
    },

    /**
     * Alterna o VLibras (tradutor de Libras)
     * @param {Event} event - Evento do clique
     */
    toggleVLibras(event) {
        if (!event) {
            console.warn('Evento não fornecido para toggleVLibras');
            return;
        }

        AppState.vlibrasActive = !AppState.vlibrasActive;
        const btn = event.target.closest('.accessibility-btn');
        if (btn) {
            btn.classList.toggle('active', AppState.vlibrasActive);
        }

        if (AppState.vlibrasActive) {
            if (!document.querySelector('[vw]')) {
                this.loadVLibras();
            }
            SpeechUtils.speak('Tradutor de Libras ativado');
        } else {
            SpeechUtils.speak('Tradutor de Libras desativado');
        }
    },

    /**
     * Carrega o widget VLibras
     */
    loadVLibras() {
        try {
            // Verifica se já existe o script
            if (document.querySelector('script[src*="vlibras-plugin"]')) {
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
            script.async = true;
            
            script.onload = () => {
                try {
                    if (window.VLibras && window.VLibras.Widget) {
                        new window.VLibras.Widget('https://vlibras.gov.br/app');
                    }
                } catch (error) {
                    console.error('Erro ao inicializar VLibras:', error);
                }
            };

            script.onerror = () => {
                console.error('Erro ao carregar script do VLibras');
                SpeechUtils.speak('Erro ao carregar tradutor de Libras');
            };

            document.body.appendChild(script);

            // Cria o container do widget
            const div = document.createElement('div');
            div.setAttribute('vw', '');
            div.className = 'enabled';
            div.innerHTML = '<div vw-access-button class="active"></div><div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div>';
            document.body.appendChild(div);
        } catch (error) {
            console.error('Erro ao carregar VLibras:', error);
        }
    },

    /**
     * Alterna o modo de narração automática
     * @param {Event} event - Evento do clique
     */
    toggleScreenReader(event) {
        if (!event) {
            console.warn('Evento não fornecido para toggleScreenReader');
            return;
        }

        AppState.screenReaderActive = !AppState.screenReaderActive;
        const btn = event.target.closest('.accessibility-btn');
        if (btn) {
            btn.classList.toggle('active', AppState.screenReaderActive);
        }

        if (AppState.screenReaderActive) {
            SpeechUtils.speak('Modo de narração ativado. Os textos serão lidos automaticamente ao passar o mouse.');
        } else {
            SpeechUtils.speak('Modo de narração desativado');
        }
    }
};

/**
 * Funcionalidades de áudio
 */
const AudioFeatures = {
    /**
     * Reproduz descrição de áudio para uma seção
     * @param {string} section - Identificador da seção
     * @param {Event} event - Evento do clique (opcional)
     */
    playAudioDescription(section, event = null) {
        // Para qualquer áudio em reprodução
        if (AppState.currentAudio) {
            this.stopAudio();
        }

        const text = audioDescriptions[section];
        if (!text) {
            console.warn(`Descrição de áudio não encontrada para: ${section}`);
            SpeechUtils.speak('Descrição de áudio não disponível');
            return;
        }

        if (!SpeechUtils.isAvailable()) {
            alert('Síntese de voz não está disponível no seu navegador.');
            return;
        }

        const btn = event ? event.target.closest('.audio-description-btn') : null;
        if (btn) {
            btn.classList.add('playing');
        }

        const audioIndicator = document.getElementById('audioIndicator');
        if (audioIndicator) {
            audioIndicator.classList.add('show');
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = speechConfig.lang;
        utterance.rate = speechConfig.rate;
        utterance.pitch = speechConfig.pitch;

        utterance.onend = () => {
            if (btn) {
                btn.classList.remove('playing');
            }
            if (audioIndicator) {
                audioIndicator.classList.remove('show');
            }
            AppState.currentAudio = null;
        };

        utterance.onerror = (error) => {
            console.error('Erro ao reproduzir áudio:', error);
            if (btn) {
                btn.classList.remove('playing');
            }
            if (audioIndicator) {
                audioIndicator.classList.remove('show');
            }
            AppState.currentAudio = null;
            SpeechUtils.speak('Erro ao reproduzir áudio');
        };

        AppState.currentAudio = utterance;
        
        try {
            window.speechSynthesis.speak(utterance);
        } catch (error) {
            console.error('Erro ao reproduzir áudio:', error);
            if (btn) {
                btn.classList.remove('playing');
            }
            if (audioIndicator) {
                audioIndicator.classList.remove('show');
            }
            AppState.currentAudio = null;
        }
    },

    /**
     * Para a reprodução de áudio atual
     */
    stopAudio() {
        SpeechUtils.cancel();

        document.querySelectorAll('.audio-description-btn.playing').forEach(btn => {
            btn.classList.remove('playing');
        });

        const audioIndicator = document.getElementById('audioIndicator');
        if (audioIndicator) {
            audioIndicator.classList.remove('show');
        }

        AppState.currentAudio = null;
    }
};

/**
 * Funcionalidades de navegação
 */
const Navigation = {
    /**
     * Rola suavemente para uma seção
     * @param {string} sectionId - ID da seção
     */
    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
            SpeechUtils.speak(`Navegando para ${sectionId}`);
        } else {
            console.warn(`Seção não encontrada: ${sectionId}`);
        }
    },

    /**
     * Mostra informações de uma sala
     * @param {string} roomName - Nome da sala
     */
    showRoom(roomName) {
        const roomDisplayName = roomNames[roomName];
        if (!roomDisplayName) {
            console.warn(`Sala não encontrada: ${roomName}`);
            return;
        }

        // Reproduz a descrição de áudio (sem evento, pois é chamado programaticamente)
        AudioFeatures.playAudioDescription(roomName);

        setTimeout(() => {
            Navigation.scrollToSection('pecas');
        }, 500);

        SpeechUtils.speak(`Explorando sala de ${roomDisplayName}`);
    },

    /**
     * Abre o Google Maps com rotas para o museu
     */
    openGoogleMaps() {
        const lat = -5.0892;
        const lng = -42.8019;
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

        try {
            const newWindow = window.open(url, '_blank');
            if (!newWindow) {
                alert('Por favor, permita pop-ups para abrir o Google Maps.');
                return;
            }
            SpeechUtils.speak('Abrindo o Google Maps com rotas para o Museu do Piauí.');
        } catch (error) {
            console.error('Erro ao abrir Google Maps:', error);
            SpeechUtils.speak('Erro ao abrir o Google Maps');
        }
    }
};

/**
 * Funcionalidades de formulário
 */
const FormHandler = {
    /**
     * Processa o envio do formulário de feedback
     * @param {Event} event - Evento de submit
     */
    submitFeedback(event) {
        event.preventDefault();

        const form = event.target;
        const nomeInput = form.querySelector('#nome');
        const emailInput = form.querySelector('#email');
        const mensagemInput = form.querySelector('#mensagem');

        if (!nomeInput || !emailInput || !mensagemInput) {
            console.error('Campos do formulário não encontrados');
            return;
        }

        const nome = nomeInput.value.trim();
        const email = emailInput.value.trim();
        const mensagem = mensagemInput.value.trim();

        // Validação básica
        if (!nome || !email || !mensagem) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        // Validação de email simples
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Por favor, insira um e-mail válido.');
            return;
        }

        SpeechUtils.speak(`Obrigado ${nome}! Seu feedback foi enviado com sucesso.`);

        alert(`✅ Obrigado pelo seu feedback, ${nome}!\n\nSua mensagem foi enviada com sucesso e será analisada pela nossa equipe.\n\nEntraremos em contato através do e-mail: ${email}`);

        form.reset();
    }
};

/**
 * Configuração de atalhos de teclado
 */
const KeyboardShortcuts = {
    /**
     * Inicializa os atalhos de teclado
     */
    init() {
        document.addEventListener('keydown', (e) => {
            if (!e.altKey) return;

            switch (e.key.toLowerCase()) {
                case 'c':
                    e.preventDefault();
                    Accessibility.toggleHighContrast(e);
                    break;
                case 'l':
                    e.preventDefault();
                    Accessibility.toggleVLibras(e);
                    break;
                case 'n':
                    e.preventDefault();
                    Accessibility.toggleScreenReader(e);
                    break;
                case '+':
                case '=':
                    e.preventDefault();
                    Accessibility.increaseFontSize();
                    break;
                case '-':
                case '_':
                    e.preventDefault();
                    Accessibility.decreaseFontSize();
                    break;
            }
        });
    }
};

/**
 * Configuração do modo de narração automática
 */
const ScreenReaderMode = {
    /**
     * Inicializa o modo de narração automática
     */
    init() {
        const elements = document.querySelectorAll('h1, h2, h3, p, button, a, [role="button"]');
        
        elements.forEach(element => {
            element.addEventListener('mouseenter', function() {
                if (AppState.screenReaderActive && this.textContent.trim()) {
                    SpeechUtils.speak(this.textContent.trim());
                }
            });
        });
    }
};

/**
 * Funções globais para uso inline no HTML
 * Mantidas para compatibilidade com os event handlers inline
 */
window.toggleHighContrast = (event) => Accessibility.toggleHighContrast(event);
window.increaseFontSize = () => Accessibility.increaseFontSize();
window.decreaseFontSize = () => Accessibility.decreaseFontSize();
window.toggleVLibras = (event) => Accessibility.toggleVLibras(event);
window.toggleScreenReader = (event) => Accessibility.toggleScreenReader(event);
window.playAudioDescription = (section, event) => AudioFeatures.playAudioDescription(section, event);
window.stopAudio = () => AudioFeatures.stopAudio();
window.scrollToSection = (sectionId) => Navigation.scrollToSection(sectionId);
window.showRoom = (roomName) => Navigation.showRoom(roomName);
window.openGoogleMaps = () => Navigation.openGoogleMaps();
window.submitFeedback = (event) => FormHandler.submitFeedback(event);

/**
 * Inicialização quando o DOM estiver pronto
 */
document.addEventListener('DOMContentLoaded', () => {
    KeyboardShortcuts.init();
    ScreenReaderMode.init();

    // Log de informações úteis no console
    console.log('%c🎉 GUIA DIGITAL DO MUSEU DO PIAUÍ', 'color: #00743F; font-size: 20px; font-weight: bold;');
    console.log('%c🔑 ATALHOS DE TECLADO:', 'color: #0066B3; font-size: 16px; font-weight: bold;');
    console.log('Alt + C = Alto Contraste');
    console.log('Alt + L = Libras');
    console.log('Alt + N = Narração');
    console.log('Alt + + = Aumentar Fonte');
    console.log('Alt + - = Diminuir Fonte');
});

