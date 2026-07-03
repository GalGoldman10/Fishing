// Fallback module for TypeScript — Metro prefers MapProvider.web.tsx / MapProvider.native.tsx.
export { getMapProvider } from './MapProvider.native';
export type { MapProviderProps } from './mapTypes';
