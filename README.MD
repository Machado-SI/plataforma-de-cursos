# API de Cursos e Inscrições

Este é um projeto de **backend** simples, construído com **Node.js** e **Express**.

---

## Funcionalidades

* **Registro e Login**: Gerencia usuários com autenticação segura.
* **Cursos**: Permite listar, criar e apagar cursos.
* **Inscrições**: Gerencia a inscrição de usuários em cursos.
* **Autorização**: As rotas de criação e exclusão são restritas para administradores.

## Tecnologias
* **Node.js**: Ambiente de execução JavaScript.
* **Express.js**: Framework web para Node.js.
* **PostgreSQL**: Banco de dados relacional.
* **bcryptjs**: Para criptografia de senhas.
* **jsonwebtoken**: Para autenticação baseada em JWT.
* **yup**: Para validação de dados.
* **dotenv**: Para gerenciar variáveis de ambiente.

---

## Como Executar

### 1. Clonar o Repositório

Para iniciar, abra o terminal e use o comando `git clone` seguido da URL do repositório que você deseja clonar.

```bash
git clone https://github.com/Machado-SI/plataforma-de-cursos

#### 2. Entrar no Diretório

```bash
cd plataforma-de-cursos

#### 3. Instalando Depedências

```bash
npm install

#### 4. Configurar Ambiente
JWT_SECRET=sua_chave_secreta
NODE_ENV=development

---

## Como Testar

Testes automatizados utilizando **Jest** e **Supertest**. O arquivo de teste está no repositório.

