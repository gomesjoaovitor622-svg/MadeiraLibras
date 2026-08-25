# MadeiraLibras v4 — Arquitetura técnica

## Objetivo

A v4 transforma o protótipo em um laboratório modular com três subsistemas independentes: tradução PT-BR→glosas, renderização 3D e visão computacional. A separação evita afirmar que reconhecimento de forma de mão equivale a reconhecimento completo de Libras.

## Pipeline

```text
Texto PT-BR
  -> normalização / expressões compostas
  -> contexto / regionalidade
  -> glosas
  -> consulta de cobertura do índice público VLibras
  -> catálogo local de perfis de movimento
  -> avatar 3D Three.js

Câmera
  -> MediaPipe Hand Landmarker
  -> 21 landmarks por mão
  -> classificador heurístico de configuração de mão
  -> interface de diagnóstico
```

## Catálogo VLibras

O projeto consulta dinamicamente a lista pública em:

`https://repository-dth.vlibras.gov.br/api/signs`

O endpoint é utilizado como **índice de cobertura**. O MadeiraLibras não copia nem redistribui automaticamente arquivos de animação de terceiros. A API do repositório VLibras é open source sob LGPLv3; mídias/dados externos devem manter a licença e atribuição correspondentes.

## Avatar 3D

`src/avatar/threeAvatar.js` cria um personagem procedural em Three.js, sem depender de um modelo proprietário. O rig inclui:

- tronco, pescoço e cabeça;
- dois braços hierárquicos (ombro, cotovelo e punho);
- duas mãos independentes;
- palma e cinco dedos por mão;
- falanges representadas por segmentos articuláveis;
- expressões faciais básicas;
- execução sequencial dos keyframes do catálogo local.

Os perfis existentes continuam marcados como estudos computacionais. A arquitetura permite futura troca por GLB/GLTF validado sem alterar o tradutor.

## Visão computacional

`src/vision/gestureCamera.js` usa MediaPipe Tasks Vision / Hand Landmarker. O processamento das imagens ocorre no dispositivo. O classificador do MadeiraLibras reconhece apenas formas geométricas básicas, por exemplo:

- mão aberta;
- punho fechado;
- indicador;
- pinça;
- dois dedos;
- polegar.

Isso **não é reconhecimento de Libras**. Um reconhecedor de sinais exige sequência temporal, orientação, localização, movimento, duas mãos, expressões não manuais e um corpus anotado.

## Próxima etapa científica

1. criar dataset autorizado e versionado de sinais;
2. mapear glosa -> asset 3D validado;
3. adicionar trajetória 3D, contato e orientação completa;
4. treinar classificador temporal com landmarks de mãos, pose e face;
5. validar regionalismos e sinais com pessoas surdas de Rondônia;
6. medir acurácia com conjunto de teste separado.

## Privacidade

A câmera só é iniciada após ação explícita do usuário. O navegador solicita permissão. O stream é interrompido ao clicar em **Desligar**. O projeto não implementa gravação ou upload de vídeo.
