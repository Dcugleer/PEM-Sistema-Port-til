# PEM-Sistema-Portátil Dashboard

Dashboard moderno, portátil e escalável para gestão de dados e operações empresariais. Desenvolvido com **Next.js**, **TypeScript** e **Tailwind CSS**, oferece uma experiência intuitiva, responsiva e fácil de personalizar.

---

## 🚀 Tecnologias

- **Next.js** – Framework React para aplicações web rápidas e escaláveis
- **TypeScript** – Tipagem estática para maior segurança e produtividade
- **Tailwind CSS** – Estilização utilitária e flexível
- **React Icons** – Ícones modernos para interfaces
- **Axios** – Requisições HTTP simplificadas
- **Prisma** – ORM para integração com bancos de dados
- **PostgreSQL** – Banco de dados relacional robusto

## 📦 Estrutura do Projeto

```
├── public/
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── contexts/
│   ├── hooks/
│   ├── styles/ (se aplicável)
│   └── types/ (se aplicável)
├── prisma/
├── .env
├── package.json
└── README.md
```

## ⚡️ Funcionalidades Principais

- Autenticação de usuários
- Dashboard dinâmico com gráficos e tabelas
- Cadastro e gerenciamento de dados
- Integração com PostgreSQL via Prisma
- Interface responsiva e adaptável a dispositivos móveis

## 🛠️ Como Executar Localmente

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/Dcugleer/PEM-Sistema-Portatil.git
   ```
2. **Instale as dependências:**
   ```bash
   npm install
   ```
3. **Configure o banco de dados:**
   - Crie o arquivo `.env` com as variáveis de conexão do PostgreSQL
   - Execute as migrations do Prisma:
     ```bash
     npx prisma migrate dev
     ```
4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
5. **Acesse o dashboard:**
   - Abra [http://localhost:3000](http://localhost:3000) no navegador

## 📚 Documentação Oficial

- [Next.js](https://nextjs.org/docs)
- [Prisma](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 📝 Contribuição

Contribuições são bem-vindas! Para colaborar, abra uma issue ou envie um pull request.

## 🛡️ Licença

Este projeto está sob a licença MIT.

---

## 📧 Contato do Autor

**Nome:** Denis Cugler  
**E-mail:** deniscugler@gmail.com  
**GitHub:** https://github.com/Dcugleer  
**LinkedIn:** https://www.linkedin.com/in/denis-cugler/  
**Website / Portfólio:** https://denis-cugler.vercel.app/