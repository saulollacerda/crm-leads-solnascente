export type Modelo = {
  slug: string;
  nome: string;
  categoria: string;
  preco: number;
  parcela48x: number;
  motor: string;
  /** Caminho em `public/`. Trocar aqui se o arquivo tiver outra extensão. */
  foto: string;
};

/**
 * Preços e parcelas são fictícios, com exceção da CG 160 Fan (R$ 19.994,00),
 * que veio do formulário da concessionária. Confirmar antes de publicar.
 */
export const MODELOS: readonly Modelo[] = [
  {
    slug: "cg-160-fan",
    nome: "CG 160 Fan",
    categoria: "Street",
    preco: 19994,
    parcela48x: 446.9,
    motor: "162,7 cc",
    foto: "/motos/cg-160-fan.jpg",
  },
  {
    slug: "cg-160-titan",
    nome: "CG 160 Titan",
    categoria: "Street",
    preco: 22390,
    parcela48x: 498.2,
    motor: "162,7 cc",
    foto: "/motos/cg-160-titan.jpg",
  },
  {
    slug: "biz-125",
    nome: "Biz 125",
    categoria: "Scooter",
    preco: 17390,
    parcela48x: 389.4,
    motor: "124,9 cc",
    foto: "/motos/biz-125.jpg",
  },
  {
    slug: "pop-110i",
    nome: "Pop 110i",
    categoria: "Urbana",
    preco: 13590,
    parcela48x: 302.1,
    motor: "109,1 cc",
    foto: "/motos/pop-110i.jpg",
  },
  {
    slug: "nxr-160-bros",
    nome: "NXR 160 Bros",
    categoria: "Trail",
    preco: 24790,
    parcela48x: 552.7,
    motor: "162,7 cc",
    foto: "/motos/nxr-160-bros.jpg",
  },
  {
    slug: "xre-300-sahara",
    nome: "XRE 300 Sahara",
    categoria: "Adventure",
    preco: 31890,
    parcela48x: 708.3,
    motor: "291,6 cc",
    foto: "/motos/xre-300-sahara.jpg",
  },
  {
    slug: "cb-300f-twister",
    nome: "CB 300F Twister",
    categoria: "Naked",
    preco: 27390,
    parcela48x: 610.5,
    motor: "293,5 cc",
    foto: "/motos/cb-300f-twister.jpg",
  },
  {
    slug: "elite-125",
    nome: "Elite 125",
    categoria: "Scooter",
    preco: 16290,
    parcela48x: 364.8,
    motor: "125 cc",
    foto: "/motos/elite-125.jpg",
  },
];
