import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CosmicBackgroundComponent } from './components/cosmic-background.component';
import { NavComponent } from './components/nav.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavComponent, CosmicBackgroundComponent],
  template: `
    <app-cosmic-background />
    <app-nav />
    <main>
      <router-outlet />
    </main>
  `,
})
export class App {}
