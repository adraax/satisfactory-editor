export type Background = ColorsBackground | DotsBackground;

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
