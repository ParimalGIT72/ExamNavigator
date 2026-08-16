import { AiStreamService } from '../src/services/ai-stream.service';

describe('AiStreamService SSE Parser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should parse start, token, citations, and done SSE events', async () => {
    const mockResponseBody = `event: start\ndata: {"sessionId":"s1"}\n\nevent: citations\ndata: {"citations":[{"title":"Source 1"}]}\n\nevent: token\ndata: {"token":"Hello "}\n\nevent: token\ndata: {"token":"World"}\n\nevent: done\ndata: {"sessionId":"s1"}\n\n`;

    const mockReader = {
      read: jest
        .fn()
        .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode(mockResponseBody) })
        .mockResolvedValueOnce({ done: true, value: undefined }),
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      body: { getReader: () => mockReader },
    });

    const onStart = jest.fn();
    const onCitations = jest.fn();
    const onToken = jest.fn();
    const onDone = jest.fn();

    await AiStreamService.streamChatTurn(
      { message: 'Test message' },
      { onStart, onCitations, onToken, onDone }
    );

    expect(onStart).toHaveBeenCalledWith({ sessionId: 's1' });
    expect(onCitations).toHaveBeenCalled();
    expect(onToken).toHaveBeenCalledWith('Hello ');
    expect(onToken).toHaveBeenCalledWith('World');
    expect(onDone).toHaveBeenCalledWith({ sessionId: 's1' });
  });
});
