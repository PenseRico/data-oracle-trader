import type { AbaManual } from "./types";

export const ABA_COMECANDO: AbaManual = {
  id: "comecando",
  titulo: "Começando",
  descricao: "O básico pra dar os primeiros passos: o que é a plataforma, como criar sua conta, como se achar no painel e o que é Grátis ou PRO.",
  paginas: [
    {
      id: "primeiro-acesso",
      titulo: "Visão Geral & Primeiro Acesso",
      rota: "/",
      plano: "Grátis",
      resumo:
        "A Crypto Rico é uma plataforma brasileira que pega o caos do mercado de criptomoedas e entrega tudo mastigado: termômetros de sentimento, sinais, gráficos e leituras por IA (inteligência artificial). A página inicial (a capa do site) apresenta os recursos e é por ela que você cria sua conta e entra no painel. Nada aqui é recomendação de investimento — é estudo e leitura de mercado, e a decisão final é sempre sua.",
      comoUsar: [
        "Acesse cryptorico.app. Você cai na capa do site, com o menu no topo: Início, Tecnologia, IA Carteira, Recursos e Preços.",
        "Role a página pra conhecer os módulos: bot (robô que segue regras), leitura de carteira por IA, análise on-chain (dados de dentro da rede do Bitcoin) e mais.",
        "Pra entrar, clique em 'Começar Gratuitamente' ou em 'Acessar' no topo. Se você ainda não estiver logado, vai abrir a tela de login.",
        "Criar conta com e-mail: na tela de login, clique em 'Não tem conta? Criar agora'. Preencha Username (seu apelido na plataforma), Email e Senha (mínimo de 6 caracteres).",
        "Marque a caixinha 'Li e aceito os Termos de Uso e a Política de Privacidade'. É obrigatório — sem marcar, o botão 'Criar Conta' fica travado. Os links abrem os documentos em outra aba, se quiser ler antes.",
        "Clique em 'Criar Conta'. Se aparecer o aviso de confirmação, abra seu e-mail, clique no link que enviamos e depois volte pra fazer login. Se não pedir confirmação, você já entra direto no painel.",
        "Atalho: clique em 'Entrar com Google' e escolha sua conta Google. É 1 clique, sem criar senha e sem esperar e-mail de confirmação.",
        "Esqueceu a senha? Na tela de login, digite seu e-mail no campo Email e clique em 'Esqueci minha senha'. Chega um link de recuperação no seu e-mail; ele abre uma página pra você definir uma senha nova.",
        "Depois de logar, você é levado direto pro painel (o Terminal de Comando). Bem-vindo!",
      ],
      indicadores: [
        {
          nome: "Selo de sentimento no topo da capa (ex.: 'Medo Extremo · Índice 12/100')",
          oQueE: "É uma amostra do índice de Medo & Ganância (Fear & Greed): um termômetro de 0 a 100 que mede a emoção do mercado cripto, do pânico total (0) à euforia total (100).",
          comoLer: "Perto de 0 = medo extremo (todo mundo em pânico, cor vermelha/rosa). Perto de 100 = ganância extrema (todo mundo eufórico). No meio, o mercado está 'morno'.",
          sinalCompra: "Historicamente, medo extremo (abaixo de 30) costuma aparecer perto de fundos — momento que muita gente usa pra ESTUDAR compras com calma.",
          sinalVenda: "Ganância extrema (acima de 70) costuma aparecer perto de topos — momento de redobrar a cautela e pensar em proteger lucros.",
          cuidado: "O número mostrado na capa é uma demonstração da interface (vitrine). O índice de verdade, atualizado ao vivo, fica dentro do painel, nos Termômetros do Terminal de Comando.",
        },
        {
          nome: "Terminal-demonstração (preço do BTC, Sentimento Global e IA Score)",
          oQueE: "A 'janelinha de terminal' no meio da capa mostra como é o painel por dentro: preço do Bitcoin, o termômetro de sentimento e o IA Score (nota de 0 a 100% que resume vários indicadores num número só).",
          comoLer: "No painel real, score alto em verde puxa pra leitura de compra; sentimento em vermelho indica medo. Aqui na capa, serve pra você conhecer o visual antes de entrar.",
          cuidado: "Os valores dessa janelinha são ilustrativos (uma prévia congelada da interface). Não use os números da capa pra tomar decisão — entre no painel pra ver os dados ao vivo.",
        },
        {
          nome: "Faixa rolante de preços (ticker)",
          oQueE: "A faixa que passa rolando com pares como BTC/USDT e ETH/USDT, mostrando preço e variação em verde (subiu) ou vermelho (caiu).",
          comoLer: "Verde com sinal de + = moeda subindo. Vermelho com sinal de − = moeda caindo. É só um gostinho do acompanhamento em tempo real que existe dentro do painel.",
          cuidado: "Assim como o resto da capa, essa faixa é demonstrativa. Os preços ao vivo, atualizados de verdade, estão nas telas internas (Terminal de Comando e Market).",
        },
      ],
      dicas: [
        "Prefira o login com Google se quiser velocidade: sem senha pra decorar e sem e-mail de confirmação.",
        "Se o e-mail de confirmação não chegar, olhe a caixa de spam/lixo eletrônico antes de tentar de novo.",
        "Guarde os links do rodapé da capa: Termos de Uso, Privacidade e este Manual ficam sempre acessíveis lá.",
      ],
    },
    {
      id: "navegacao",
      titulo: "Navegação do Painel",
      rota: "/dashboard",
      plano: "Grátis",
      resumo:
        "Depois de logar, tudo acontece no painel. A tela inicial é o Terminal de Comando e o menu lateral esquerdo é seu mapa: ele agrupa todas as ferramentas em 3 blocos (Principal, Filtros & Sinais e Ferramentas). Aprender a se achar nesse menu é o passo mais importante do começo.",
      comoUsar: [
        "Ao logar você cai no Terminal de Comando (a 'home' do painel), com visão geral do mercado, gráfico do Bitcoin e oportunidades do dia.",
        "Olhe o menu lateral esquerdo. Grupo 'Principal' = telas de leitura de mercado: Terminal de Comando, Minha Carteira, Market, Heatmap + Calendário, Dados On-Chain, TradingView Pro, Painel de Gráficos, Livro de Ordens, Mapa de Liquidez e Simulador de Risco.",
        "Grupo 'Filtros & Sinais' (com iconezinho de funil) = os robôs e filtros que garimpam moedas: Bot Swing Trade, Bot Scalping, Central de Sinais (MTF RSI), Sinais de Compra, Sinais de Venda, Exaustão RSI, Setup Curto Prazo (Intraday) e Setup Longo Prazo (Swing).",
        "Grupo 'Ferramentas' = apoio do dia a dia: Manual / Guia, Alertas, Terminal Notícias, Mesa de Operações (chat), Formação Academy (ainda 'em breve') e Perfil Analista.",
        "A página em que você está fica destacada no menu (fundo aceso e texto na cor verde da marca). Assim você sempre sabe onde está.",
        "Pra recolher o menu e ganhar espaço de tela: clique no botão de recolher no canto superior esquerdo do cabeçalho (o iconezinho ao lado do menu). O menu encolhe e vira só ícones; clique de novo pra expandir.",
        "Com o menu recolhido, passe o mouse nos ícones pra se localizar — cada ícone é uma página.",
        "Onde fica o Manual: grupo 'Ferramentas' > 'Manual / Guia'. Ele também tem link no rodapé do site. Pode abrir sem medo: é gratuito e público.",
        "Perdeu-se? Clique no logo Crypto Rico no topo do menu lateral — ele sempre leva de volta ao Terminal de Comando.",
      ],
      indicadores: [
        {
          nome: "Destaque do item ativo (item aceso no menu)",
          oQueE: "O item do menu com fundo destacado e cor verde mostra qual página está aberta agora.",
          comoLer: "Um item aceso por vez = sua localização atual no painel. Os demais ficam apagados até você clicar.",
        },
        {
          nome: "Selo 'em breve'",
          oQueE: "Etiqueta cinza em itens do menu que ainda não foram liberados (hoje, a Formação Academy).",
          comoLer: "Item apagado com 'em breve' = não clicável ainda. Quando o recurso for lançado, o selo some e o item passa a abrir normalmente.",
          cuidado: "Não é erro nem bloqueio do seu plano — é só um recurso em construção.",
        },
        {
          nome: "Seletor 'Ver como' (Free / Pro) no rodapé do menu",
          oQueE: "Duas chaves no pé do menu lateral que deixam você visualizar a plataforma como usuário Free ou como usuário Pro. É um recurso de prévia (teste) enquanto a assinatura não entra no ar.",
          comoLer: "Botão aceso = modo ativo. Em 'Free', as páginas PRO mostram a tela de bloqueio; em 'Pro', tudo abre normalmente.",
          cuidado: "Se uma página aparecer bloqueada 'do nada', confira se você não deixou o seletor em 'Free' sem querer. Basta clicar em 'Pro' pra liberar de novo.",
        },
      ],
      dicas: [
        "No celular ou notebook pequeno, recolha o menu pra dar mais espaço aos gráficos.",
        "Sugestão de rotina de iniciante: Terminal de Comando (clima geral) > Heatmap (visão colorida do dia) > Terminal Notícias (o que pode mexer no mercado).",
        "Sempre que travar em algum termo, volte ao Manual — cada página tem seus indicadores explicados aba por aba.",
      ],
    },
    {
      id: "planos",
      titulo: "Planos Grátis e PRO",
      rota: "/#precos",
      plano: "Grátis",
      resumo:
        "A Crypto Rico tem dois planos. No Grátis, toda a leitura de mercado fica liberada pra sempre. No PRO, entram as ferramentas de 'mesa de operações': carteira com IA, bots e sinais prontos. Importante: durante a fase de testes está TUDO liberado pra todo mundo — a cobrança ainda não começou.",
      comoUsar: [
        "O que é Grátis: Terminal de Comando, Market, Heatmap + Calendário, Dados On-Chain, TradingView Pro, Painel de Gráficos, Livro de Ordens, Mapa de Liquidez, Simulador de Risco, Exaustão RSI, Alertas, Terminal Notícias, Mesa de Operações, Perfil Analista e este Manual.",
        "O que é PRO (8 páginas): Minha Carteira, Bot Swing Trade, Bot Scalping, Central de Sinais (MTF RSI), Sinais de Compra, Sinais de Venda, Setup Curto Prazo e Setup Longo Prazo.",
        "Se você abrir uma página PRO estando no plano Free, aparece a tela de bloqueio 'Recurso Pro': um cartão com cadeado, a lista de benefícios do PRO e o botão 'Assinar Pro'. Dá pra voltar ao painel gratuito por um clique no rodapé do cartão.",
        "AGORA, NA FASE DE TESTES: todo mundo entra com tudo liberado (como Pro), sem pagar nada. Aproveite pra explorar todas as ferramentas.",
        "Quer sentir como será a versão gratuita? Use o seletor 'Ver como' (Free/Pro) no rodapé do menu lateral e alterne entre os dois modos.",
        "Os preços exibidos na capa do site (seção 'Preços') mostram o plano Gratuito de R$ 0 e o PRO de R$ 15,90/mês (ou R$ 129 à vista no ano). A assinatura oficial e o pagamento serão ativados numa próxima fase.",
      ],
      indicadores: [
        {
          nome: "Tela de bloqueio 'Recurso Pro' (cartão com cadeado)",
          oQueE: "A tela que substitui o conteúdo quando um usuário Free tenta abrir uma página exclusiva do PRO. Ela explica o que é o plano e lista os benefícios.",
          comoLer: "Título 'X é exclusivo do plano Pro' + lista com checks verdes dos benefícios + botão 'Assinar Pro'. O aviso deixa claro: as análises de mercado continuam grátis; o PRO é a parte de carteira, IA, bots e sinais.",
          cuidado: "Ver essa tela durante os testes normalmente significa que o seletor 'Ver como' está em 'Free'. Troque pra 'Pro' no rodapé do menu e a página abre.",
        },
        {
          nome: "Lista de benefícios PRO",
          oQueE: "Os itens que aparecem na tela de bloqueio (e no paywall) resumindo o que o PRO entrega.",
          comoLer: "São eles: Minha Carteira com leitura por IA (venda/recompra); Bots Swing Trade + Scalping; Sinais de Compra e Venda + Central MTF RSI; Setups Curto e Longo Prazo; e Alertas que disparam (em breve).",
          cuidado: "Nenhum benefício é promessa de lucro. Bots e sinais são ferramentas de estudo e organização — quem decide e executa é você, por sua conta e risco.",
        },
        {
          nome: "Preços na capa (R$ 0 e R$ 15,90/mês)",
          oQueE: "Os dois cartões da seção 'Preços' da capa: Gratuito (R$ 0, sem cartão de crédito) e Crypto Rico PRO (R$ 15,90/mês ou R$ 129 à vista no plano anual).",
          comoLer: "O cartão verde com selo 'Mais Popular' é o PRO. O gratuito é vitalício e não pede cartão.",
          cuidado: "A cobrança ainda não está ativa. Enquanto durar a fase de testes, todos os recursos PRO ficam liberados sem pagamento.",
        },
      ],
      dicas: [
        "Aproveite a fase de testes pra descobrir quais ferramentas PRO fazem sentido pro seu perfil antes de qualquer assinatura.",
        "Comece pelo simples: domine as telas gratuitas de leitura de mercado antes de mergulhar nos bots e sinais.",
        "Regra de ouro da casa: tudo aqui é estudo de mercado, nunca recomendação de investimento. Só arrisque o que você pode perder.",
      ],
    },
  ],
};
