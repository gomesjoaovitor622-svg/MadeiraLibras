# MadeiraLibras v4

Laboratório acadêmico open source de **Português Brasileiro → Libras**, com análise contextual, regionalismos de Porto Velho/RO, avatar 3D e visão computacional de mãos.

> **Autores:** João Vitor, Roberval e Fernando  
> **Disciplina:** Software Livre • 2026

## O que mudou na v4

A v4 substitui o avatar 2D como interface principal por um **avatar procedural 3D em Three.js**, com braços hierárquicos, punhos, palmas, cinco dedos por mão e segmentos articuláveis. A aplicação também ganhou **MediaPipe Hand Landmarker** para rastrear as mãos pela câmera e reconhecer configurações geométricas básicas.

O projeto agora consulta diretamente o índice público do ecossistema VLibras:

`https://repository-dth.vlibras.gov.br/api/signs`

Esse índice é usado para medir cobertura de glosas e pesquisar sinais já cadastrados. O MadeiraLibras não copia automaticamente mídias/animações de terceiros sem licença explícita.

## Recursos atuais

- tradução de frases completas PT-BR → glosas aproximadas;
- desambiguação contextual (`banco`, `manga`);
- regionalismos experimentais de Porto Velho/Norte;
- expressões compostas e fallback por datilologia textual;
- confiança heurística e cobertura léxica;
- consulta ao índice público de sinais VLibras;
- pesquisa de glosas no catálogo local e no índice oficial;
- avatar 3D com Three.js;
- dois braços independentes;
- palma e cinco dedos por mão;
- configurações de mão (`open`, `flat`, `fist`, `index`, `pinch`);
- expressão facial para pergunta, negação, surpresa, intensidade e afeto positivo;
- execução sequencial de glosas;
- rastreamento de até duas mãos pela câmera;
- 21 landmarks por mão via MediaPipe;
- classificação heurística de mão aberta, punho, indicador, pinça, dois dedos e polegar;
- ditado por voz;
- histórico local;
- testes automatizados do motor textual e catálogo.

## Executar

```bash
git clone https://github.com/gomesjoaovitor622-svg/MadeiraLibras.git
cd MadeiraLibras
npm install
npm run dev
```

Abra o endereço mostrado pelo Vite, normalmente:

`http://localhost:5173/`

A câmera funciona em **localhost** ou em uma origem **HTTPS** e requer autorização explícita do navegador.

## Testes

```bash
npm test
```

## Build

```bash
npm run build
```

## Arquitetura

```text
Texto PT-BR
   ↓
Normalização + contexto + regionalidade
   ↓
Glosas aproximadas
   ├── cobertura no índice público VLibras
   └── perfis de movimento locais
              ↓
        Avatar 3D Three.js

Câmera
   ↓
MediaPipe Hand Landmarker
   ↓
21 pontos por mão
   ↓
Classificador de configuração básica
```

Consulte também [`docs/ARQUITETURA-V4.md`](docs/ARQUITETURA-V4.md) e [`docs/CATALOGO-E-VALIDACAO.md`](docs/CATALOGO-E-VALIDACAO.md).

## Rigor científico

O MadeiraLibras **não deve ser apresentado como um tradutor completo ou certificado de Libras**. Há três níveis distintos no projeto:

1. **glosa textual** — saída intermediária do motor;
2. **perfil computacional de movimento** — animação experimental do nosso avatar;
3. **sinal linguisticamente validado** — precisa de fonte, licença e validação por especialistas/pessoas surdas.

Da mesma forma, a câmera da v4 reconhece **formas básicas da mão**, não Libras completa. Reconhecer um sinal exige considerar movimento temporal, orientação, localização, duas mãos, tronco, face e contexto linguístico.

## Bases e tecnologias abertas

- **VLibras Dictionary Repository/API** — infraestrutura open source licenciada em LGPLv3; o projeto usa o endpoint público de lista de sinais como índice de cobertura.
- **WikiLibras** — plataforma colaborativa do ecossistema VLibras com mais de 21 mil sinais cadastrados e fluxo de animação/avaliação/revisão.
- **Libras SignBank** — recurso lexical público associado ao Corpus de Libras; a página pública informa licença CC BY-NC-SA 4.0 para dados do SignBank.
- **Three.js** — biblioteca 3D MIT.
- **MediaPipe Tasks Vision** — Apache-2.0; processamento de imagem realizado no dispositivo.

## Privacidade da câmera

A câmera somente é iniciada depois que o usuário clica em **Ativar câmera** e aceita a permissão do navegador. O MadeiraLibras não grava nem envia o vídeo. O stream é encerrado ao clicar em **Desligar**.

## Regionalidade

As gírias de Porto Velho são tratadas primeiro como fenômenos do **Português regional**. O projeto não inventa automaticamente equivalentes regionais em Libras. Variantes de Rondônia precisam ser documentadas e validadas com a comunidade surda local.

## Próximas metas

- adicionar assets 3D/GLB de sinais com licença e validação documentadas;
- mapear glosa → animação 3D validada;
- melhorar orientação de palma e contato corporal;
- reconhecer sequências temporais de landmarks, e não apenas poses estáticas;
- combinar mãos + pose corporal + face;
- criar corpus regional de Rondônia com participação da comunidade surda;
- medir precisão em conjunto de teste independente.

## Relação com VLibras

O MadeiraLibras é **independente e não afiliado ao VLibras**. O ecossistema VLibras é fonte de estudo arquitetural e de interoperabilidade para a atividade acadêmica. O código próprio deste projeto foi desenvolvido separadamente.

## Licença

MIT para o código próprio do MadeiraLibras. Dados, modelos e mídias externos mantêm suas licenças de origem.
