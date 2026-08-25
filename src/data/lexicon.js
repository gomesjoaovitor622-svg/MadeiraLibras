export const LEXICON = {
  eu:'EU', voce:'VOCÊ', você:'VOCÊ', ele:'ELE', ela:'ELA', nos:'NÓS', nós:'NÓS', eles:'ELES', elas:'ELAS',
  hoje:'HOJE', ontem:'ONTEM', amanha:'AMANHÃ', amanhã:'AMANHÃ', agora:'AGORA', depois:'DEPOIS', antes:'ANTES',
  ir:'IR', vou:'IR-FUTURO', vai:'IR', vamos:'IR', fui:'IR-PASSADO', foram:'IR-PASSADO', chegar:'CHEGAR', cheguei:'CHEGAR-PASSADO',
  estudar:'ESTUDAR', estudo:'ESTUDAR', estuda:'ESTUDAR', estudando:'ESTUDAR', trabalhar:'TRABALHAR', trabalho:'TRABALHAR',
  gostar:'GOSTAR', gosto:'GOSTAR', amar:'AMAR', quero:'QUERER', querer:'QUERER', precisar:'PRECISAR', posso:'PODER', pode:'PODER',
  saber:'SABER', sei:'SABER', entender:'ENTENDER', entendo:'ENTENDER', falar:'FALAR', falo:'FALAR', dizer:'DIZER',
  sim:'SIM', nao:'NÃO', não:'NÃO', nunca:'NUNCA', jamais:'NUNCA', muito:'MUITO', pouco:'POUCO', mais:'MAIS', menos:'MENOS',
  feliz:'FELIZ', triste:'TRISTE', bravo:'RAIVA', raiva:'RAIVA', cansado:'CANSADO', cansada:'CANSADO', medo:'MEDO', surpresa:'SURPRESA',
  bom:'BOM', boa:'BOM', ótimo:'MUITO-BOM', otimo:'MUITO-BOM', ruim:'RUIM', legal:'BOM', bonito:'BONITO', bonita:'BONITO',
  casa:'CASA', escola:'ESCOLA', faculdade:'FACULDADE', professor:'PROFESSOR', professora:'PROFESSOR', aluno:'ALUNO', aluna:'ALUNO',
  computador:'COMPUTADOR', tecnologia:'TECNOLOGIA', internet:'INTERNET', servidor:'SERVIDOR', aplicacao:'APLICAÇÃO', aplicação:'APLICAÇÃO', web:'WEB',
  banco:'BANCO', dinheiro:'DINHEIRO', sacar:'SACAR-DINHEIRO', conta:'CONTA', pix:'PIX', cartao:'CARTÃO', cartão:'CARTÃO', agencia:'AGÊNCIA', agência:'AGÊNCIA',
  sentar:'SENTAR', sentei:'SENTAR-PASSADO', assento:'ASSENTO', cadeira:'CADEIRA', praça:'PRAÇA', parque:'PARQUE',
  manga:'MANGA', camisa:'CAMISA', roupa:'ROUPA', fruta:'FRUTA', suco:'SUCO', comer:'COMER', comida:'COMIDA',
  mercado:'MERCADO', hospital:'HOSPITAL', farmacia:'FARMÁCIA', farmácia:'FARMÁCIA', medico:'MÉDICO', médico:'MÉDICO',
  amigo:'AMIGO', amiga:'AMIGO', familia:'FAMÍLIA', família:'FAMÍLIA', mae:'MÃE', mãe:'MÃE', pai:'PAI', filho:'FILHO', filha:'FILHO',
  porto:'PORTO', velho:'VELHO', rondônia:'RONDÔNIA', rondonia:'RONDÔNIA', rio:'RIO', madeira:'MADEIRA', norte:'NORTE',
  calor:'CALOR', chuva:'CHUVA', sol:'SOL', frio:'FRIO', peixe:'PEIXE', farinha:'FARINHA', café:'CAFÉ', cafe:'CAFÉ',
  onde:'ONDE', quando:'QUANDO', quem:'QUEM', como:'COMO', porque:'POR-QUÊ', porquê:'POR-QUÊ', qual:'QUAL', quanto:'QUANTO',
  aqui:'AQUI', ali:'ALI', la:'LÁ', lá:'LÁ', dentro:'DENTRO', fora:'FORA', perto:'PERTO', longe:'LONGE',
  festa:'FESTA', musica:'MÚSICA', música:'MÚSICA', dançar:'DANÇAR', passear:'PASSEAR', shopping:'SHOPPING'
};

export const PHRASES = {
  'bom dia':'BOM-DIA', 'boa tarde':'BOA-TARDE', 'boa noite':'BOA-NOITE',
  'muito obrigado':'OBRIGADO MUITO', 'muito obrigada':'OBRIGADO MUITO',
  'por favor':'POR-FAVOR', 'tudo bem':'TUDO-BEM', 'não sei':'EU SABER NÃO',
  'nao sei':'EU SABER NÃO', 'não tenho':'EU TER NÃO', 'nao tenho':'EU TER NÃO',
  'porto velho':'PORTO-VELHO', 'rio madeira':'RIO-MADEIRA', 'língua brasileira de sinais':'LIBRAS'
};

export const REGIONAL = {
  'égua': { gloss:'SURPRESA', meaning:'interjeição de espanto, admiração ou ênfase', emotion:'surprise' },
  'de rocha': { gloss:'MUITO-BOM', meaning:'algo muito bom, confiável ou uma confirmação, conforme o contexto', emotion:'positive' },
  'bora': { gloss:'VAMOS', meaning:'convite para ir ou iniciar algo', emotion:'positive' },
  'borimbora': { gloss:'IR-EMBORA', meaning:'vamos embora', emotion:'positive' },
  "pai d'égua": { gloss:'MUITO-BOM', meaning:'algo muito bom ou bacana', emotion:'positive' },
  'de bubuia': { gloss:'DESCANSAR', meaning:'boiando, descansando ou sem fazer esforço', emotion:'neutral' },
  'de butuca': { gloss:'ATENTO', meaning:'muito atento ou observando com cuidado', emotion:'intense' },
  'com borra': { gloss:'INTENSIDADE', meaning:'muito, em grande intensidade', emotion:'intense' },
  'liso': { gloss:'DINHEIRO-NÃO-TER', meaning:'sem dinheiro', emotion:'negative' }
};

export const STOPWORDS = new Set(['o','a','os','as','um','uma','uns','umas','do','da','dos','das','no','na','nos','nas','ao','aos','de','e','em','para','pra','pro','com','que','se']);
