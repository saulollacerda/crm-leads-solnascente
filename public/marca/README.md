# Logo

Solte o arquivo aqui como `logo` — a extensão pode ser `.svg`, `.png`, `.webp`,
`.avif`, `.jpg` ou `.jpeg`:

```
public/marca/logo.png
```

Ele substitui a logo tipográfica no header do site e na barra do painel, sem
precisar mexer em código. Sem arquivo, continua valendo a versão em texto do
design ("SOL NASCENTE **MOTOS**").

## Versão para fundo escuro (opcional)

A barra do painel admin tem fundo quase preto (`#201e1d`). Se a logo principal
for escura, some ali. Nesse caso, coloque também:

```
public/marca/logo-clara.png
```

Ela é usada só na barra do admin. Se não existir, a `logo` é usada nos dois
lugares.

## Recomendações

- **SVG é o ideal** — nítido em qualquer tela e sem versão clara/escura separada
  se o desenho for de cor única.
- Se for PNG: fundo transparente e altura de pelo menos 80px (é exibida com
  28px no mobile e 32px no desktop, e telas retina pedem o dobro).
- Margem interna mínima no arquivo: o espaçamento ao redor já vem do layout.
- A largura é livre; a altura é que manda. Logos muito largas encolhem o espaço
  do menu no header — algo perto de 4:1 funciona bem.
