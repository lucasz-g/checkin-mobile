import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  API_BORED_URL,
  API_BASE_URL,
  MOCK_HABITOS,
  MOCK_USERS,
  STORAGE_KEYS,
  USE_BACKEND_SUGESTAO,
  USE_MOCK_API_FALLBACK,
} from '../constants';
import { Habito, AuthResponse, SugestaoResponse } from '../types';

/**
 * Serviço responsável pela comunicação com o backend. Cada função é
 * tipada para indicar entradas e saídas, garantindo que os consumidores
 * deste módulo saibam exatamente o que esperar de uma chamada à API.
 * As funções lançam erros quando as respostas não são OK para que as
 * telas tratem falhas de forma consistente.
 */

const MOCK_TOKEN_PREFIX = 'mock-token';
let mockHabitos = MOCK_HABITOS.map((habito) => ({ ...habito }));

function isMockToken(token: string | null): boolean {
  return Boolean(token?.startsWith(MOCK_TOKEN_PREFIX));
}

function getMockHabitos(userId: number): Habito[] {
  return mockHabitos
    .filter((habito) => habito.usuarioId === userId)
    .map((habito) => ({ ...habito }));
}

async function loginWithMock(email: string, senha: string): Promise<string> {
  const user = MOCK_USERS.find(
    (mockUser) =>
      mockUser.email.toLowerCase() === email.trim().toLowerCase() &&
      mockUser.senha === senha
  );

  if (!user) {
    throw new Error(
      'Credenciais inválidas. Para demo sem API, use lucas@email.com com senha 123456.'
    );
  }

  const token = `${MOCK_TOKEN_PREFIX}-${user.id}`;
  await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
  await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, String(user.id));
  return token;
}

function createMockHabito(
  userId: number,
  habito: Omit<Habito, 'id' | 'dataCriacao' | 'usuarioId'>
): Habito {
  const nextId = mockHabitos.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1;
  const newHabito: Habito = {
    id: nextId,
    ...habito,
    dataCriacao: new Date().toISOString().split('T')[0],
    usuarioId: userId,
  };

  mockHabitos = [...mockHabitos, newHabito];
  return { ...newHabito };
}

function deleteMockHabito(habitoId: number): void {
  mockHabitos = mockHabitos.filter((habito) => habito.id !== habitoId);
}

async function getSugestaoFromBoredApi(): Promise<string> {
  const response = await fetch(API_BORED_URL);

  if (!response.ok) {
    throw new Error('Erro ao carregar sugestão');
  }

  const data = (await response.json()) as Array<{ activity: string }>;
  const sugestoes = data
    .map((item) => item.activity)
    .filter((activity): activity is string => Boolean(activity));

  if (!sugestoes.length) {
    throw new Error('Nenhuma sugestão encontrada');
  }

  const randomIndex = Math.floor(Math.random() * sugestoes.length);
  return sugestoes[randomIndex];
}

async function getSugestaoFromBackend(token: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/sugestoes/habito`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Erro ao carregar sugestão');
  }

  const data = (await response.json()) as SugestaoResponse;
  return data.sugestao;
}

export async function getStoredUserId(defaultUserId = 1): Promise<number> {
  const storedUserId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
  const parsedUserId = Number(storedUserId);

  return Number.isInteger(parsedUserId) && parsedUserId > 0
    ? parsedUserId
    : defaultUserId;
}

/**
 * Realiza login no backend. Em caso de sucesso, o token retornado é
 * salvo no AsyncStorage para requisições posteriores.
 *
 * @param email - email do usuário
 * @param senha - senha em texto puro
 * @returns O token JWT retornado pelo backend
 * @throws Error se a requisição falhar
 */
export async function login(email: string, senha: string): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, senha }),
    });

    if (!response.ok) {
      // Extrai a mensagem de erro do backend, se disponível.
      const message = (await response.text()) || 'Falha no login';
      throw new Error(message);
    }

    const data = (await response.json()) as AuthResponse;
    // Persiste o token para chamadas posteriores à API.
    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, data.token);

    const userId = data.userId ?? data.usuarioId ?? 1;
    await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, String(userId));

    return data.token;
  } catch (err) {
    if (USE_MOCK_API_FALLBACK) {
      return loginWithMock(email, senha);
    }

    throw err;
  }
}

/**
 * Busca a lista de hábitos de um usuário. Requer um token JWT válido
 * armazenado no AsyncStorage. O parâmetro userId deve ser informado;
 * ele não é recuperado automaticamente a partir do token.
 *
 * @param userId - id do usuário cujos hábitos serão buscados
 * @returns Um array de hábitos
 * @throws Error se o usuário não estiver autenticado ou a requisição falhar
 */
export async function getHabitos(userId: number): Promise<Habito[]> {
  const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
  if (!token) {
    throw new Error('Usuário não autenticado');
  }

  if (isMockToken(token)) {
    return getMockHabitos(userId);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/habitos/${userId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Erro ao carregar hábitos');
    }
    const data = (await response.json()) as Habito[];
    return data;
  } catch (err) {
    if (USE_MOCK_API_FALLBACK) {
      return getMockHabitos(userId);
    }

    throw err;
  }
}

/**
 * Cria um novo hábito para o usuário especificado. Requer as
 * informações do hábito e um token JWT válido. Retorna o hábito criado
 * conforme retornado pelo backend.
 *
 * @param userId - id do usuário que está criando o hábito
 * @param habito - dados parciais do hábito (nome, descrição, meta)
 * @returns O hábito criado
 */
export async function createHabito(
  userId: number,
  habito: Omit<Habito, 'id' | 'dataCriacao' | 'usuarioId'>
): Promise<Habito> {
  const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
  if (!token) {
    throw new Error('Usuário não autenticado');
  }

  if (isMockToken(token)) {
    return createMockHabito(userId, habito);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/habitos/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(habito),
    });
    if (!response.ok) {
      throw new Error('Erro ao criar hábito');
    }
    const data = (await response.json()) as Habito;
    return data;
  } catch (err) {
    if (USE_MOCK_API_FALLBACK) {
      return createMockHabito(userId, habito);
    }

    throw err;
  }
}

/**
 * Exclui um hábito pelo id. Requer um token JWT válido. Nenhum valor
 * é retornado em caso de sucesso.
 *
 * @param habitoId - id do hábito a ser excluído
 */
export async function deleteHabito(habitoId: number): Promise<void> {
  const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
  if (!token) {
    throw new Error('Usuário não autenticado');
  }

  if (isMockToken(token)) {
    deleteMockHabito(habitoId);
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/habitos/${habitoId}/deletar`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Erro ao deletar hábito');
    }
  } catch (err) {
    if (USE_MOCK_API_FALLBACK) {
      deleteMockHabito(habitoId);
      return;
    }

    throw err;
  }
}

/**
 * Busca uma sugestão de hábito saudável no backend. Se o backend não
 * estiver disponível, usa a API pública Bored como fallback.
 *
 * @returns Texto da sugestão retornada pela API disponível
 */
export async function getSugestao(): Promise<string> {
  const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
  if (!token) {
    throw new Error('Usuário não autenticado');
  }

  if (isMockToken(token) || !USE_BACKEND_SUGESTAO) {
    return getSugestaoFromBoredApi();
  }

  try {
    return getSugestaoFromBackend(token);
  } catch (err) {
    console.log('Erro ao buscar sugestão do backend, tentando API pública...', err);

    if (USE_MOCK_API_FALLBACK) {
      return getSugestaoFromBoredApi();
    }

    throw err;
  }
}

/**
 * Limpa todas as informações de autenticação do armazenamento. Chame
 * esta função ao deslogar o usuário para forçar nova autenticação nos
 * próximos acessos.
 */
export async function logout(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
  await AsyncStorage.removeItem(STORAGE_KEYS.USER_ID);
}
