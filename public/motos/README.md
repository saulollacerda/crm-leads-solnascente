# Fotos das motos

Solte aqui a imagem de cada modelo, nomeada com o **slug** do modelo:

```
cg-160-fan      cg-160-titan     biz-125        pop-110i
nxr-160-bros    xre-300-sahara   cb-300f-twister  elite-125
```

A extensão pode ser `.png`, `.webp`, `.avif`, `.jpg` ou `.jpeg` — o app procura
o arquivo pelo slug e usa o que encontrar, sem precisar editar código. Enquanto
não houver arquivo, o espaço aparece reservado com o nome do modelo.

## Use PNG (ou WebP), não JPEG

A foto é exibida **sobre um painel claro** (`#eae9e9`), recortada da moto — é
assim que o design foi feito. O material oficial da Honda vem com fundo
transparente, que só PNG, WebP e AVIF preservam.

Salvar essa mesma imagem em **JPEG achata a transparência em preto**: como as
motos também são escuras, o resultado na tela é um bloco preto no lugar da moto.
Foi exatamente o que aconteceu na primeira leva de arquivos.

Se já houver um `.jpg` de um modelo, basta soltar o `.png` ao lado: o app dá
preferência aos formatos com transparência. O `.jpg` pode ser apagado depois.

## Recomendações

- Fundo transparente, moto recortada.
- Proporção horizontal (perto de 4:3), largura de 1200px ou mais — o bloco do
  desktop tem 340px de altura e a imagem é exibida em `object-fit: contain`.
- A imagem recebe o tratamento em preto e branco do design
  (`grayscale(1) contrast(1.08)`), então cor no arquivo original é descartada.
- Arquivos otimizados: o `next/image` redimensiona, mas não conserta um
  original de 8 MB.
