import { Habito, Usuario } from '../types';

/**
 * Este arquivo contém constantes e enumerações compartilhadas pela
 * aplicação. Manter valores comuns em um local central evita strings
 * mágicas espalhadas e melhora a segurança de tipos ao referenciar
 * roles, chaves de armazenamento e outros identificadores repetidos.
 */

// URL base da API backend. Atualize este valor para apontar para o
// servidor Spring Boot. Durante o desenvolvimento com Expo em um
// simulador, pode ser necessário usar o IP da máquina na rede local
// em vez de localhost. Exemplo: http://192.168.0.10:8080/api
export const API_BASE_URL = 'http://localhost:8080/api';

// API externa de atividades recreativas. Ela é usada na tela de
// sugestão como fallback quando a API Spring Boot não está disponível.
// Pode ser substituída por qualquer API pública que forneça sugestões
// adequadas.
export const API_BORED_URL = 'https://bored-api.appbrewery.com/filter?type=recreational';

// Mantenha false para demonstrações em que o app mobile precisa
// funcionar sem a API Spring Boot. Altere para true quando o endpoint
// de sugestão do backend estiver disponível e deve ser usado primeiro.
export const USE_BACKEND_SUGESTAO = false;

// Chaves de armazenamento usadas com AsyncStorage. Centralizar as
// chaves reduz a chance de erros de digitação e facilita mudanças
// futuras.
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_ID: 'userId',
};

// Enumeração dos perfis de usuário. Se a aplicação diferenciar
// permissões por perfil, o enum garante validação em tempo de
// compilação.
export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface MockUsuario extends Usuario {
  senha: string;
}

// Mantém a demonstração acadêmica funcional quando a API Spring Boot
// não está em execução. A camada de serviço ainda tenta usar a API
// real antes de recorrer a estes valores.
export const USE_MOCK_API_FALLBACK = true;

export const MOCK_USERS: MockUsuario[] = [
  {
    id: 1,
    nome: 'Lucas Garcia',
    email: 'lucas@email.com',
    senha: '123456',
    role: Role.USER,
  },
];

export const MOCK_HABITOS: Habito[] = [
  {
    id: 1,
    nome: 'Beber agua',
    descricao: 'Manter uma garrafa por perto durante as aulas e estudos.',
    meta: '2 litros por dia',
    dataCriacao: '2026-05-01',
    usuarioId: 1,
  },
  {
    id: 2,
    nome: 'Caminhar',
    descricao: 'Fazer uma caminhada leve depois do almoco.',
    meta: '30 minutos por dia',
    dataCriacao: '2026-05-02',
    usuarioId: 1,
  },
  {
    id: 3,
    nome: 'Meditar',
    descricao: 'Pausar antes de dormir para respirar e desacelerar.',
    meta: '10 minutos por noite',
    dataCriacao: '2026-05-03',
    usuarioId: 2,
  },
];
