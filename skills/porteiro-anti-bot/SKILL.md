---
name: porteiro-anti-bot
description: Instala e configura proteção completa anti-bot, cloaker com página de travesseiros (white page / safe page), bloqueio de scrapers do Facebook/Meta e geolocalização (apenas Brasil) em qualquer projeto Next.js.
---

# Porteiro Anti-Bot & Cloaker Skill

Esta skill instala uma barreira completa contra bots, clonagem de páginas e tráfego estrangeiro em projetos Next.js (App Router / Pages Router / Cloudflare OpenNext / Vercel).

## O que a proteção faz:
1. **Bloqueio de Bots e Scrapers do Facebook/Meta:** Bloqueia `facebookexternalhit`, `Facebot`, `meta-externalagent`, `facebookcatalog`.
2. **Bloqueio de Ad Spy Tools:** Bloqueia ferramentas usadas por concorrentes para clonar anúncios e funis (`adplexity`, `adspy`, `dropispy`, `pipia`, `poweradspy`, `bytespider`, `python-requests`, `puppeteer`, etc.).
3. **Filtro Geográfico (Apenas Brasil):** Bloqueia acessos vindos de fora do Brasil (`cf-ipcountry != BR`, `x-vercel-ip-country`, `x-country-code`, Tor `T1`).
4. **Entrega de Safe Page (Loja de Travesseiros):** Em vez de retornar um erro 403 que alerta o concorrente ou reprova anúncio, o Next.js faz um **Rewrite Transparente** servindo a página de e-commerce de travesseiros ortopédicos na mesma URL (`https://seusite.com/`).
5. **Acesso Normal para Brasileiros:** Usuários reais do Brasil navegam normalmente pelo funil e recebem um cookie assinado (`__pt`) de 7 dias para navegação instantânea.
6. **Chave Mestra de Bypass:** Permite que o operador acesse de qualquer lugar/VPN usando `?chave=SEGREDO`.
7. **Proteção Anti-Clonagem no Cliente:** Bloqueia iframes (framebusting), clique direito e atalhos de salvar código (`Ctrl+S`, `Ctrl+U`, `F12`).

---

## Como Instalar em Qualquer Projeto

### Método Automático (1 Comando)
Execute o instalador automático na raiz de qualquer projeto Next.js:
```bash
node skills/porteiro-anti-bot/scripts/install.mjs
```
Ou usando a skill instalada globalmente:
```bash
node C:/Users/g0atm/.claude/skills/porteiro-anti-bot/scripts/install.mjs
```
