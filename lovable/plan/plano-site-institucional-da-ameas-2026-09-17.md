# Plano: Site institucional da AMEAS

## Objetivo
Criar a página inicial institucional da AMEAS com identidade visual baseada na logo, usando todas as imagens anexadas sem cortes e com foco em doação, inclusão, esporte adaptado e credibilidade institucional.

## O que será construído
- Cabeçalho fixo com logo, navegação para as seções e botão “Doar Agora”.
- Carrossel inicial com fotos reais, frase de impacto, botões de doação e WhatsApp.
- Seção “Sobre a Associação” com texto institucional emotivo sobre história, inclusão, acolhimento e impacto.
- Seção “Fundadora” dedicada à Karina Meneguini, usando especificamente a foto individual com fundo neutro e legenda “CONVIDADA” como imagem oficial dela.
- Cards para “Missão, Visão e Valores”.
- Organograma visual com Diretoria, Coordenação Técnica, Equipe Multidisciplinar, Voluntários e Apoio.
- Área completa de doações com botão de copiar PIX, QR code demonstrativo, dados da Lei de Incentivo ao Esporte, dados bancários e orientação para falar com contador.
- Seção de apoiadores com badges elegantes dos parceiros citados e o banner comemorativo anexado.
- Galeria interativa com todas as fotos anexadas, preservando proporções, com visualizador em tela cheia.
- Depoimentos de atletas, famílias e parceiros.
- Botão flutuante de doação com coração e modal com PIX, QR code, dados bancários e WhatsApp.

## Direção visual
- Paleta: azul escuro/royal, vermelho coração, branco e dourado suave.
- Aparência acolhedora, institucional e moderna.
- Fotos sempre exibidas com proporção preservada, sem cortes.
- Uso de cards claros, bordas suaves, detalhes dourados e chamadas fortes em vermelho.

## Detalhes técnicos
- Substituir a página inicial atual por uma página única com seções navegáveis.
- Externalizar as imagens enviadas como assets do projeto e importar os ponteiros JSON.
- Atualizar os tokens visuais em `src/styles.css` para refletir a identidade da AMEAS.
- Adicionar metadados próprios da página inicial, evitando textos genéricos.
- Implementar copiar PIX, modal de doação, carrossel e lightbox no próprio frontend.

## Assumptions
- O QR code será demonstrativo, porque nenhum QR code PIX oficial foi enviado.
- Os depoimentos serão textos institucionais representativos, pois depoimentos reais não foram fornecidos.
- A foto individual com fundo neutro e legenda “CONVIDADA” será usada como destaque oficial da fundadora; a foto do treino seguirá na galeria e nas atividades de esporte adaptado.
