const updateInfo = {
    description: "Essa atualização veio para dar mais customização para os perfis! Agora, é possível adicionar pronomes de tratamento que ficará exposto em seu perfil, sendo opcional. É um passo a mais para diversificação e personalização do seu usuário. Também trarei mais transparência das atualizações usando esse canal, de changelog, para falar o que estamos alterando e quais os próximos passos.",
    features: [
        "🔥 Possibilita a criação de pronomes de tratamento para o usuário. Ex.: Ele/Dele, Ela/Dela, etc;",
        "🔥 Cria o changelog, canal próprio para transparência de atualizações. Automatizado e conectado com o projeto;",
        "🔥 Transforma o uso de emojis no nome de usuários apenas para verificados no momento",
    ],
    fixes: [
        "🔧 Corrige um problema de verificação de campos que impossibilitava a alteração do nome de usuário;"
    ]
}

export function getUpdateInfo(version: string) {
    const json = {
        "components": [
            {
                "type": 17,
                "accent_color": null,
                "spoiler": false,
                "components": [
                    {
                        "type": 12,
                        "items": [
                            {
                                "media": {
                                    "url": "https://imgur.com/yTEFZAt.png"
                                },
                                "description": null,
                                "spoiler": false
                            }
                        ]
                    },
                    {
                        "type": 14,
                        "divider": true,
                        "spacing": 1
                    },
                    {
                        "type": 10,
                        "content": `# ${version}\n\n${updateInfo.description}`
                    },
                    {
                        "type": 14,
                        "divider": true,
                        "spacing": 1
                    },
                    {
                        "type": 10,
                        "content": "### Alterações\n\n"
                    }
                ],
            }],
        "flags": 32768
    }

    updateInfo.features.forEach(feature => {
        json.components[0].components.push(
            {
                "type": 10,
                "content": `${feature}\n\n`
            }
        )
    })

    json.components[0].components.push(
        {
            "type": 10,
            "content": "### Fixes\n\n"
        }
    )

    updateInfo.fixes.forEach(fix => {
        json.components[0].components.push(
            {
                "type": 10,
                "content": `${fix}\n\n`
            }
        )
    })
    return json;
}