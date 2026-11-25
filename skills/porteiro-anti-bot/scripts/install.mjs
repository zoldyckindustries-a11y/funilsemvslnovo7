import fs from "node:fs";
import path from "node:path";

console.log("=================================================");
console.log("🛡️  INSTALADOR PORTEIRO ANTI-BOT & CLOAKER");
console.log("=================================================\n");

const cwd = process.cwd();

// 1. Verifica se é um projeto Next.js
const pkgPath = path.join(cwd, "package.json");
if (!fs.existsSync(pkgPath)) {
  console.error("❌ Erro: package.json não encontrado. Execute o comando na raiz de um projeto Next.js.");
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
if (!pkg.dependencies?.next && !pkg.devDependencies?.next) {
  console.error("❌ Erro: Este projeto não parece ser um projeto Next.js.");
  process.exit(1);
}

// 2. Detecta se usa diretório src/
const hasSrc = fs.existsSync(path.join(cwd, "src"));
const baseDir = hasSrc ? path.join(cwd, "src") : cwd;
console.log(`📁 Estrutura detectada: ${hasSrc ? "Com pasta src/" : "Raiz (sem src/)"}`);

// 3. Diretórios de destino
const dirPorteiro = path.join(baseDir, "lib", "porteiro");
const dirComponents = path.join(baseDir, "app", "components");
const dirVitrine = path.join(baseDir, "app", "vitrine");

fs.mkdirSync(dirPorteiro, { recursive: true });
fs.mkdirSync(dirComponents, { recursive: true });
fs.mkdirSync(dirVitrine, { recursive: true });

// Conteúdo dos arquivos
const ARQUIVOS = {
  // lib/porteiro/config.ts
  [path.join(dirPorteiro, "config.ts")]: `/**
 * Configuração central do Porteiro (Cloaker / Proteção Anti-Bot).
 */

export type ModoPorteiro = "off" | "observar" | "ativo";

export interface ConfigPorteiro {
  modo: ModoPorteiro;
  paisesLiberados: Set<string>;
  chave: string;
  botScoreMin: number;
  dominiosAutorizados: string[];
}

function normalizarModo(valor: string | undefined): ModoPorteiro {
  if (valor === "off" || valor === "observar") return valor;
  return "ativo";
}

function extrairLista(valor: string | undefined, padrao: string[]): string[] {
  const itens = (valor ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return itens.length > 0 ? itens : padrao;
}

export function lerConfigPorteiro(): ConfigPorteiro {
  const chave = process.env.PORTEIRO_CHAVE || "liberar_funil_2026";
  const dominiosBruto = process.env.PORTEIRO_DOMINIOS || process.env.NEXT_PUBLIC_ALLOWED_DOMAINS;

  return {
    modo: normalizarModo(process.env.PORTEIRO_MODO),
    paisesLiberados: new Set(
      extrairLista(process.env.PORTEIRO_PAISES, ["BR"]).map((p) => p.toUpperCase())
    ),
    chave,
    botScoreMin: Number.parseInt(process.env.PORTEIRO_BOTSCORE_MIN || "30", 10),
    dominiosAutorizados: extrairLista(dominiosBruto, []),
  };
}

export const COOKIE_PORTEIRO = "__pt";
export const PARAM_CHAVE = "chave";
`,

  // lib/porteiro/bots.ts
  [path.join(dirPorteiro, "bots.ts")]: `/**
 * Padrões de User-Agents de bots conhecidos, scrapers, crawlers do Facebook,
 * ferramentas de espionagem de anúncios e automações headless.
 */

export const PADROES_FACEBOOK_BOTS = [
  "facebookexternalhit",
  "facebot",
  "facebookbot",
  "meta-externalagent",
  "meta-externalfetcher",
  "facebookcatalog",
  "facebookplatform",
];

export const PADROES_AD_SPY = [
  "adplexity",
  "adspy",
  "dropispy",
  "pipia",
  "poweradspy",
  "anstrex",
  "spyover",
  "idvert",
  "adbeat",
  "socialpeta",
  "bigspy",
  "droppoint",
  "adheart",
];

export const PADROES_HEADLESS_AUTOMATION = [
  "headlesschrome",
  "headless",
  "puppeteer",
  "playwright",
  "selenium",
  "phantomjs",
  "webdriver",
  "cypress",
  "nightwatch",
  "casperjs",
];

export const PADROES_SCRAPERS_HTTP = [
  "python-requests",
  "aiohttp",
  "httpx",
  "curl/",
  "wget",
  "scrapy",
  "urllib",
  "libwww",
  "go-http-client",
  "okhttp",
  "axios",
  "postmanruntime",
  "insomnia",
  "httpie",
  "apache-httpclient",
  "java/",
  "node-fetch",
  "undici",
  "got/",
  "restsharp",
];

export const PADROES_CRAWLERS_GERAIS = [
  "bytespider",
  "bytedance",
  "petalbot",
  "yandex",
  "baiduspider",
  "sogou",
  "semrushbot",
  "ahrefsbot",
  "mj12bot",
  "dotbot",
  "screaming frog",
  "blexbot",
  "seekport",
  "zoominfobot",
  "exabot",
  "amazonbot",
  "claude-web",
  "gptbot",
  "chatgpt-user",
  "applebot",
  "bingbot",
];

const TODOS_PADROES = [
  ...PADROES_FACEBOOK_BOTS,
  ...PADROES_AD_SPY,
  ...PADROES_HEADLESS_AUTOMATION,
  ...PADROES_SCRAPERS_HTTP,
  ...PADROES_CRAWLERS_GERAIS,
];

const REGEX_BOTS = new RegExp(TODOS_PADROES.join("|"), "i");

export function ehUserAgentDeBot(userAgent: string | null | undefined): {
  ehBot: boolean;
  padrao?: string;
} {
  if (!userAgent || userAgent.trim().length < 12) {
    return { ehBot: true, padrao: "ua_vazio_ou_curto" };
  }

  const match = userAgent.match(REGEX_BOTS);
  if (match) {
    return { ehBot: true, padrao: match[0].toLowerCase() };
  }

  return { ehBot: false };
}
`,

  // lib/porteiro/cookie.ts
  [path.join(dirPorteiro, "cookie.ts")]: `/**
 * Funções seguras e Edge-compatible para geração e verificação de cookies.
 */

import { COOKIE_PORTEIRO } from "./config";

export function gerarTokenHumano(chave: string): string {
  const agora = new Date();
  const dia = agora.toISOString().slice(0, 10);
  let hash = 0;
  const texto = \`\${dia}:\${chave}:autorizado_humano_br\`;
  for (let i = 0; i < texto.length; i++) {
    hash = (hash << 5) - hash + texto.charCodeAt(i);
    hash |= 0;
  }
  return \`h_\${Math.abs(hash).toString(36)}_\${dia.replace(/-/g, "")}\`;
}

export function validarTokenHumano(token: string | undefined | null, chave: string): boolean {
  if (!token || !token.startsWith("h_")) return false;

  const partes = token.split("_");
  if (partes.length < 3) return false;

  const dataStr = partes[2];
  if (dataStr.length !== 8) return false;

  const ano = parseInt(dataStr.substring(0, 4), 10);
  const mes = parseInt(dataStr.substring(4, 6), 10) - 1;
  const dia = parseInt(dataStr.substring(6, 8), 10);
  const dataCookie = new Date(Date.UTC(ano, mes, dia));
  const hoje = new Date();

  const diferencaDias = (hoje.getTime() - dataCookie.getTime()) / (1000 * 60 * 60 * 24);
  if (diferencaDias < 0 || diferencaDias > 7) {
    return false;
  }

  const tokenEsperado = gerarTokenHumano(chave);
  return token.split("_")[1] === tokenEsperado.split("_")[1];
}

export { COOKIE_PORTEIRO };
`,

  // lib/porteiro/analise.ts
  [path.join(dirPorteiro, "analise.ts")]: `import { NextRequest } from "next/server";
import { ConfigPorteiro, PARAM_CHAVE } from "./config";
import { ehUserAgentDeBot } from "./bots";
import { validarTokenHumano } from "./cookie";

export interface ResultadoAnalise {
  ehBot: boolean;
  motivo: string;
  pais: string;
  userAgent: string;
  chaveBypassUsada: boolean;
  ip?: string;
}

export function analisarRequisicao(
  req: NextRequest,
  config: ConfigPorteiro
): ResultadoAnalise {
  const headers = req.headers;
  const userAgent = headers.get("user-agent") || "";
  const acceptLanguage = (headers.get("accept-language") || "").toLowerCase();
  const acceptEncoding = headers.get("accept-encoding");

  const pais = (
    headers.get("cf-ipcountry") ||
    headers.get("x-vercel-ip-country") ||
    headers.get("cloudfront-viewer-country") ||
    headers.get("x-country-code") ||
    ""
  ).toUpperCase().trim();

  const ip =
    headers.get("cf-connecting-ip") ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "desconhecido";

  // 1. Chave mestre de Bypass (?chave=...)
  const chaveUrl = req.nextUrl.searchParams.get(PARAM_CHAVE);
  if (config.chave && chaveUrl === config.chave) {
    return {
      ehBot: false,
      motivo: "bypass_chave_mestra",
      pais: pais || "BR",
      userAgent,
      chaveBypassUsada: true,
      ip,
    };
  }

  // 2. Cookie de sessão validada previamente
  const cookiePt = req.cookies.get("__pt")?.value;
  if (cookiePt && validarTokenHumano(cookiePt, config.chave)) {
    return {
      ehBot: false,
      motivo: "sessao_humana_previa",
      pais: pais || "BR",
      userAgent,
      chaveBypassUsada: false,
      ip,
    };
  }

  // 3. Checagem de User-Agent de bots
  const resultadoBot = ehUserAgentDeBot(userAgent);
  if (resultadoBot.ehBot) {
    return {
      ehBot: true,
      motivo: \`bot_detectado: \${resultadoBot.padrao || "desconhecido"}\`,
      pais,
      userAgent,
      chaveBypassUsada: false,
      ip,
    };
  }

  // 4. Bloqueio de rede Tor (T1)
  if (pais === "T1") {
    return {
      ehBot: true,
      motivo: "bloqueio_rede_tor",
      pais,
      userAgent,
      chaveBypassUsada: false,
      ip,
    };
  }

  // 5. Verificação geográfica
  const host = req.headers.get("host") || "";
  const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");

  if (pais && pais !== "XX") {
    if (!config.paisesLiberados.has(pais)) {
      return {
        ehBot: true,
        motivo: \`pais_estrangeiro_bloqueado: \${pais}\`,
        pais,
        userAgent,
        chaveBypassUsada: false,
        ip,
      };
    }
  } else if (!isLocalhost) {
    if (!acceptLanguage || !acceptLanguage.includes("pt")) {
      return {
        ehBot: true,
        motivo: "sem_geolocalizacao_e_sem_idioma_pt",
        pais: "DESCONHECIDO",
        userAgent,
        chaveBypassUsada: false,
        ip,
      };
    }
  }

  // 6. Heurística de cabeçalhos de navegadores reais
  if (!acceptEncoding && !isLocalhost) {
    return {
      ehBot: true,
      motivo: "cabecalhos_obrigatorios_ausentes",
      pais,
      userAgent,
      chaveBypassUsada: false,
      ip,
    };
  }

  // 7. Cloudflare Bot Management (se ativo)
  const botScoreHeader = headers.get("cf-bot-management-score");
  if (botScoreHeader) {
    const score = parseInt(botScoreHeader, 10);
    if (!isNaN(score) && score < config.botScoreMin) {
      return {
        ehBot: true,
        motivo: \`cf_bot_score_baixo: \${score}\`,
        pais,
        userAgent,
        chaveBypassUsada: false,
        ip,
      };
    }
  }

  return {
    ehBot: false,
    motivo: "humano_brasileiro_aprovado",
    pais: pais || "BR",
    userAgent,
    chaveBypassUsada: false,
    ip,
  };
}
`,

  // middleware.ts
  [path.join(baseDir, "middleware.ts")]: `import { NextRequest, NextResponse } from "next/server";
import { lerConfigPorteiro } from "./lib/porteiro/config";
import { analisarRequisicao } from "./lib/porteiro/analise";
import { COOKIE_PORTEIRO, gerarTokenHumano } from "./lib/porteiro/cookie";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (pathname === "/vitrine") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/lezty/webhook") || pathname.startsWith("/api/webhook")) {
    return NextResponse.next();
  }

  const config = lerConfigPorteiro();

  if (config.modo === "off") {
    const res = NextResponse.next();
    res.headers.set("x-porteiro-status", "desligado");
    return res;
  }

  const analise = analisarRequisicao(req, config);

  if (analise.ehBot) {
    if (config.modo === "ativo") {
      const urlVitrine = new URL("/vitrine", req.url);
      const res = NextResponse.rewrite(urlVitrine);
      res.headers.set("x-porteiro-status", "bloqueado");
      res.headers.set("x-porteiro-motivo", analise.motivo);
      return res;
    }

    const res = NextResponse.next();
    res.headers.set("x-porteiro-status", "bot_em_observacao");
    res.headers.set("x-porteiro-motivo", analise.motivo);
    return res;
  }

  const res = NextResponse.next();
  res.headers.set("x-porteiro-status", "liberado");
  res.headers.set("x-porteiro-motivo", analise.motivo);

  const token = gerarTokenHumano(config.chave);
  res.cookies.set(COOKIE_PORTEIRO, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api/.*webhook|.*\\\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|mp4|webm)).*)",
  ],
};
`,

  // app/components/AntiClone.tsx
  [path.join(dirComponents, "AntiClone.tsx")]: `"use client";

import { useEffect } from "react";

interface AntiCloneProps {
  dominiosAutorizados?: string[];
}

export function AntiClone({ dominiosAutorizados }: AntiCloneProps) {
  useEffect(() => {
    try {
      if (window.top && window.top !== window.self) {
        window.top.location.href = window.self.location.href;
      }
    } catch {}

    if (dominiosAutorizados && dominiosAutorizados.length > 0) {
      const hostnameAtual = window.location.hostname.toLowerCase();
      const isLocal =
        hostnameAtual === "localhost" ||
        hostnameAtual === "127.0.0.1" ||
        hostnameAtual.endsWith(".local");

      if (!isLocal) {
        const autorizado = dominiosAutorizados.some(
          (d) =>
            hostnameAtual === d.toLowerCase() ||
            hostnameAtual.endsWith(\`.\${d.toLowerCase()}\`)
        );

        if (!autorizado) {
          window.location.href = "https://google.com.br";
          return;
        }
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F12") {
        e.preventDefault();
        return false;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "u" || e.key === "U")) {
        e.preventDefault();
        return false;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        return false;
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c")
      ) {
        e.preventDefault();
        return false;
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [dominiosAutorizados]);

  return null;
}
`,

  // app/vitrine/page.tsx
  [path.join(dirVitrine, "page.tsx")]: `"use client";

import React, { useState } from "react";
import {
  Truck,
  RotateCcw,
  Star,
  ShoppingBag,
  Sparkles,
  Lock,
  Flame,
} from "lucide-react";

export default function VitrineTravesseiros() {
  const [quantidade, setQuantidade] = useState<number>(1);
  const precoUnitario = 119.9;
  const precoTotal = (precoUnitario * quantidade).toFixed(2).replace(".", ",");
  const parcela = ((precoUnitario * quantidade) / 12).toFixed(2).replace(".", ",");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      <div className="bg-emerald-600 text-white text-xs sm:text-sm font-medium py-2 px-4 text-center flex items-center justify-center gap-2 shadow-inner">
        <Truck className="w-4 h-4" />
        <span>
          <strong>FRETE GRÁTIS</strong> PARA TODO O BRASIL NAS PRÓXIMAS 2 HORAS | 30 DIAS DE TESTE
        </span>
      </div>

      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center text-white font-black text-xl shadow-md">
              S
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                Sono<span className="text-indigo-600">Nuvem</span>
              </span>
              <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold -mt-1">
                Ortopedia & Conforto
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="#comprar"
              className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-3 py-2 rounded-lg text-sm transition border border-indigo-200"
            >
              <ShoppingBag className="w-4 h-4 text-indigo-600" />
              <span>Garantir Oferta</span>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xl aspect-4/3 flex items-center justify-center p-6 group">
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
                <span className="bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow">
                  Pronta Entrega
                </span>
                <span className="bg-amber-500 text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-current" /> 52% OFF HOJE
                </span>
              </div>

              <div className="w-full h-full flex flex-col items-center justify-center relative">
                <div className="w-80 h-44 bg-gradient-to-br from-slate-100 via-white to-slate-200 rounded-3xl shadow-2xl border-4 border-indigo-50 relative flex items-center justify-center">
                  <div className="text-center z-10">
                    <p className="text-xs uppercase tracking-widest text-indigo-700 font-black">
                      SonoNuvem®
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Memory Foam NASA + Gel Refrescante
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1 bg-white/90 border border-slate-200 px-2.5 py-1 rounded-md text-[10px] text-slate-700 font-semibold shadow-xs">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      Espuma Viscoelástica Ortopédica
                    </div>
                  </div>
                </div>
                <div className="w-72 h-4 bg-slate-300/40 blur-md rounded-full mt-4" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-700">4.9 / 5.0</span>
                <span className="text-xs text-slate-400">(14.892 avaliações no Brasil)</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                Travesseiro Ortopédico Cervical SonoNuvem® Anatômico
              </h1>
              <p className="text-sm text-slate-600 mt-2">
                Projetado por especialistas em postura e medicina do sono para eliminar
                dores no pescoço, ombros e coluna desde a primeira noite de uso.
              </p>
            </div>

            <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 sm:p-5">
              <div className="flex items-baseline gap-3">
                <span className="text-sm line-through text-slate-400 font-medium">De R$ 249,90</span>
                <span className="text-3xl sm:text-4xl font-black text-slate-900">R$ {precoTotal}</span>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">
                  Economize R$ 130,00
                </span>
              </div>
              <p className="text-xs text-indigo-900 font-medium mt-1">
                em até <strong>12x de R$ {parcela}</strong> no cartão ou à vista no Pix.
              </p>
            </div>

            <div id="comprar" className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => alert("Redirecionando para o checkout seguro...")}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base sm:text-lg py-4 px-6 rounded-2xl shadow-lg shadow-emerald-600/30 transition transform active:scale-[0.99] flex items-center justify-center gap-3"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>COMPRAR AGORA COM FRETE GRÁTIS</span>
              </button>

              <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" /> Compra 100% Criptografada
                </span>
                <span className="flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5 text-indigo-600" /> 30 Dias de Garantia
                </span>
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-emerald-600" /> Envio Expresso Correios
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-20 border-t border-slate-200 bg-white py-10 text-xs text-slate-500 text-center">
        <p>© {new Date().getFullYear()} SonoNuvem Brasil. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
`,
};

// 4. Cria ou atualiza os arquivos
for (const [caminho, conteudo] of Object.entries(ARQUIVOS)) {
  fs.writeFileSync(caminho, conteudo, "utf-8");
  console.log(`✅ Criado: ${path.relative(cwd, caminho)}`);
}

// 5. Atualiza .env.example
const envExamplePath = path.join(cwd, ".env.example");
const envVars = `
# ==============================================================================
# Porteiro (Cloaker & Proteção Anti-Bot / Anti-Clonagem)
# ==============================================================================
PORTEIRO_MODO=ativo
PORTEIRO_PAISES=BR
PORTEIRO_CHAVE=segredo_porteiro_2026
NEXT_PUBLIC_ALLOWED_DOMAINS=
`;

if (fs.existsSync(envExamplePath)) {
  const conteudoAtual = fs.readFileSync(envExamplePath, "utf-8");
  if (!conteudoAtual.includes("PORTEIRO_MODO")) {
    fs.appendFileSync(envExamplePath, envVars, "utf-8");
    console.log("✅ Variáveis adicionadas ao .env.example");
  }
} else {
  fs.writeFileSync(envExamplePath, envVars.trim(), "utf-8");
  console.log("✅ Arquivo .env.example criado com variáveis do Porteiro");
}

console.log("\n=================================================");
console.log("🎉 PORTEIRO INSTALADO COM SUCESSO!");
console.log("=================================================");
console.log("Próximos passos:");
console.log("1. No layout.tsx, importe: import { AntiClone } from './components/AntiClone';");
console.log("2. Adicione <AntiClone /> dentro da tag <body>");
console.log("3. Execute: npm run build para validar a compilação");
console.log("=================================================\n");
