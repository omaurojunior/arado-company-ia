# 🌾 Arado — Diagnóstico Inteligente de Culturas e Pastagens

O **Arado** é um aplicativo web feito sob medida para produtores rurais, colonos e técnicos do campo examinarem os sinais de saúde de suas plantações (como milho, soja, capim brachiaria e pasto) de forma extremamente fácil, visual e acessível. 

Este projeto combina o poder do **React (Vite) + Tailwind CSS** no front-end com um servidor **Node.js (Express)** no back-end, integrado diretamente à Inteligência Artificial do **Gemini 3.5 Flash** para fornecer orientações de manejo, alertas de perigos agrícolas e diagnósticos rápidos e práticos por comando de voz.

---

## 🚀 Como Subir para o GitHub direto do Google AI Studio

O Google AI Studio possui um fluxo nativo facilitado de sincronização:

1. Acesse o menu de configurações da aplicação (ícone de engrenagem) ou clique diretamente no botão de exportação no topo direito do visualizador.
2. Selecionar a opção **"Export to GitHub"** (Exportar para o GitHub).
3. Conecte sua conta do GitHub e conceda as permissões requeridas.
4. Escolha se quer salvar como um **repositório público ou privado** e defina o nome do repositório (ex: `arado-diagnostico-ia`).
5. Clique em Criar. Todo o código do projeto será enviado diretamente ao seu GitHub!

---

## ⚡ Como Hospedar na Vercel (Passo a Passo)

A Vercel é uma das melhores plataformas de hospedagem do mundo e se conecta de forma direta com o seu GitHub.

### Passo 1: Criando o Projeto na Vercel
1. Acesse o site oficial [vercel.com](https://vercel.com) e crie uma conta gratuita (você pode conectar utilizando a sua conta do GitHub).
2. No painel inicial da Vercel, clique no botão **"Add New..."** e escolha **"Project"** (Projeto).
3. Importe o repositório do seu **Arado** que você acabou de subir para o GitHub.

### Passo 2: Configurando Variáveis de Ambiente (Segurança)
A Vercel precisa saber qual chave do Gemini ela usará para responder às suas requisições. 
1. Durante a importação de configurações do projeto na Vercel, role a página até a seção **"Environment Variables"** (Variáveis de Ambiente).
2. Adicione a variável secreta de produção:
   - **Key / Nome**: `GEMINI_API_KEY`
   - **Value / Valor**: *Insira aqui sua chave obtida no Google AI Studio / Google Cloud.*
3. Clique em **Add** para salvar a variável com segurança no servidor.

### Passo 3: Comandos de Build na Vercel
O projeto já está configurado de forma inteligente para que a Vercel gere a build automaticamente. Certifique-se de que as configurações na Vercel estejam assim por padrão:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install` (ou deixado em branco para detecção automática)

Clique no botão **"Deploy"** e aguarde até a tela de sucesso com os confetes! 🥳

> 🌿 **Hospedagem Full-Stack ou Estática**: Por padrão, a Vercel compila todo o seu front-end React na pasta de alta velocidade `dist/` para servir estaticamente. Caso pretenda utilizar o servidor Express (`server.ts`) como Serverless Function diretamente na Vercel, adicione um arquivo chamado `vercel.json` na raiz apontando o roteamento da pasta `api/` para o servidor. Se preferir rodar o servidor Express contínuo de forma gratuita com contêiner autônomo de backend tradicional, considere utilizar o **Railway.app** ou **Render.com** conectando as variáveis no painel deles!

---

## 🛠️ Tecnologias e Recursos Principais

- **Visual e Cores de Campo**: Temas de alta visibilidade e alto contraste, botões e campos de toque grandes, ideal para uso sob a luz do sol por homens do campo no dia a dia físico.
- **Leitura do Diagnóstico por Voz (Acessibilidade)**: Botão de síntese de voz (TTS) nativo integrado para ler em voz alta os exames para aqueles produtores que preferem ouvir a receita de manejo em vez de ler na tela.
- **Exames Compartilháveis**: Ferramenta de cópia rápida formatada de forma limpa e bonita para enviar todo o laudo direto no **WhatsApp** com os vizinhos rurais, veterinários e cooperativas gaúchas.
- **Histórico Interno Offline**: Salva automaticamente os resultados da lavoura na memória local do smartphone ou tablet do produtor rural (usando LocalStorage) para que ele nunca perca o controle do campo.

---

## 📦 Desenvolvendo Localmente (No Computador)

Caso queira clonar o código do GitHub e rodar no seu computador pessoal:

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/seu-repositorio.git

# 2. Acesse a pasta do projeto
cd seu-repositorio

# 3. Instale todas as dependências
npm install

# 4. Crie um arquivo .env na raiz (siga o modelo .env.example) e insira sua chave
GEMINI_API_KEY=sua_chave_secreta_aqui

# 5. Rode o servidor de testes local
npm run dev
```

Acesse o link gerado no terminal (geralmente `http://localhost:3000`) para ver e testar o funcionamento!

---

🌾 **Arado** - *Sua lavoura bem protegida, de forma simples e direta de produtor para produtor!*
