# Fotos das motos

Solte aqui a imagem oficial de cada modelo, nomeada com o **slug** do modelo:

```
public/motos/cg-160-fan.jpg
public/motos/cg-160-titan.jpg
public/motos/biz-125.jpg
public/motos/pop-110i.jpg
public/motos/nxr-160-bros.jpg
public/motos/xre-300-sahara.jpg
public/motos/cb-300f-twister.jpg
public/motos/elite-125.jpg
```

A página passa a exibir a foto assim que o arquivo existir — não é preciso mexer
em código. Enquanto o arquivo não estiver aqui, o espaço aparece reservado com o
nome do modelo.

**Se usar outra extensão** (`.png`, `.webp`), ajuste o campo `foto` do modelo
correspondente em `src/lib/modelos/dados.ts`.

## Recomendações

- Fundo transparente ou claro: a imagem é exibida sobre `#eae9e9`, em
  `object-fit: contain`, e recebe o tratamento em preto e branco do design
  (`grayscale(1) contrast(1.08)`) — cor na origem é descartada.
- Proporção horizontal (algo perto de 4:3), largura mínima de 1200px para não
  perder nitidez no bloco de 340px de altura do desktop.
- Arquivos otimizados: o `next/image` redimensiona, mas não conserta um
  original de 8 MB.
