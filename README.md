
# 📸 Momento App

![Discord Bot](https://img.shields.io/badge/Discord-Bot-5865F2?logo=discord&logoColor=white)
![Node.js](https://img.shields.io/badge/Built%20with-Node.js-339933?logo=node.js&logoColor=white)
![Status](https://img.shields.io/badge/status-in%20development-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)

**Momento** é uma rede social fictícia criada dentro do Discord especialmente para comunidades de RPG.  
Aqui, os jogadores vivem o papel de seus personagens como se estivessem em uma rede social real, com perfis personalizados, posts visuais e estatísticas simbólicas.

---

## 🌟 Funcionalidades

### 🎭 Perfis de Personagem (Photoplayers)
- Nome, @handle e apelido do personagem
- Foto de perfil e visual customizável
- Estatísticas públicas:
  - **Momentos** (posts)
  - **Trends** (posts em destaque)
  - **Followers** (seguidores fictícios)
  - Último post publicado

### 🖼️ Collage
- Galeria visual ao lado do perfil
- Composta por imagens que definem o estilo do personagem
- Customizável pelo usuário a qualquer momento

### 📸 Postagens (Momentos)
- Publicações com fotos, vídeos ou textos
- Duração: **24 horas**
- Exibe curtidas, reposts e comentários
- Vincula um tópico de comentários no Discord

### 📊 Analytics pós-24h
Após o vencimento de um post, o usuário recebe um **painel de analytics** com:
- 📷 Imagem e legenda do post
- 💗 Total de curtidas
- 👥 Seguidores fictícios ganhos (+X)
- 📈 Gráfico de curtidas por hora (últimas 24h)

### ❓ #ask – Perguntas & Respostas
- Qualquer jogador pode enviar perguntas para perfis via post especial `#ask`
- Cada resposta se transforma em um novo post no feed do personagem
- Visual diferenciado: destaque para pergunta + resposta, com nome do perguntador

---

## 💻 Tecnologias Utilizadas

- **Node.js** com suporte a Monorepo e Workspaces
- **Discord.js** para integração com o Discord
- **MongoDB** (para persistência de dados)
- **PM2** para gerenciamento de serviços
- **Canvas ou bibliotecas gráficas** (para gerar imagens como analytics e ask)
- **Cron Jobs e filas internas** (para controle de expiração de posts)

---

## 📦 Estrutura Visual

### Perfil
Exibe dados do personagem com imagem de perfil, estatísticas e tema personalizado pelo usuário.

### Collage
Exibe imagens do personagem com abas de navegação (Collage / Momentos / Trends).

### Post (Momento)
Post padrão com imagem, ações de interação (curtida, repost, comentários).

### Analytics
Painel visual com:
- Dados do post expirado
- Seguidores fictícios ganhos
- Curtidas totais
- Gráfico de performance por hora

### Post do tipo #ask
Pergunta feita por outro usuário, seguida da resposta do photoplayer. Cada resposta gera um post visual.

---

## 🚀 Instalação

> Requisitos:
> - Node.js 18+
> - MongoDB
> - Discord Bot Token
> - PM2

```bash
git clone https://github.com/seu-usuario/momento-app.git
cd momento-app
npm install

npm run pm2
```

> 📌 *Instruções completas de deploy serão adicionadas futuramente.*

---

## 🧪 Contribuindo

Contribuições são bem-vindas!  
Sinta-se livre para abrir issues ou pull requests com sugestões de melhoria, novos recursos ou correções.

---

## 📄 Licença

Este projeto está licenciado sob os termos da **MIT License**.  
Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.

---

## ✨ Criação e Idealização

Desenvolvido por comunidades de RPG com foco em experiências imersivas dentro do Discord. A ideia desse monorepo é dividir as funcionalidades do momento-core em microserviços que se comunicam e agilizam os processos que antes eram feitos por um monolito. O projeto está totalmente arquitetado com base em ferramentas do discordjs, assim, não necessita de hosting específico de API ou qualquer outra ferramenta externa além do MongoDB. Cada microserviço é gerenciado por um BOT e possui um papel fundamental.
