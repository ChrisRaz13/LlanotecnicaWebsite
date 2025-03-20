import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SelectivePreloadingStrategy implements PreloadingStrategy {
  preloadedModules: string[] = [];

  preload(route: Route, load: () => Observable<any>): Observable<any> {
    if (route.data?.['preload'] === true) {
      // Add the route path to the list of preloaded modules
      this.preloadedModules.push(route.path || '');
      // Preload the module
      return load();
    } else {
      return of(null);
    }
  }
}
