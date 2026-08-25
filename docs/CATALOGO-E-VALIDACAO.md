# Catálogo de sinais e política de validação

## Por que esta camada existe

O MadeiraLibras separa três conceitos que não devem ser confundidos:

1. **Glosa** — rótulo textual usado pelo motor de tradução.
2. **Perfil de movimento** — representação computacional com configuração de mão, orientação, localização e movimento.
3. **Sinal validado** — realização linguística confirmada a partir de fonte adequada e, idealmente, revisão por pessoa surda/especialista em Libras.

A versão 3 introduz um motor visual articulado, mas os perfis incluídos no repositório estão marcados como `motion-study`. Isso significa que servem para testar a arquitetura e o mecanismo de animação; não devem ser apresentados como um corpus certificado de Libras.

## Modelo de uma entrada

```js
{
  gloss: 'ESTUDAR',
  status: 'motion-study',
  validated: false,
  mediaUrl: null,
  source: 'signbank',
  hands: 2,
  dominant: 'both',
  handshape: 'open',
  palm: 'up',
  location: 'neutral-front',
  movement: 'repeated-tap',
  duration: 1050,
  frames: [...]
}
```

## Campos linguístico-computacionais

- `hands`: número de mãos participantes.
- `dominant`: mão dominante ou execução bimanual.
- `handshape`: configuração simplificada usada pelo rig.
- `palm`: orientação da palma.
- `location`: região do espaço de sinalização.
- `movement`: classe computacional do movimento.
- `frames`: keyframes usados pelo player.
- `validated`: informa se a entrada já passou por validação linguística.
- `mediaUrl`: permite substituir o estudo vetorial por vídeo/animação validada.
- `source`: origem documental do sinal.

## Fontes abertas previstas

### Libras SignBank

O SignBank de Libras é um banco lexical público ligado ao Corpus de Libras. Sua página informa disponibilização de dados sob licença **Creative Commons BY-NC-SA 4.0** e milhares de glosas públicas. O projeto deve respeitar atribuição, uso não comercial e compartilhamento pela mesma licença quando reutilizar dados derivados desse acervo.

- https://signbank.levantelab.com.br/pt

### WikiLibras / VLibras

A WikiLibras mantém um fluxo colaborativo de inclusão, animação, avaliação e revisão de sinais. A documentação do VLibras também descreve um dicionário de animações. Recursos específicos devem ser reutilizados somente após conferência da licença aplicável ao artefato.

- https://wiki.vlibras.gov.br/
- https://vlibras.gov.br/doc/widget/functionalities/dictionary.html

## Processo para promover um perfil a “validado”

1. localizar o sinal em fonte linguística confiável;
2. registrar a URL e a licença da fonte;
3. comparar configuração de mão, orientação, localização e movimento;
4. substituir ou ajustar os keyframes do catálogo;
5. registrar variante regional quando houver evidência;
6. revisar com pessoa surda ou especialista em Libras;
7. adicionar teste automatizado do perfil;
8. mudar `validated` para `true` apenas após a revisão.

## Regionalidade

O módulo regional de Porto Velho trata inicialmente **regionalismos do Português**, como “égua” e “de rocha”. Isso não autoriza inferir automaticamente uma variante regional de Libras. Para afirmar que um sinal é característico de Rondônia, o projeto deverá reunir evidência linguística e validação com a comunidade surda local.

## Limite atual

O rig 2D já consegue executar parâmetros diferenciados de mãos e movimentos, mas ainda não modela toda a fonologia da Libras, como contato detalhado, orientação tridimensional completa, articulações finas de cada falange, movimento de tronco, uso discursivo do espaço e classificadores. A arquitetura foi preparada para que esses componentes possam ser adicionados sem reescrever o tradutor textual.
