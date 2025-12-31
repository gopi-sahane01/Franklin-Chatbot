
export enum Sender {
  User = 'user',
  Bot = 'bot',
}

export enum ChatState {
  INITIAL,
  GREETED,
  SERVICE_SELECTED,
  AWAITING_ISSUE,
  ISSUE_SUBMITTED,
}

export interface ButtonInfo {
  label: string;
  payload: string;
  type: 'service' | 'redirect';
}

export interface Message {
  id: string;
  sender: Sender;
  text: string;
  buttons?: ButtonInfo[];
}

export interface PersistedState {
  messages: Message[];
  chatState: ChatState;
  userName?: string;
  lastUpdated: number;
}
