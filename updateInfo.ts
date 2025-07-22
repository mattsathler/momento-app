export const updateInfo = {
    description: "Essa atualização traz de novo os **TEMAS DE SISTEMAS**, que serão **públicos** para todos os usuários. A idéia é que, mesmo sem verificado, vocês possam personalizar um pouco mais o perfil de vocês. A princípio, traremos dois temas padrões: light & dark. Mas a idéia é que possamos fazer esses temas de forma temporária, como em datas comemorativas, por exemplo.",
    features: [
        "🔥 Possibilita o uso de temas de sistema para todos os usuários;",
        "🔥 Adiciona a opção de criação de temas de sistema para desenvolvedores do bot;",
        "🔥 Transforma a mensagem de configuração do perfil em ephemeral, aparecendo apenas para o dono do perfil;",
        "🔥 Cria o canal de temas de sistema no HUB;",
        "🔥 Altera o campo pronome para apelido, facilitando o uso pelos jogadores;",
    ],
    fixes: [
        "🔧 Remove a necessidade de verificar a todo momento se o usuário é verificado ou não;",
        "🔧 Remove campos de estilização de verificados para usuários não verificados;",
        "🔧 Muda a forma que lidamos com analytics. Ao invés de um cache, verificamos no banco a cada 5min. Isso mitigará os posts que bugam e ficam para sempre no perfil. Mas no futuro trarei uma solução mais robusta;",
    ]
}