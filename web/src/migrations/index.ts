import * as migration_20260928_051359_initial from './20260928_051359_initial';

export const migrations = [
  {
    up: migration_20260928_051359_initial.up,
    down: migration_20260928_051359_initial.down,
    name: '20260928_051359_initial'
  },
];
