import * as migration_20260928_051359_initial from './20260928_051359_initial';
import * as migration_20260928_055646_testimoni_screenshot from './20260928_055646_testimoni_screenshot';
import * as migration_20260928_063254_foto_personel from './20260928_063254_foto_personel';
import * as migration_20261008_103905_seo from './20261008_103905_seo';

export const migrations = [
  {
    up: migration_20260928_051359_initial.up,
    down: migration_20260928_051359_initial.down,
    name: '20260928_051359_initial',
  },
  {
    up: migration_20260928_055646_testimoni_screenshot.up,
    down: migration_20260928_055646_testimoni_screenshot.down,
    name: '20260928_055646_testimoni_screenshot',
  },
  {
    up: migration_20260928_063254_foto_personel.up,
    down: migration_20260928_063254_foto_personel.down,
    name: '20260928_063254_foto_personel',
  },
  {
    up: migration_20261008_103905_seo.up,
    down: migration_20261008_103905_seo.down,
    name: '20261008_103905_seo'
  },
];
