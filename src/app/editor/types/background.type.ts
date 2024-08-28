export type Background = ColorsBackground | DotsBackground | GridBackground;

export interface ColorsBackground {
  type: 'solid';
  color: string;
}

export interface DotsBackground {
  type: 'dots';
  gap?: number;
  color?: string;
  size?: number;
  backgroundColor?: string;
}

export interface GridBackground {
  type: 'grid';
  gap?: number;
  color?: string;
  size?: number;
  backgroundColor?: string;
}
