export interface Connection {
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface ConnectionCancel {
  source: string;
  event: MouseEvent;
  sourceHandle?: string;
}
