import type { AbaManual } from "./types";

export const ABA_COMUNIDADE: AbaManual = {
  id: "comunidade",
  titulo: "Comunidade & Conta",
  descricao:
    "O lado social da plataforma: o chat ao vivo da Mesa de Operações, o seu Perfil Analista com estatísticas e a Formação Academy com aulas em vídeo.",
  paginas: [
    {
      id: "community",
      titulo: "Mesa de Operações",
      rota: "/dashboard/community",
      plano: "Grátis",
      resumo:
        "Um chat ao vivo entre os membros da plataforma, no estilo Discord (aplicativo de conversa em canais). Tem dois canais: #mesa-de-operações (papo livre sobre o mercado, em tempo real) e #setups (feed de operações que os membros compartilham pra estudo). Você vê quem está online agora, manda texto e imagem, e ainda tem o link do grupo no Telegram. Lembre: tudo que aparece ali é opinião de membro, não recomendação de investimento.",
      comoUsar: [
        "No computador, a tela tem 3 colunas: canais à esquerda, a conversa no meio e a lista de quem está online à direita. No celular, use os botões 'Mesa', 'Setups' e 'Telegram' no topo.",
        "Clique em #mesa-de-operações pra entrar no chat ao vivo. As mensagens novas aparecem sozinhas, sem precisar atualizar a página.",
        "Pra falar, escreva no campo 'Mensagem para #mesa-de-operações' embaixo e aperte o botão de enviar (aviãozinho). É preciso estar logado.",
        "Pra mandar um print de gráfico, clique no botão de imagem (ícone de foto com +) ao lado do campo de texto e escolha o arquivo. A imagem aparece na conversa pra todo mundo.",
        "Errou ou se arrependeu? Passe o mouse sobre a SUA mensagem e clique na lixeirinha que aparece. Você só consegue apagar as suas próprias mensagens.",
        "Clique em #setups pra ver o feed de operações compartilhadas pelos membros, cada uma num cartão com entrada, alvo e stop.",
        "Quer continuar o papo fora da plataforma? Clique em 'Grupo Telegram' (na coluna da esquerda, seção 'Externo') pra entrar no grupo oficial.",
        "Na coluna da direita, acompanhe a lista 'Online' — quem está com a página aberta agora aparece ali com uma bolinha verde.",
      ],
      indicadores: [
        {
          nome: "Canal #mesa-de-operações",
          oQueE: "O chat principal, ao vivo, de todos os membros. É onde se troca ideia sobre o mercado no dia a dia, com o selo verde piscando 'ao vivo' no topo mostrando que a conexão em tempo real está ativa.",
          comoLer: "Cada mensagem mostra a bolinha colorida com as iniciais do autor (a cor é sorteada automaticamente pra cada pessoa), o nome do autor, o horário de envio e o texto ou imagem. Mensagens seguidas da mesma pessoa aparecem agrupadas, sem repetir o nome. Nas suas mensagens aparece a etiqueta 'você'.",
          cuidado: "Nada dito no chat é recomendação de investimento. É conversa entre membros, cada um com sua experiência. Desconfie de qualquer mensagem prometendo lucro fácil — isso é proibido nas regras e costuma ser golpe.",
        },
        {
          nome: "Canal #setups (Setups em Destaque)",
          oQueE: "Um feed de operações que os membros compartilham pra estudo. Cada cartão traz o autor, a data, a moeda e o plano completo da operação: onde entrar, onde sair com ganho e onde sair se der errado.",
          comoLer: "A etiqueta LONG (verde) significa aposta na alta; SHORT (vermelha) significa aposta na queda. 'Entrada Target' mostra o preço de entrada e o alvo (ex.: $60.000 → $65.000). 'SL' em vermelho é o stop loss (preço de saída pra cortar a perda se o mercado for contra). Entre aspas vem a justificativa do autor, e o botão 'Ver análise' abre a discussão.",
          sinalCompra: "Um setup LONG bem explicado pode servir de PONTO DE PARTIDA pro seu próprio estudo: confira o gráfico, os indicadores da plataforma e veja se a ideia faz sentido pra você.",
          sinalVenda: "Um setup SHORT indica que aquele membro enxerga queda. De novo: use como alerta pra investigar, nunca como ordem pra vender.",
          cuidado: "Setup compartilhado é a opinião de UM membro, não da plataforma. Nunca copie uma operação sem entender a entrada, o alvo e principalmente o stop. Quem entra sem stop definido está operando sem cinto de segurança.",
        },
        {
          nome: "Lista 'Online' (coluna da direita)",
          oQueE: "Mostra em tempo real quem está com a Mesa de Operações aberta agora. Cada pessoa aparece com avatar colorido e uma bolinha verde; ao lado do título aparece o número total de conectados.",
          comoLer: "Se o contador está alto, a mesa está movimentada — bom momento pra puxar conversa. Você aparece na lista com a marcação '(você)'. No rodapé da coluna há o total de membros que já participaram do chat (ex.: '12 membros no total').",
          cuidado: "A lista mostra quem está com a página aberta neste instante. Se alguém fechar a aba, some da lista — não significa que saiu da comunidade.",
        },
        {
          nome: "Grupo Telegram (link externo)",
          oQueE: "Atalho pro grupo oficial da comunidade no Telegram (aplicativo de mensagens). Fica na seção 'Externo' da coluna de canais e abre em nova aba.",
          comoLer: "Clique e o Telegram abre com o convite do grupo. É um canal extra pra receber avisos e conversar mesmo quando não estiver com a plataforma aberta.",
          cuidado: "Golpistas criam grupos falsos imitando comunidades de cripto. Só entre pelo link oficial de dentro da plataforma. Ninguém da equipe vai te chamar no privado pedindo dinheiro, senha ou depósito — se acontecer, é golpe: denuncie e bloqueie.",
        },
        {
          nome: "Regras de boa convivência",
          oQueE: "O combinado básico pra mesa continuar útil e segura pra todo mundo, especialmente pra quem está começando.",
          comoLer: "1) Sem spam: nada de flood (mensagens repetidas), correntes ou propaganda de outros serviços. 2) Sem golpe: proibido divulgar esquemas de pirâmide, 'gestores de banca', links suspeitos ou pedir depósito de outros membros. 3) Sem promessa de lucro: ninguém pode garantir retorno — quem promete, quebra a regra. 4) Respeito sempre: sem ofensas, preconceito ou ataque pessoal; discorde da análise, não da pessoa. 5) Setup é estudo: compartilhe operação com entrada, alvo e stop claros, deixando claro que é opinião, não recomendação. 6) Proteja seus dados: não publique documentos, chaves de carteira ou informações pessoais suas ou de terceiros.",
          cuidado: "Mensagens que quebram as regras podem ser removidas e o membro pode perder o acesso ao chat. Viu algo estranho? Não responda nem clique em links — avise a equipe.",
        },
      ],
      dicas: [
        "Antes de postar uma dúvida, role o chat: muitas vezes alguém acabou de discutir o mesmo assunto.",
        "Ao compartilhar um print de gráfico, diga qual é a moeda e o tempo gráfico (ex.: BTC no gráfico de 4 horas) — fica muito mais fácil de alguém te ajudar.",
        "Trate todo setup como material de estudo: refaça a análise nas ferramentas da plataforma antes de qualquer decisão. A responsabilidade pela operação é sempre sua.",
      ],
    },
    {
      id: "profile",
      titulo: "Perfil Analista",
      rota: "/dashboard/profile",
      plano: "Grátis",
      resumo:
        "Sua página pessoal na plataforma. No topo ficam seu avatar (a inicial do seu e-mail), seu nome de usuário, seu e-mail, a data de entrada e o seu rank (nível). Abaixo, três cartões de estatística resumem sua atividade, e as abas mostram seus alertas e setups. A edição de foto e dados do perfil ainda está em desenvolvimento e chega em breve.",
      comoUsar: [
        "Abra 'Perfil Analista' no menu. No cartão do topo você vê seu avatar, nome, e-mail e duas etiquetas: 'Rank' (seu nível) e 'Joined' (data em que entrou).",
        "Logo abaixo, confira os 3 cartões de estatística: Alertas Ativos, Setups Compartilhados e Sinal de Precisão.",
        "Use a aba 'Meus Alertas' pra ver quantos alertas de preço você tem configurados no momento.",
        "Use a aba 'Meus Setups' pra ver as operações que você publicou no canal #setups da Mesa. Se ainda não publicou nenhuma, aparece 'Nenhum setup publicado ainda'.",
        "A aba 'Configurações' está reservada pra edição de foto, nome e dados da conta — esse recurso está sendo finalizado e chega em breve.",
      ],
      indicadores: [
        {
          nome: "Rank (Bronze / Silver / Gold)",
          oQueE: "Seu nível dentro da comunidade, mostrado numa etiqueta no topo do perfil. Ele sobe conforme você participa compartilhando setups.",
          comoLer: "Bronze é o nível inicial de todo mundo. Compartilhando mais de 5 setups você vira Silver (Prata). Passando de 10, vira Gold (Ouro).",
          cuidado: "O rank mede PARTICIPAÇÃO, não qualidade nem resultado. Um membro Gold não está 'mais certo' que um Bronze — avalie cada análise pelo conteúdo, não pela medalha de quem postou.",
        },
        {
          nome: "Alertas Ativos",
          oQueE: "Contador de quantos alertas de preço você tem configurados na plataforma neste momento.",
          comoLer: "Número puro: 3 significa 3 alertas te vigiando o mercado. O mesmo número aparece dentro da aba 'Meus Alertas'.",
          cuidado: "Alerta demais vira ruído: se o celular apita o dia todo, você para de dar atenção. Mantenha só os alertas dos preços que realmente importam pro seu plano.",
        },
        {
          nome: "Setups Compartilhados",
          oQueE: "Contador de quantas operações (setups) foram publicadas no feed da comunidade. É esse número que faz seu rank subir.",
          comoLer: "Quanto maior, mais ativo o perfil na troca de ideias da Mesa de Operações.",
          cuidado: "Compartilhe pra aprender com o retorno dos outros membros, não pra 'farmar' rank. Setup sem entrada, alvo e stop definidos não ajuda ninguém.",
        },
        {
          nome: "Sinal de Precisão",
          oQueE: "Um percentual exibido no terceiro cartão de estatística (ex.: 84%), pensado pra futuramente medir a taxa de acerto associada ao perfil.",
          comoLer: "Hoje esse número é ilustrativo, da fase beta da plataforma — ele ainda não é calculado a partir das suas operações reais.",
          cuidado: "Não use esse percentual pra tomar decisão nem pra comparar membros. Nenhuma taxa de acerto, nem a real, garante resultado futuro.",
        },
      ],
      dicas: [
        "Escolheu um username na hora do cadastro? É ele que aparece no topo do perfil e nas suas mensagens do chat.",
        "Visite o perfil de vez em quando pra revisar seus alertas: apague os que já cumpriram o papel.",
        "Foto de perfil e edição de dados chegam em breve — por enquanto, seu avatar é a inicial do seu e-mail com a cor da plataforma.",
      ],
    },
    {
      id: "academy",
      titulo: "Formação Academy",
      rota: "/dashboard/academy",
      plano: "Grátis",
      resumo:
        "A área de estudos da plataforma, ainda em fase Beta (versão de testes, com o selo 'Beta' no topo). É uma trilha de formação em vídeo, dividida em 6 módulos que vão do zero absoluto até temas avançados. As aulas em vídeo estão sendo produzidas e serão liberadas em breve — a grade de módulos já mostra o caminho completo.",
      comoUsar: [
        "Abra 'Academy' no menu. Você vê a grade com os 6 módulos da formação, cada um num cartão com nome, descrição, número de aulas e duração total.",
        "Os módulos abertos têm o botão de play (círculo com triângulo). Clique no cartão pra abrir o player e ver a lista de aulas do módulo.",
        "Os módulos com cadeado e etiqueta 'Exclusivo' aparecem acinzentados: são conteúdos que serão liberados por etapas, conforme a formação for publicada.",
        "Comece sempre pelo Módulo 1 (Fundamentos). A trilha foi pensada em ordem: cada módulo usa o que foi ensinado no anterior.",
        "Fique de olho no selo 'Beta': novas aulas e módulos vão sendo liberados aos poucos, sem aviso prévio.",
      ],
      indicadores: [
        {
          nome: "Trilha de 6 módulos",
          oQueE: "A grade completa da formação: 1) Fundamentos do Mercado Cripto (8 aulas, 2h30); 2) Análise Técnica — RSI e Médias Móveis (12 aulas, 4h15); 3) Setups de Entrada e Saída (10 aulas, 3h40); 4) Gestão de Risco (6 aulas, 1h50); 5) On-Chain Analysis Avançado (8 aulas, 3h); 6) Trading de Derivativos (10 aulas, 4h).",
          comoLer: "Módulos 1 e 2 aparecem abertos (com play); módulos 3 a 6 aparecem com cadeado e etiqueta 'Exclusivo', aguardando liberação. Em cada cartão, o rodapé mostra a contagem de aulas e a duração total.",
          cuidado: "A Academy está em Beta: os vídeos ainda estão sendo produzidos e os títulos, durações e a ordem dos módulos podem mudar até o lançamento completo.",
        },
        {
          nome: "Cartão de módulo (play, cadeado e etiqueta 'Exclusivo')",
          oQueE: "Cada módulo é um cartão com capa. O ícone dentro da capa diz o estado dele: play redondo = disponível pra abrir; cadeado cinza + etiqueta 'Exclusivo' = ainda bloqueado.",
          comoLer: "Cartão colorido com play: clique e o player abre com a lista de aulas (título, descrição e duração de cada uma, ex.: 'Como ler Candles e Gráficos — 25:00'). Cartão acinzentado com cadeado: ainda não clicável.",
          cuidado: "Nenhuma aula ensina 'fórmula de ficar rico' — o objetivo é te dar base pra ler o mercado por conta própria. Desconfie de qualquer curso, aqui ou fora, que prometa lucro garantido.",
        },
      ],
      dicas: [
        "Enquanto as aulas não chegam, este Manual é seu melhor material de estudo: ele explica cada indicador que você vê nas telas.",
        "Anote dúvidas enquanto estuda e leve pra Mesa de Operações — explicar e perguntar acelera muito o aprendizado.",
        "O módulo de Gestão de Risco é o mais importante da trilha inteira: saber quanto arriscar vale mais do que qualquer indicador.",
      ],
    },
  ],
};
