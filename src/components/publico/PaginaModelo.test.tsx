import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { buscarModelo, listarModelos } from "@/lib/modelos/catalogo";
import { PaginaModelo } from "./PaginaModelo";

function montar(slug = "cg-160-fan") {
  return render(
    <PaginaModelo modelo={buscarModelo(slug)!} modelos={listarModelos()} />,
  );
}

describe("troca de modelo pelo formulário", () => {
  it("atualiza o nome e a categoria da vitrine", async () => {
    const user = userEvent.setup();
    montar();

    expect(screen.getByRole("heading", { name: "CG 160 Fan" })).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Modelo de interesse"), "Biz 125");

    expect(screen.getByRole("heading", { name: "Biz 125" })).toBeInTheDocument();
    expect(screen.getByText(/Honda ·/)).toHaveTextContent("Scooter");
  });

  it("atualiza preço, parcela e motor", async () => {
    const user = userEvent.setup();
    montar();

    await user.selectOptions(
      screen.getByLabelText("Modelo de interesse"),
      "XRE 300 Sahara",
    );

    expect(screen.getByText("R$ 31.890,00")).toBeInTheDocument();
    expect(screen.getByText("R$ 708,30")).toBeInTheDocument();
    expect(screen.getByText("291,6 cc")).toBeInTheDocument();
  });

  it("troca a foto exibida", async () => {
    const user = userEvent.setup();
    montar();

    expect(screen.getByAltText("Honda CG 160 Fan")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Modelo de interesse"), "Biz 125");

    expect(screen.getByAltText("Honda Biz 125")).toBeInTheDocument();
    expect(screen.queryByAltText("Honda CG 160 Fan")).not.toBeInTheDocument();
  });

  it("preserva o que a pessoa já tinha preenchido", async () => {
    const user = userEvent.setup();
    montar();

    await user.type(screen.getByLabelText("Nome"), "Ricardo Menezes");
    await user.selectOptions(screen.getByLabelText("Modelo de interesse"), "Biz 125");

    expect(screen.getByLabelText("Nome")).toHaveValue("Ricardo Menezes");
  });

  it("tira da lista 'Outros modelos' o modelo que passou a estar em destaque", async () => {
    const user = userEvent.setup();
    montar();

    const outros = screen.getByRole("region", { name: "Outros modelos" });
    expect(within(outros).getByRole("link", { name: /Biz 125/ })).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Modelo de interesse"), "Biz 125");

    expect(within(outros).queryByRole("link", { name: /Biz 125/ })).not.toBeInTheDocument();
    expect(within(outros).getByRole("link", { name: /CG 160 Fan/ })).toBeInTheDocument();
  });
});
