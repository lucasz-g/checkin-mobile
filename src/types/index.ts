/**
 * Tipos TypeScript compartilhados para entidades de domínio. Manter
 * esses tipos em um arquivo dedicado facilita a importação e a
 * alteração das interfaces sem criar dependências circulares.
 */

// Representação de um usuário retornado pelo backend. Apenas os
// campos essenciais estão definidos aqui; expanda conforme a API
// evoluir.
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: string;
}

// Representação de um hábito de saúde associado a um usuário. As
// propriedades correspondem à entidade Habito no backend. Se novos
// atributos forem adicionados no servidor, reflita-os aqui.
export interface Habito {
  id: number;
  nome: string;
  descricao: string;
  meta: string;
  dataCriacao: string;
  usuarioId: number;
}

// Dados retornados pelos endpoints de autenticação. O token é uma
// string JWT usada para autorizar requisições posteriores. Este tipo
// pode ser expandido caso o backend passe a retornar informações
// adicionais, como id do usuário ou perfil, na resposta de login.
export interface AuthResponse {
  token: string;
  userId?: number;
  usuarioId?: number;
}

export interface SugestaoResponse {
  sugestao: string;
}

export type IotReadingStatus = 'ok' | 'warning' | 'critical';

export interface IotReading {
  deviceId: string;
  hydrationPercent: number;
  temperatureC: number;
  movementCount: number;
  status: IotReadingStatus;
  timestamp: string;
  source: string;
}

export interface NativeLocation {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: string;
}

export interface HabitSyncEvent {
  action: 'created' | 'deleted';
  userId: number;
  habit?: Habito;
  habitId?: number;
  timestamp: string;
}

export interface RealtimeEvent {
  id: string;
  type:
    | 'connect'
    | 'disconnect'
    | 'connect_error'
    | 'notification:new'
    | 'iot:reading'
    | 'habit:sync'
    | 'location:shared';
  message: string;
  timestamp: string;
}
