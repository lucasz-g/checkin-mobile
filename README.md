# CheckIn Mobile - Sprint 4

Aplicativo mobile em **Expo + React Native + TypeScript** para acompanhamento de hábitos de saúde. Nesta Sprint 4 o app ganhou comunicação em tempo real com **Socket.IO**, monitoramento IoT por **HTTP/simulador**, uso de API nativa de **geolocalização** e armazenamento seguro do token com **Expo SecureStore**.

## Integrantes

- Lucas Garcia - RM554070
- Enzo Barbeli - RM554272
- Enzzo Monteiro Barros Silva - RM552616
- Felipe Santos - RM554249
- Iago Diniz - RM553776

## Entregas da Sprint 4

| Critério | Implementação no projeto |
| --- | --- |
| Comunicação em tempo real | `socket.io-client` no app e servidor local em `scripts/sprint4-realtime-server.js`. |
| Eventos emitidos/recebidos | Cliente emite `client:hello`, `habit:created`, `habit:deleted` e `location:shared`; recebe `notification:new`, `habit:sync` e `iot:reading`. |
| UI atualizada automaticamente | `HabitsScreen` aplica `habit:sync`; `MonitoringScreen` atualiza leitura IoT e lista de eventos sem refresh manual. |
| API nativa do dispositivo | `expo-location` solicita localização em tempo de uso e trata permissão recusada. |
| Integração IoT | Simulador HTTP expõe `GET /iot/latest` e publica leituras por Socket.IO a cada 7 segundos. |
| Segurança | Token JWT/mock token migrado para `expo-secure-store`; `userId` permanece no AsyncStorage por não ser segredo. |
| Documentação | README atualizado com configuração, permissões, protocolos, payloads e roteiro de vídeo. |

## Estrutura do projeto

```txt
checkin-mobile/
├── App.tsx
├── app.json
├── package.json
├── scripts/
│   └── sprint4-realtime-server.js
└── src/
    ├── components/
    │   ├── HabitoItem.tsx
    │   └── Loading.tsx
    ├── constants/
    │   └── index.ts
    ├── navigation/
    │   └── AppNavigator.tsx
    ├── screens/
    │   ├── HabitsScreen.tsx
    │   ├── HomeScreen.tsx
    │   ├── LoginScreen.tsx
    │   ├── MonitoringScreen.tsx
    │   └── SuggestionScreen.tsx
    ├── services/
    │   ├── api.ts
    │   ├── iot.ts
    │   └── realtime.ts
    └── types/
        └── index.ts
```

## Pré-requisitos

- Node.js LTS
- npm
- Android Studio + Android Emulator ou Expo Go em celular físico
- Backend Spring Boot opcional em `http://localhost:8080/api`

O app continua com fallback mockado para login, hábitos e sensor, então é possível demonstrar a Sprint 4 sem subir o backend Java.

## Instalação

```bash
npm install
```

## Execução

Terminal 1: iniciar servidor Socket.IO + IoT local.

```bash
npm run sprint4:server
```

Terminal 2: iniciar o Expo.

```bash
npx expo start --clear --localhost
```

No Android Emulator, pressione `a`. Em celular físico, use:

```bash
npx expo start --clear --tunnel
```

Depois escaneie o QR Code pelo Expo Go.

## Configuração de rede

As URLs ficam em `src/constants/index.ts`.

- Android Emulator: o app usa `10.0.2.2` automaticamente para acessar a máquina host.
- iOS Simulator: o app usa `localhost`.
- Celular físico: altere `LOCAL_DEV_HOST` para o IP da máquina na mesma rede, por exemplo `192.168.0.10`.

URLs usadas:

```txt
API_BASE_URL=http://<host>:8080/api
REALTIME_SERVER_URL=http://<host>:3001
IOT_SENSOR_URL=http://<host>:3001/iot/latest
```

## Login de demonstração

Se a API Spring Boot não estiver ativa, o app usa fallback local:

```txt
Email: lucas@email.com
Senha: 123456
```

## Comunicação em tempo real

A comunicação em tempo real usa **Socket.IO**:

- Cliente mobile: `src/services/realtime.ts`
- Servidor local: `scripts/sprint4-realtime-server.js`
- URL padrão: `http://<host>:3001`

Eventos emitidos pelo app:

| Evento | Quando acontece | Payload principal |
| --- | --- | --- |
| `client:hello` | Ao conectar no socket | `{ userId, timestamp }` |
| `habit:created` | Após criar hábito | `{ action: "created", userId, habit, timestamp }` |
| `habit:deleted` | Após excluir hábito | `{ action: "deleted", userId, habitId, timestamp }` |
| `location:shared` | Após capturar localização | `{ userId, location, timestamp }` |

Eventos recebidos pelo app:

| Evento | Efeito na interface |
| --- | --- |
| `notification:new` | Aparece em "Eventos recentes" na tela Monitoramento. |
| `habit:sync` | Atualiza automaticamente a lista de hábitos. |
| `iot:reading` | Atualiza automaticamente os dados do sensor IoT. |

## Integração IoT

O projeto inclui um simulador IoT por HTTP e Socket.IO.

Endpoints:

```txt
GET  /health
GET  /iot/latest
POST /iot/readings
```

Exemplo de payload IoT:

```json
{
  "deviceId": "simulador-checkin-01",
  "hydrationPercent": 76,
  "temperatureC": 25.4,
  "movementCount": 3820,
  "status": "ok",
  "timestamp": "2026-06-15T21:00:00.000Z",
  "source": "http-simulator"
}
```

O app busca `GET /iot/latest` ao abrir a tela Monitoramento e também recebe novas leituras via `iot:reading` a cada 7 segundos enquanto o servidor local estiver ativo.

## API nativa e permissões

A funcionalidade nativa escolhida foi **geolocalização** com `expo-location`.

Arquivos envolvidos:

- `src/screens/MonitoringScreen.tsx`: solicita permissão, captura coordenadas e trata recusa.
- `app.json`: declara permissões Android/iOS e plugin `expo-location`.

Permissões:

```txt
Android: ACCESS_COARSE_LOCATION, ACCESS_FINE_LOCATION
iOS: NSLocationWhenInUseUsageDescription
```

Se o usuário recusar a permissão, o app mostra uma mensagem clara e mantém as demais funcionalidades de monitoramento ativas.

## Segurança

- O token de autenticação é salvo com `expo-secure-store`.
- O `userId` fica no AsyncStorage porque é usado apenas como identificador de navegação.
- Não há tokens reais, credenciais privadas, chaves de API ou URLs privadas no código.
- As URLs locais são configuráveis em `src/constants/index.ts`.

## Telas

- **Login**: autenticação com backend ou fallback mockado.
- **Home**: acesso a hábitos, sugestão, monitoramento Sprint 4 e logout.
- **Hábitos**: criação/exclusão com emissão de eventos Socket.IO e sincronização por `habit:sync`.
- **Sugestão**: sugestão de bem-estar com fallback para API pública.
- **Monitoramento Sprint 4**: leitura IoT, status do socket, captura de localização e eventos recentes.

## Estados de UI/UX

Os fluxos novos tratam:

- loading ao buscar sensor ou capturar localização;
- erro ao falhar leitura IoT;
- vazio quando nenhum evento/leitura existe;
- sucesso ao receber leitura, conectar socket ou enviar localização;
- permissão recusada sem travar a navegação.

## Tecnologias

- Expo SDK 50
- React Native 0.73.6
- TypeScript
- React Navigation 6
- Socket.IO
- Express
- Expo Location
- Expo SecureStore
- AsyncStorage

## Validação local

Comandos usados para validar a implementação:

```bash
npx tsc --noEmit
npx expo install --check
npm run sprint4:server
```

Para testar o endpoint IoT:

```bash
curl http://localhost:3001/iot/latest
```

## Roteiro para o vídeo

O arquivo `app-demo.mp4` pode ser substituído por uma gravação atualizada com este fluxo:

1. Abrir `npm run sprint4:server`.
2. Fazer login com `lucas@email.com / 123456`.
3. Abrir "Monitoramento Sprint 4" e mostrar status do socket.
4. Mostrar a leitura IoT sendo atualizada automaticamente.
5. Tocar em "Enviar localização" e aceitar a permissão.
6. Repetir o envio recusando a permissão, se quiser demonstrar o tratamento.
7. Criar ou excluir um hábito e mostrar o evento `habit:sync`.

## Conclusão

O app agora cobre os critérios centrais da Sprint 4: tempo real, API nativa com permissão, integração IoT simulada, estados visuais tratados e armazenamento mais seguro para dados sensíveis.
