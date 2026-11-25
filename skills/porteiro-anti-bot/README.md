# 🛡️ Porteiro Anti-Bot & Cloaker (Skill Reutilizável)

Este pacote contém a proteção completa contra clonagem, bots do Facebook/Meta, ferramentas de espionagem (Ad Spy) e acessos estrangeiros, entregando uma **Safe Page de Travesseiros Ortopédicos (SonoNuvem®)** via **Rewrite Transparente**.

---

## 🚀 Como usar em novos sites

### Opção 1: Via Claude Code / Antigravity (Prompt)
A skill já foi instalada globalmente no seu Claude Code e Antigravity. Em qualquer novo projeto, basta dizer:
> *"Instale o porteiro anti-bot com a página de travesseiros neste projeto"*

O Claude/Antigravity irá ler a skill automaticamente e configurar tudo no novo projeto.

---

### Opção 2: Via Script Automático (1 clique)
Abra o terminal na raiz do seu novo projeto Next.js e execute:

```bash
node C:/Users/g0atm/.claude/skills/porteiro-anti-bot/scripts/install.mjs
```

Ou copie a pasta `skills/porteiro-anti-bot` para o novo projeto e rode:
```bash
node skills/porteiro-anti-bot/scripts/install.mjs
```

---

## ⚙️ O que é configurado automaticamente:

1. `src/lib/porteiro/config.ts`: Modos de operação (`ativo`, `observar`, `off`), lista de países permitidos e chave mestra.
2. `src/lib/porteiro/bots.ts`: Padrões e regex de alta performance para User-Agents de crawlers, scrapers e spy tools.
3. `src/lib/porteiro/cookie.ts`: Gerador e validador de sessão segura para navegação rápida de usuários reais.
4. `src/lib/porteiro/analise.ts`: Algoritmo de filtragem multi-camada (GeoIP + Bot UA + Headers + Cookie + Bypass).
5. `src/app/vitrine/page.tsx`: E-commerce completo de travesseiros ortopédicos SonoNuvem®.
6. `src/middleware.ts`: Interceptação com Rewrite Transparente (o bot/concorrente acessa `seusite.com/` e vê a vitrine de travesseiros com status 200 OK).
7. `src/app/components/AntiClone.tsx`: Anti-iframe (framebusting), bloqueio de clique direito e atalhos de cópia de código (`Ctrl+S`, `Ctrl+U`, `F12`).
