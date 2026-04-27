import { createBrowserRouter } from "react-router";
import { Home } from "./components/Home";
import { FornecedorCNPJ } from "./components/FornecedorCNPJ";
import { FornecedorLogin } from "./components/FornecedorLogin";
import { FornecedorCadastro } from "./components/FornecedorCadastro";
import { FornecedorDashboard } from "./components/FornecedorDashboard";
import { ProdutoCadastro } from "./components/ProdutoCadastro";
import { ProdutoEditar } from "./components/ProdutoEditar";
import { ProdutoDetalhes } from "./components/ProdutoDetalhes";
import { ColaboradorLogin } from "./components/ColaboradorLogin";
import { ColaboradorAuth } from "./components/ColaboradorAuth";
import { ColaboradorDashboardFiscal } from "./components/ColaboradorDashboardFiscal";
import { ColaboradorDashboardCompras } from "./components/ColaboradorDashboardCompras";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/fornecedor/cnpj",
    Component: FornecedorCNPJ,
  },
  {
    path: "/fornecedor/login",
    Component: FornecedorLogin,
  },
  {
    path: "/fornecedor/cadastro",
    Component: FornecedorCadastro,
  },
  {
    path: "/fornecedor/dashboard",
    Component: FornecedorDashboard,
  },
  {
    path: "/fornecedor/produto/novo",
    Component: ProdutoCadastro,
  },
  {
    path: "/fornecedor/produto/editar/:id",
    Component: ProdutoEditar,
  },
  {
    path: "/fornecedor/produto/detalhes/:id",
    Component: ProdutoDetalhes,
  },
  {
    path: "/colaborador/login",
    Component: ColaboradorLogin,
  },
  {
    path: "/colaborador/login/auth",
    Component: ColaboradorAuth,
  },
  {
    path: "/colaborador/fiscal/dashboard",
    Component: ColaboradorDashboardFiscal,
  },
  {
    path: "/colaborador/compras/dashboard",
    Component: ColaboradorDashboardCompras,
  },
]);
