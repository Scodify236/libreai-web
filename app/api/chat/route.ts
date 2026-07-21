import { isImageGenModel } from '@/lib/models';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { accountId, apiToken, model, messages } = body;

    let cfUrl = '';
    let headers: Record<string, string> = {};

    if (accountId && apiToken) {
      cfUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;
      headers = {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      };
    } else {
      // Fallback gateway matching Flutter mobile app
      if (isImageGenModel(model)) {
        cfUrl = 'https://libreai-gateway.shashwat-libre.workers.dev/api/image';
      } else {
        cfUrl = 'https://libreai-gateway.shashwat-libre.workers.dev/api/chat';
      }
      headers = { 'Content-Type': 'application/json' };
    }

    if (isImageGenModel(model)) {
      const lastMessage = messages?.[messages.length - 1];
      const prompt =
        typeof lastMessage?.content === 'string'
          ? lastMessage.content
          : Array.isArray(lastMessage?.content)
          ? lastMessage.content.find((c: { type: string; text?: string }) => c.type === 'text')?.text || ''
          : '';

      if (accountId && apiToken) {
        // First try multipart/form-data matching Flutter request logic
        const formData = new FormData();
        formData.append('prompt', prompt);
        formData.append('steps', '25');
        formData.append('width', '1024');
        formData.append('height', '1024');

        let cfResponse = await fetch(cfUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiToken}`,
          },
          body: formData,
        });

        if (!cfResponse.ok) {
          // Retry with JSON body fallback
          cfResponse = await fetch(cfUrl, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt, steps: 25, width: 1024, height: 1024 }),
          });
        }

        if (!cfResponse.ok) {
          const errorText = await cfResponse.text();
          return Response.json({ error: errorText }, { status: cfResponse.status });
        }

        const contentType = cfResponse.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const json = await cfResponse.json();
          const rawBase64 = json?.image || json?.result?.image || json?.result?.response || '';
          return Response.json({ type: 'image', data: rawBase64 });
        }

        const imageBuffer = await cfResponse.arrayBuffer();
        const base64 = Buffer.from(imageBuffer).toString('base64');
        return Response.json({ type: 'image', data: base64 });
      }

      // Public fallback gateway request
      const cfResponse = await fetch(cfUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt, steps: 25, width: 1024, height: 1024 }),
      });

      if (!cfResponse.ok) {
        const errorText = await cfResponse.text();
        return Response.json({ error: errorText }, { status: cfResponse.status });
      }

      const contentType = cfResponse.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await cfResponse.json();
        const rawBase64 = json?.image || json?.result?.image || json?.result?.response || '';
        return Response.json({ type: 'image', data: rawBase64 });
      }

      const imageBuffer = await cfResponse.arrayBuffer();
      const base64 = Buffer.from(imageBuffer).toString('base64');
      return Response.json({ type: 'image', data: base64 });
    }

    // Chat / text model — stream SSE back
    const chatRequestBody = accountId && apiToken
      ? JSON.stringify({ messages, stream: true })
      : JSON.stringify({ model, messages, stream: true });

    const cfResponse = await fetch(cfUrl, {
      method: 'POST',
      headers,
      body: chatRequestBody,
    });

    if (!cfResponse.ok) {
      const errorText = await cfResponse.text();
      // Map structured Cloudflare errors to user-friendly messages
      let userMessage = `API error ${cfResponse.status}`;
      try {
        const parsed = JSON.parse(errorText);
        const code = parsed?.errors?.[0]?.code;
        const status = cfResponse.status;
        if (status === 413 || code === 3006) {
          userMessage = '⚠️ Context window limit reached. Please start a new chat to continue.';
        } else if (code === 3036) {
          userMessage = '⚠️ Daily free neuron allocation (10,000) exhausted. Upgrade to a paid Cloudflare plan or wait until tomorrow.';
        } else if (code === 3040) {
          userMessage = '⚠️ Cloudflare data centers are out of capacity for this model. Try again in a moment or switch to a different model.';
        } else if (code === 5016) {
          userMessage = '⚠️ Model terms agreement required. Accept the model license in your Cloudflare Dashboard first.';
        } else if (status === 403) {
          userMessage = '⚠️ Access denied. Check your API token permissions in Cloudflare Dashboard.';
        } else if (status === 408) {
          userMessage = '⚠️ Request timed out. Please try again.';
        } else {
          userMessage = parsed?.errors?.[0]?.message || userMessage;
        }
      } catch {}
      return Response.json({ error: userMessage }, { status: cfResponse.status });
    }

    return new Response(cfResponse.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
