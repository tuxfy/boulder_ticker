// App-Einstieg: Views mounten + Router starten.
import { initRouter } from './core/router.js';
import { mountMenu } from './views/menu/menu.js';
import { mountTimer } from './views/timer/timer.js';
import { mountBoulderlog } from './views/boulderlog/boulderlog.js';
import { mountGym, gymUpdateBar, onGymScreenOpen } from './views/gym/gym.js';
import { mountScanner } from './views/scanner/scanner.js';

const SCREENS = {
  '':           'screen-home',
  'boulderlog': 'screen-boulderlog',
  'timer':      'screen-timer',
  'gym':        'screen-gym',
};

mountMenu();
mountTimer();
mountBoulderlog();
mountGym();
mountScanner();

initRouter({
  screens: SCREENS,
  fallback: 'screen-home',
  onShow: (active) => {
    if (active === 'screen-boulderlog') gymUpdateBar();
    if (active === 'screen-gym')        onGymScreenOpen().catch(() => {});
  },
});
