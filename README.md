# CheckIn App - SOA & Mobile

Aplicativo móvel desenvolvido como parte da disciplina de **Mobile Development and IoT – Sprint 3** para complementar a API de Check‑in da disciplina de SOA. O objetivo é oferecer uma interface intuitiva em React Native que permita ao usuário autenticar‑se, visualizar e gerenciar seus hábitos de saúde.

## Integrantes

Lucas Garcia - RM554070


Enzo Barbeli - RM554272


Enzzo Monteiro Barros Silva - RM552616


Felipe Santos - RM554249


Iago Diniz - 553776

## 📁 Estrutura do projeto

O código segue uma estrutura organizada por pastas para separar responsabilidades:

```
mobile-app/
├── App.tsx                # Componente raiz que injeta a navegação
├── app.json               # Configurações do Expo
├── package.json           # Dependências e scripts
├── tsconfig.json          # Configuração do TypeScript (modo strict)
├── README.md
└── src/
    ├── components/        # Componentes reutilizáveis (Loading, HabitoItem)
    ├── constants/         # Constantes e enums (API_BASE_URL, keys de storage)
    ├── navigation/        # Configuração do React Navigation
    ├── screens/           # Telas da aplicação (Login, Home, Habits)
    ├── services/          # Camada de acesso à API (login, habits CRUD)
    └── types/             # Tipos e interfaces TypeScript
```

Todos os arquivos `.tsx` são escritos em **TypeScript** com regras de tipagem estrita. As interfaces `Usuario`, `Habito` e `AuthResponse` ficam em `src/types`. As constantes como `API_BASE_URL` e as chaves de armazenamento local estão em `src/constants`.


## Pré-requisitos

1. Node.js LTS instalado
2. npm instalado
3. Android Studio + Android Emulator configurado
   OU
   aplicativo Expo Go no celular

## Instalação

```bash
npm install
```

## Executando o projeto

### Android Emulator

```bash
npx expo start --clear --localhost
```

Depois pressione:

```txt
a
```

para abrir no Android Emulator.

---

### Celular físico (Expo Go)

```bash
npx expo start --clear --tunnel
```

Depois escaneie o QR Code com o Expo Go.

---

## Tecnologias

- Expo SDK 50
- React Native 0.73.6
- TypeScript
- React Navigation 6
- AsyncStorage

Ao executar `npm start`, o Expo CLI abrirá um painel no navegador. Você pode escanear o QR Code com o app **Expo Go** (Android/iOS) ou pressionar `a`/`i` para abrir em um emulador Android/iOS configurado.

> **Nota:** A aplicação está configurada para consumir a API em `http://localhost:8080/api`. Se estiver rodando a API em outro host ou porta, ajuste `API_BASE_URL` em `src/constants/index.ts` conforme necessário (por exemplo, use o IP da sua máquina na mesma rede, `http://192.168.X.X:8080/api`).

## Modo demonstração sem API

O app tenta usar a API normalmente. Se a API não estiver disponível ou a autenticação pela API falhar, ele usa os dados mockados de `src/constants/index.ts`, permitindo demonstrar login e hábitos sem subir o backend.

Usuários disponíveis:

```txt
lucas@email.com / 123456
```

Os mocks incluem 1 usuário e 3 hábitos. Também é possível adicionar e excluir hábitos durante a sessão do app; essas alterações ficam apenas em memória.

## 📱 Telas e navegação

- **Login** – permite ao usuário informar e‑mail e senha para autenticar‑se. Valida campos vazios, exibe erro em caso de credenciais inválidas e mostra feedback de carregamento durante a requisição. Após sucesso, redireciona para a tela Home.
- **Home (Início)** – tela inicial pós‑login. Possui botões para acessar “Meus hábitos”, abrir a tela de sugestão de hábitos e sair da aplicação, limpando o token e retornando à tela de login. Os parâmetros de navegação levam o `userId` armazenado após o login.
- **Hábitos** – lista os hábitos cadastrados para o usuário utilizando `FlatList`. Possui um formulário para adicionar novos hábitos com validação simples (nome e meta são obrigatórios). Também permite excluir hábitos existentes. Feedbacks de erro e loading são apresentados via texto e `ActivityIndicator`.
- **Sugestão de hábitos** – exibe uma sugestão de atividade ou hábito de bem-estar. A tela tenta utilizar o endpoint de sugestões do backend quando configurado e, no modo demonstração, recorre à API pública Bored para manter a funcionalidade disponível sem subir a API Spring Boot.

As telas são conectadas com **React Navigation** utilizando `createStackNavigator`. O tipo `RootStackParamList` garante que os parâmetros de navegação sejam validados em tempo de compilação.

## 🧠 Gerenciamento de estado

O aplicativo utiliza **hooks do React** para controlar os estados de formulário, carregamento e lista de hábitos. Todos os hooks são devidamente tipados (`useState<string>`, `useState<Habito[]>`, etc.) para evitar uso de `any`. As chamadas à API são feitas dentro de `useEffect` ou em funções assíncronas dedicadas, respeitando boas práticas de separação de responsabilidades.

## 📦 Persistência local

O **AsyncStorage** é utilizado para armazenar o token JWT retornado no login. Isso permite que, em uma evolução futura, o app mantenha a sessão do usuário entre fechamentos. A função `logout()` remove esses dados de maneira centralizada. Outras informações (como o `userId`) poderiam ser persistidas de forma semelhante.

## 🛠 Tecnologias utilizadas

- **Expo** – plataforma que simplifica o desenvolvimento e build de apps React Native.
- **React Native** – biblioteca para construção de interfaces móveis nativas com JavaScript/TypeScript.
- **React Navigation** – gerenciamento de navegação e rotas.
- **AsyncStorage** – persistência simples de dados em chave/valor.
- **TypeScript** – tipagem estática para maior segurança e legibilidade.
- **Fetch API** – para comunicação HTTP com a API Spring Boot.

## 📸 Demonstração


- Uma tela de login com inputs para email e senha, botão de **Entrar** e feedback de erros.
- Uma tela inicial com saudação e botões de navegação para a lista de hábitos, sugestões e logout.
- Uma tela de lista de hábitos com formulário para adicionar novos hábitos, listagem de hábitos existentes e opção de excluir cada hábito.
- Uma tela de sugestão de hábitos com imagem ilustrativa, texto de sugestão, botão para buscar nova sugestão e opção de voltar para a tela anterior.


## ✅ Conclusão

Este aplicativo móvel cumpre os requisitos da **Sprint 3** de Mobile Development and IoT, apresentando uma estrutura clara, tipagem estática, múltiplas telas com navegação, gerenciamento de estado reativo, persistência local e documentação completa. Ele demonstra como um cliente móvel pode consumir e complementar a API de check‑in desenvolvida na disciplina de SOA.
