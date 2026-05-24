# OiChat Monorepo

Este é um projeto em monorepo gerenciado via [pnpm](https://pnpm.io/) e [Turborepo](https://turbo.build/repo). Ele contém uma aplicação Web (Next.js) e um aplicativo Mobile (React Native / Expo).

## Estrutura do Projeto

- `apps/web`: Aplicação Web (Next.js) - pacote `@oichat/web`
- `apps/mobile`: Aplicativo Mobile (Expo) - pacote `@oichat/mobile`

## Como Rodar o Projeto

Como o projeto é um monorepo, você pode iniciar todas as aplicações ao mesmo tempo ou focar em uma de cada vez utilizando a flag `--filter` do `pnpm` a partir da pasta raiz.

### Rodar Tudo

Para iniciar o ambiente de desenvolvimento de todas as aplicações simultaneamente:

```bash
pnpm dev
```

### Rodar Especificamente a Web

Para iniciar **apenas** o servidor de desenvolvimento da aplicação Web (Next.js):

```bash
pnpm --filter @oichat/web dev
```

A aplicação Web normalmente ficará disponível em [http://localhost:3000](http://localhost:3000).

### Rodar Especificamente o Mobile (Expo)

Para iniciar **apenas** o servidor do aplicativo Mobile através do Expo:

```bash
pnpm --filter @oichat/mobile start
```

Se preferir já abrir diretamente em um emulador, utilize:
- **Android:** `pnpm --filter @oichat/mobile android`
- **iOS:** `pnpm --filter @oichat/mobile ios`

---
*Observação para usuários de Windows: Ao executar comandos de automação ou se houver problemas de execução em terminais legados do Windows (CMD padrão), você pode precisar prefixar o comando com `cmd /c`.*
