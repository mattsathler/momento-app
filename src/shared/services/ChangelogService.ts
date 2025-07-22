import { updateInfo } from "updateInfo"

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