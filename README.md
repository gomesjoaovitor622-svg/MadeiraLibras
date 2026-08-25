# MadeiraLibras

Protótipo acadêmico open source de **tradução contextual de Português Brasileiro para representação em glosas Libras**, com foco experimental em regionalismos de Porto Velho/RO e componentes não manuais.

> **Autores:** João Vitor, Roberval e Fernando  
> **Disciplina:** Software Livre • 2026

## Visão crítica

A primeira prova de conceito era visualmente demonstrativa, mas tecnicamente insuficiente: léxico pequeno, pouca separação entre interface e lógica, ausência de testes e nenhuma métrica de cobertura. A v2 foi reconstruída para parecer e se comportar como um software real, sem afirmar algo linguisticamente incorreto.

## Recursos da v2

- frases completas, não apenas substituição palavra por palavra;
- regras explícitas de desambiguação (`banco`, `manga`);
- expressões compostas;
- perfil lexical regional experimental de Porto Velho/Norte;
- fallback por datilologia textual para palavras fora do léxico;
- cobertura léxica e confiança heurística;
- marcadores não manuais: interrogação, negação, intensidade, surpresa e afeto positivo;
- avatar animado com resposta ao resultado;
- ditado por voz via Web Speech API quando disponível;
- histórico local de traduções;
- testes automatizados do motor.

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
Léxico + fallback por datilologia
   ↓
Heurística de reordenação
   ↓
Glosas aproximadas + marcador não manual
   ↓
Interface + avatar experimental
```

## Limite científico

O MadeiraLibras **não deve ser apresentado como tradutor completo de Libras**. Libras possui gramática visuoespacial própria e envolve configuração de mão, localização, movimento, orientação, uso do espaço, classificadores e componentes não manuais. A v2 demonstra arquitetura e tratamento contextual, mas ainda não possui um corpus validado de sinais nem animação manual linguisticamente correta.

A camada regional também é deliberadamente conservadora: uma gíria do português de Porto Velho é primeiro normalizada para um significado. O projeto **não inventa automaticamente um sinal regional em Libras**. Esse passo precisa de pesquisa e validação com pessoas surdas e especialistas de Rondônia.

## Relação com VLibras

O projeto é **independente e não afiliado ao VLibras**. O ecossistema VLibras é usado como referência de estudo de arquitetura e integração, conforme a atividade acadêmica. O código desta aplicação foi desenvolvido separadamente.

## Licença

MIT.
