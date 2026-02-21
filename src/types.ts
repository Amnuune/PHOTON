export type CameraMode = 'PHOTO' | 'VIDEO' | 'NIGHT' | 'PRO' | 'PORTRAIT';

export interface CameraSettings {
  flash: 'on' | 'off' | 'auto';
  hdr: boolean;
  timer: 0 | 3 | 10;
  resolution: '4:3' | '16:9' | '1:1';
}

export const COLORS = {
  primary: '#212121',
  primaryColored: '#6594ff',
  accent: '#9575CD',
  toolbar: '#1c1c1c',
  panel: 'rgba(0, 0, 0, 0.4)',
  focus: 'rgba(0, 0, 0, 0.2)',
};
