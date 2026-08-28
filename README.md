# MadeiraLibras v5

Laboratório acadêmico open source de **Português Brasileiro → Libras**, com análise contextual, regionalismos de Porto Velho/RO, avatar 3D, base persistente de sinais e visão computacional temporal.

> **Autores:** João Vitor, Roberval e Fernando  
> **Disciplina:** Software Livre • 2026

## O que a v5 adiciona

A v5 transforma a aplicação em uma plataforma mais próxima de um laboratório profissional demonstrável. Além do avatar 3D e do MediaPipe já existentes, agora há um **banco de dados IndexedDB** no navegador para armazenar:

- índice público de sinais do VLibras;
- templates temporais gravados pela câmera;
- histórico persistente de traduções;
- metadados da última sincronização.

O índice público usado é:

`https://repository-dth.vlibras.gov.br/api/signs`

Quando a sincronização funciona, a lista é persistida localmente. Se a API estiver temporariamente indisponível, o MadeiraLibras pode reutilizar o cache local já sincronizado.

## Reconhecimento temporal pela câmera

O MediaPipe Hand Landmarker fornece 21 landmarks por mão. A v5 converte esses landmarks em vetores normalizados e mantém uma janela temporal de movimento.

O usuário pode:

1. ativar a câmera;
2. informar a glosa/nome de um exemplo;
3. gravar um gesto/sinal durante aproximadamente 1–2 segundos;
4. salvar somente os vetores normalizados no banco;
5. repetir o movimento diante da câmera;
6. obter uma predição por similaridade temporal com os exemplos gravados.

Essa abordagem é um **classificador experimental por templates**, adequado para demonstrar o conceito de reconhecimento de sequência. Não deve ser confundido com um modelo de reconhecimento completo de Libras treinado em corpus amplo.

## Recursos atuais

- tradução contextual PT-BR → glosas aproximadas;
- desambiguação de termos como `banco` e `manga`;
- perfil lexical experimental de Porto Velho/Norte;
- fallback por datilologia textual;
- confiança heurística e cobertura léxica;
- sincronização do índice público de sinais VLibras;
- cache persistente do índice em IndexedDB;
- pesquisa local em uma base grande após sincronização;
- avatar procedural 3D em Three.js;
- braços, punhos, palmas e cinco dedos por mão;
- configurações de mão (`open`, `flat`, `fist`, `index`, `pinch`);
- componentes faciais para pergunta, negação, surpresa, intensidade e afeto positivo;
- MediaPipe Hand Landmarker com até duas mãos;
- classificador de poses básicas;
- reconhecimento temporal por templates;
- gravação de novos exemplos sem salvar vídeo;
- banco persistente de templates;
- ditado por voz;
- testes automatizados e CI.

## Executar

```bash
git clone https://github.com/gomesjoaovitor622-svg/MadeiraLibras.git
cd MadeiraLibras
npm install
npm run dev
```

Abra o endereço exibido pelo Vite, normalmente:

`http://localhost:5173/`

A câmera requer autorização explícita e funciona em `localhost` ou HTTPS.

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
Texto PT-BR
   ↓
Contexto + regionalidade
   ↓
Glosas
   ├───────────────→ Índice VLibras
   │                    ↓
   │              IndexedDB local
   │
   └───────────────→ Catálogo de movimento
                        ↓
                  Avatar 3D Three.js

Câmera
   ↓
MediaPipe (21 landmarks/mão)
   ↓
Normalização espacial
   ↓
Janela temporal
   ↓
Templates persistidos no IndexedDB
   ↓
Comparação de sequência
   ↓
Predição experimental
```

## Banco de dados local

O arquivo `src/db/madeiraDB.js` cria quatro stores:

- `officialSigns`;
- `gestureTemplates`;
- `translations`;
- `meta`.

Nenhum servidor de banco é necessário para a demonstração. O banco roda no navegador e permanece disponível após recarregar a página no mesmo perfil do navegador.

## Rigor científico

O MadeiraLibras **não é apresentado como tradutor certificado de Libras**. O projeto diferencia:

1. **glosa textual**;
2. **perfil computacional de movimento**;
3. **índice de sinais existentes**;
4. **sinal linguisticamente validado**.

Existir no índice do VLibras não significa que o MadeiraLibras possua ou possa redistribuir automaticamente a animação correspondente. Mídias externas só devem ser incorporadas após confirmar licença e origem.

O reconhecimento temporal também é experimental: um sistema profissional de reconhecimento de Libras deve considerar não apenas as mãos, mas também trajetória, orientação, localização corporal, duas mãos, face, tronco e contexto linguístico, com avaliação em corpus independente.

## Bases e tecnologias abertas

- **VLibras Dictionary Repository/API** — infraestrutura open source sob LGPLv3; usada como índice público de sinais e referência arquitetural.
- **VLibras Dictionary API** — serviço open source que sincroniza conteúdo do repositório de sinais.
- **Libras SignBank** — fonte lexical pública para consulta e pesquisa linguística; dados públicos possuem condições de licença próprias que devem ser respeitadas.
- **Three.js** — MIT.
- **MediaPipe Tasks Vision** — Apache-2.0.
- **IndexedDB** — API nativa do navegador para persistência local.

## Privacidade

A câmera só é iniciada após clique e permissão do usuário. O projeto não salva vídeo. Os templates de treinamento armazenam vetores numéricos normalizados dos landmarks da mão.

## Relação com a atividade acadêmica

O projeto complementa a prospecção dos repositórios open source estudados. O ecossistema VLibras é analisado como referência; o MadeiraLibras demonstra uma implementação própria com contexto regional, integração de dados, 3D e visão computacional.

## Próximas metas profissionais

- incorporar movimentos 3D linguisticamente validados com licença compatível;
- usar assets GLB com rig humano completo e blendshapes faciais;
- adicionar pose corporal e face ao reconhecimento;
- treinar modelo temporal com corpus rotulado amplo;
- avaliar acurácia, precisão, recall e matriz de confusão;
- criar corpus regional de Rondônia com participação da comunidade surda;
- adicionar backend opcional para sincronização multiusuário e curadoria.

## Licença

MIT para o código próprio do MadeiraLibras. Dados, modelos e mídias externos mantêm suas licenças de origem.
