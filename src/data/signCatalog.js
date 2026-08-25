export const SOURCES = {
  signbank: {
    name: 'Libras SignBank',
    url: 'https://signbank.levantelab.com.br/pt',
    license: 'CC BY-NC-SA 4.0',
    note: 'Fonte linguística pública para consulta e futura validação de sinais.'
  },
  wikilibras: {
    name: 'WikiLibras / VLibras',
    url: 'https://wiki.vlibras.gov.br/',
    license: 'Consultar licença do recurso específico',
    note: 'Referência de dicionário/animações e fluxo de validação por especialistas.'
  }
};

const study = (gloss, cfg) => ({
  gloss,
  status: 'motion-study',
  validated: false,
  mediaUrl: null,
  source: 'signbank',
  ...cfg
});

// Estes perfis NÃO são declarados como sinais linguisticamente validados.
// Eles exercitam o motor: configuração de mão, orientação, localização e movimento.
// Quando houver mídia/animação validada, preencha mediaUrl e altere validated=true.
export const SIGN_CATALOG = {
  'EU': study('EU', {
    hands: 1,
    dominant: 'right',
    handshape: 'index',
    palm: 'in',
    location: 'chest-center',
    movement: 'tap-in',
    duration: 760,
    frames: [
      { t:0, r:{x:48,y:66,rot:-8,shape:'index'} },
      { t:.55, r:{x:50,y:54,rot:-8,shape:'index'} },
      { t:1, r:{x:48,y:66,rot:-8,shape:'index'} }
    ]
  }),
  'VOCÊ': study('VOCÊ', {
    hands: 1, dominant:'right', handshape:'index', palm:'side', location:'neutral-front', movement:'point-forward', duration:720,
    frames:[
      {t:0,r:{x:54,y:62,rot:-10,shape:'index'}},
      {t:1,r:{x:72,y:48,rot:-28,shape:'index'}}
    ]
  }),
  'HOJE': study('HOJE', {
    hands:2, dominant:'both', handshape:'open', palm:'down', location:'neutral-low', movement:'double-down', duration:820,
    frames:[
      {t:0,l:{x:38,y:60,rot:4,shape:'open'},r:{x:62,y:60,rot:-4,shape:'open'}},
      {t:.5,l:{x:38,y:70,rot:4,shape:'open'},r:{x:62,y:70,rot:-4,shape:'open'}},
      {t:1,l:{x:38,y:61,rot:4,shape:'open'},r:{x:62,y:61,rot:-4,shape:'open'}}
    ]
  }),
  'CASA': study('CASA', {
    hands:2, dominant:'both', handshape:'flat', palm:'in', location:'upper-front', movement:'roof', duration:900,
    frames:[
      {t:0,l:{x:42,y:42,rot:-42,shape:'flat'},r:{x:58,y:42,rot:42,shape:'flat'}},
      {t:1,l:{x:35,y:54,rot:0,shape:'flat'},r:{x:65,y:54,rot:0,shape:'flat'}}
    ]
  }),
  'ESTUDAR': study('ESTUDAR', {
    hands:2, dominant:'both', handshape:'open', palm:'up', location:'neutral-front', movement:'repeated-tap', duration:1050,
    frames:[
      {t:0,l:{x:39,y:66,rot:2,shape:'flat'},r:{x:62,y:52,rot:-4,shape:'open'}},
      {t:.35,l:{x:39,y:66,rot:2,shape:'flat'},r:{x:54,y:61,rot:-4,shape:'open'}},
      {t:.7,l:{x:39,y:66,rot:2,shape:'flat'},r:{x:62,y:52,rot:-4,shape:'open'}},
      {t:1,l:{x:39,y:66,rot:2,shape:'flat'},r:{x:54,y:61,rot:-4,shape:'open'}}
    ]
  }),
  'TRABALHAR': study('TRABALHAR', {
    hands:2, dominant:'both', handshape:'fist', palm:'down', location:'neutral-front', movement:'alternating', duration:980,
    frames:[
      {t:0,l:{x:39,y:58,rot:15,shape:'fist'},r:{x:61,y:68,rot:-15,shape:'fist'}},
      {t:.5,l:{x:39,y:68,rot:15,shape:'fist'},r:{x:61,y:58,rot:-15,shape:'fist'}},
      {t:1,l:{x:39,y:58,rot:15,shape:'fist'},r:{x:61,y:68,rot:-15,shape:'fist'}}
    ]
  }),
  'DINHEIRO': study('DINHEIRO', {
    hands:1, dominant:'right', handshape:'pinch', palm:'up', location:'neutral-front', movement:'rub', duration:900,
    frames:[
      {t:0,r:{x:58,y:60,rot:-4,shape:'pinch'}},
      {t:.5,r:{x:66,y:60,rot:8,shape:'pinch'}},
      {t:1,r:{x:58,y:60,rot:-4,shape:'pinch'}}
    ]
  }),
  'BANCO-FINANCEIRO': study('BANCO-FINANCEIRO', {
    hands:2, dominant:'both', handshape:'flat', palm:'down', location:'neutral-front', movement:'stack', duration:920,
    frames:[
      {t:0,l:{x:42,y:64,rot:0,shape:'flat'},r:{x:60,y:48,rot:0,shape:'flat'}},
      {t:1,l:{x:42,y:64,rot:0,shape:'flat'},r:{x:56,y:58,rot:0,shape:'flat'}}
    ]
  }),
  'BANCO-ASSENTO': study('BANCO-ASSENTO', {
    hands:2, dominant:'both', handshape:'flat', palm:'down', location:'neutral-low', movement:'seat-shape', duration:850,
    frames:[
      {t:0,l:{x:38,y:66,rot:0,shape:'flat'},r:{x:62,y:66,rot:0,shape:'flat'}},
      {t:1,l:{x:35,y:72,rot:-8,shape:'flat'},r:{x:65,y:72,rot:8,shape:'flat'}}
    ]
  }),
  'NÃO': study('NÃO', {
    hands:1, dominant:'right', handshape:'pinch', palm:'side', location:'face-front', movement:'side-flick', duration:760,
    frames:[
      {t:0,r:{x:57,y:40,rot:-8,shape:'pinch'}},
      {t:1,r:{x:70,y:43,rot:24,shape:'pinch'}}
    ]
  }),
  'BOM': study('BOM', {
    hands:1, dominant:'right', handshape:'open', palm:'in', location:'mouth-front', movement:'out-down', duration:840,
    frames:[
      {t:0,r:{x:56,y:36,rot:0,shape:'open'}},
      {t:1,r:{x:61,y:59,rot:0,shape:'open'}}
    ]
  }),
  'MUITO-BOM': study('MUITO-BOM', {
    hands:1, dominant:'right', handshape:'open', palm:'out', location:'upper-front', movement:'strong-out', duration:820,
    frames:[
      {t:0,r:{x:54,y:43,rot:-5,shape:'open'}},
      {t:1,r:{x:74,y:50,rot:-18,shape:'open'}}
    ]
  }),
  'SURPRESA': study('SURPRESA', {
    hands:2, dominant:'both', handshape:'open', palm:'out', location:'face-sides', movement:'open-out', duration:720,
    frames:[
      {t:0,l:{x:44,y:46,rot:-15,shape:'fist'},r:{x:56,y:46,rot:15,shape:'fist'}},
      {t:1,l:{x:30,y:43,rot:-25,shape:'open'},r:{x:70,y:43,rot:25,shape:'open'}}
    ]
  }),
  'IR': study('IR', {
    hands:1, dominant:'right', handshape:'index', palm:'side', location:'neutral-front', movement:'forward', duration:760,
    frames:[
      {t:0,r:{x:50,y:63,rot:-12,shape:'index'}},
      {t:1,r:{x:76,y:50,rot:-28,shape:'index'}}
    ]
  }),
  'PRAÇA': study('PRAÇA', {
    hands:2, dominant:'both', handshape:'open', palm:'down', location:'neutral-front', movement:'spread', duration:850,
    frames:[
      {t:0,l:{x:45,y:60,rot:0,shape:'open'},r:{x:55,y:60,rot:0,shape:'open'}},
      {t:1,l:{x:28,y:62,rot:-8,shape:'open'},r:{x:72,y:62,rot:8,shape:'open'}}
    ]
  }),
  'TECNOLOGIA': study('TECNOLOGIA', {
    hands:2, dominant:'both', handshape:'pinch', palm:'in', location:'neutral-front', movement:'orbit', duration:1000,
    frames:[
      {t:0,l:{x:40,y:58,rot:-10,shape:'pinch'},r:{x:60,y:58,rot:10,shape:'pinch'}},
      {t:.5,l:{x:46,y:48,rot:20,shape:'pinch'},r:{x:54,y:68,rot:-20,shape:'pinch'}},
      {t:1,l:{x:40,y:58,rot:-10,shape:'pinch'},r:{x:60,y:58,rot:10,shape:'pinch'}}
    ]
  }),
  'COMPUTADOR': study('COMPUTADOR', {
    hands:2, dominant:'both', handshape:'open', palm:'down', location:'neutral-low', movement:'typing', duration:980,
    frames:[
      {t:0,l:{x:40,y:67,rot:0,shape:'open'},r:{x:60,y:67,rot:0,shape:'open'}},
      {t:.5,l:{x:40,y:63,rot:0,shape:'open'},r:{x:60,y:71,rot:0,shape:'open'}},
      {t:1,l:{x:40,y:67,rot:0,shape:'open'},r:{x:60,y:67,rot:0,shape:'open'}}
    ]
  }),
  'LIBRAS': study('LIBRAS', {
    hands:2, dominant:'both', handshape:'open', palm:'out', location:'neutral-front', movement:'symmetric-out', duration:950,
    frames:[
      {t:0,l:{x:45,y:55,rot:-4,shape:'open'},r:{x:55,y:55,rot:4,shape:'open'}},
      {t:1,l:{x:30,y:48,rot:-18,shape:'open'},r:{x:70,y:48,rot:18,shape:'open'}}
    ]
  })
};

export function findSign(gloss) {
  const clean = String(gloss || '').replace(/-(PASSADO|FUTURO)$/,'');
  return SIGN_CATALOG[gloss] || SIGN_CATALOG[clean] || null;
}

export function catalogStats() {
  const entries = Object.values(SIGN_CATALOG);
  return {
    total: entries.length,
    validated: entries.filter(x => x.validated).length,
    motionStudies: entries.filter(x => x.status === 'motion-study').length
  };
}
