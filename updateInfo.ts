export const updateInfo = {
    description: "Essa atualização é bem técnica. Alteramos a biblioteca padrão de geração de imagens antiga, node-canvas, que está conosco desde a primeira versão do bot para uma nova, chamada de skia-canvas. A idéia aqui é melhorar - nem que um pouco - a velocidade de geração e leitura de imagens do bot. É um primeiro patch de muitos que irei focar na velocidade e estabilidade dele. São mudanças sutis mas que dão um impacto maior na ponta da criação.",
    features: [
        "🔥 Alterada a biblioteca de node-canvas para skia-canvas, afim de melhorar a velocidade de geração de imagem;"
    ],
    fixes: [
        "🔧 Corrige um bug onde usuários novos são registrados com um dia de verificado;",
        "🔧 Corrige um bug onde o analytics não carregava corretamente as fontes do momento;",
        "🔧 Verifica o cache de imagens antes de carregar uma imagem do zero para aumentar a velocidade do bot;",
        "🔧 Altera o uso de ephemeral messages - mensagens que só um usuário consegue visualizar -, conforme a atualização na biblioteca do próprio discord;",
    ]
}