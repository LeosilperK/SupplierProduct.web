import { createBrowserRouter } from "react-router";
import { Home } from "./components/Home";
import { FornecedorCNPJ } from "./components/FornecedorCNPJ";
import { FornecedorLogin } from "./components/FornecedorLogin";
import { FornecedorCadastro } from "./components/FornecedorCadastro";
import { FornecedorDashboard } from "./components/FornecedorDashboard";
import { ColaboradorLogin } from "./components/ColaboradorLogin";

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
    path: "/colaborador/login",
    Component: ColaboradorLogin,
  },
]);
