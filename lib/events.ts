import { EventEmitter } from 'events';

class ChatEventEmitter extends EventEmitter {}

declare global {
  // eslint-disable-next-line no-var
  var chatEvents: ChatEventEmitter | undefined;
}

const chatEvents = globalThis.chatEvents || new ChatEventEmitter();
chatEvents.setMaxListeners(100);

if (process.env.NODE_ENV !== 'production') {
  globalThis.chatEvents = chatEvents;
}

export { chatEvents };
