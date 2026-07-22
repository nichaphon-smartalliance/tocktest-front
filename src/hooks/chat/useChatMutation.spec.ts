import { renderHook, act } from '@testing-library/react';
import { useChatMutation } from './useChatMutation';
import { createQueryWrapper } from '@/test/helpers/query-wrapper';
import { sendChatMessage } from '@/services/chat.service';

vi.mock('@/services/chat.service', () => ({
  sendChatMessage: vi.fn(),
}));

const mockSendChatMessage = vi.mocked(sendChatMessage);

describe('useChatMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends the message body to the chat service and returns the reply', async () => {
    mockSendChatMessage.mockResolvedValue('Hello there!');
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useChatMutation('repo-1'), { wrapper: Wrapper });

    let reply: string | undefined;
    await act(async () => {
      reply = await result.current.sendMessage({ message: 'Hi', history: [], language: 'en' });
    });

    expect(mockSendChatMessage).toHaveBeenCalledWith('repo-1', { message: 'Hi', history: [], language: 'en' });
    expect(reply).toBe('Hello there!');
    expect(result.current.isSending).toBe(false);
  });

  it('propagates an error when the chat request fails', async () => {
    mockSendChatMessage.mockRejectedValue(new Error('AI unavailable'));
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useChatMutation('repo-1'), { wrapper: Wrapper });

    let caught: unknown;
    await act(async () => {
      try {
        await result.current.sendMessage({ message: 'Hi' });
      } catch (err) {
        caught = err;
      }
    });

    expect(caught).toBeInstanceOf(Error);
    expect((caught as Error).message).toBe('AI unavailable');
  });
});
