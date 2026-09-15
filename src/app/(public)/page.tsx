import { redirect } from "next/navigation";
import { modeloDestaque } from "@/lib/modelos/catalogo";

export default function Home() {
  redirect(`/modelos/${modeloDestaque().slug}`);
}
