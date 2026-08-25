# MadeiraLibras

Laboratório acadêmico open source de **tradução contextual de Português Brasileiro para representação em glosas Libras**, com foco experimental em regionalismos de Porto Velho/RO, contexto e animação visual articulada.

> **Autores:** João Vitor, Roberval e Fernando  
> **Disciplina:** Software Livre • 2026

## Estado atual — v3

A v3 deixa de tratar o avatar como simples elemento visual. O projeto agora possui um **catálogo de sinais versionado** e um **motor 2D articulado** capaz de representar quatro parâmetros computacionais fundamentais:

- configuração de mão;
- orientação da palma;
- localização no espaço de sinalização;
- movimento ao longo de keyframes.

O motor de tradução envia a sequência de glosas ao `SignPlayer`, que procura cada unidade no catálogo e executa o perfil correspondente. Quando não existe perfil, o sistema usa fallback visual e mantém a informação de que aquela unidade não está coberta pelo catálogo.

## O que já funciona

- tradução de frases completas;
- desambiguação contextual de termos como `banco` e `manga`;
- perfil lexical regional experimental de Porto Velho/Norte;
- expressões compostas;
- fallback por datilologia textual;
- cobertura léxica e confiança heurística;
- marcadores não manuais: pergunta, negação, intensidade, surpresa e afeto positivo;
- avatar vetorial articulado;
- mãos independentes;
- diferentes configurações visuais (`open`, `flat`, `fist`, `index`, `pinch`);
- localização e orientação por sinal;
- animação sequencial das glosas;
- catálogo navegável com botão de teste por sinal;
- ditado por voz via Web Speech API;
- histórico local;
- testes automatizados do tradutor e do catálogo.

## Executar

```bash
git clone https://github.com/gomesjoaovitor622-svg/MadeiraLibras.git
cd MadeiraLibras
npm install
npm run dev
```

## Testar

```bash
npm test
```

## Build

```bash
npm run build
```

## Arquitetura

```text
Entrada PT-BR
   ↓
Normalização + expressões compostas
   ↓
Perfil regional opcional
   ↓
Desambiguação contextual
   ↓
Léxico + reordenação + glosas
   ↓
Catálogo de sinais
   ├─ configuração de mão
   ├─ orientação
   ├─ localização
   ├─ movimento/keyframes
   ├─ fonte/licença
   └─ status de validação
   ↓
SignPlayer
   ↓
Avatar articulado + componente não manual
```

## Catálogo e rigor científico

O projeto diferencia explicitamente:

1. **glosa textual**;
2. **estudo computacional de movimento**;
3. **sinal linguisticamente validado**.

Os perfis entregues nesta versão estão marcados como `motion-study` e `validated: false`. Eles demonstram a arquitetura e o player, mas não são apresentados como corpus certificado de Libras.

A arquitetura já possui `mediaUrl`, `source`, `license` e `validated`, permitindo que sinais revisados sejam adicionados posteriormente sem alterar o motor de tradução.

Consulte: [`docs/CATALOGO-E-VALIDACAO.md`](docs/CATALOGO-E-VALIDACAO.md).

## Fontes abertas previstas para validação

- **Libras SignBank** — banco lexical ligado ao Corpus de Libras; a página pública informa licença CC BY-NC-SA 4.0 para seus dados.
- **WikiLibras / VLibras** — referência de dicionário, animações e fluxo colaborativo de avaliação/revisão de sinais.

## Regionalidade

As gírias de Porto Velho são tratadas primeiro como fenômenos do **Português regional**. O MadeiraLibras não inventa automaticamente um sinal regional de Libras. Qualquer variante atribuída a Rondônia deverá ser registrada com fonte e validada com a comunidade surda local.

## Limitações atuais

Apesar do avanço, o projeto ainda não é equivalente ao VLibras. O rig é bidimensional e simplifica anatomia e fonologia. Ainda faltam, entre outros pontos:

- articulação detalhada das falanges;
- orientação tridimensional completa;
- contatos corporais finos;
- classificadores;
- uso discursivo do espaço;
- movimentos detalhados de tronco/cabeça;
- corpus amplo de sinais validados;
- validação sistemática por especialistas e pessoas surdas.

Essas limitações estão documentadas de forma explícita para evitar apresentar uma demonstração visual como se fosse tradução completa de Libras.

## Relação com VLibras

O MadeiraLibras é **independente e não afiliado ao VLibras**. O ecossistema VLibras foi estudado como referência arquitetural para a atividade de Software Livre; o código deste projeto foi desenvolvido separadamente.

## Licença

MIT para o código próprio do MadeiraLibras. Dados ou mídias externas adicionados ao catálogo devem preservar suas licenças de origem.
