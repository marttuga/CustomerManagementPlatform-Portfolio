import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../navbar.component/navbar.component';
import { TableGenericComponent } from '../table-generic.component/table-generic.component';
import { LOCATION_CONFIG, ColumnConfig } from '../../../config/location-columns.config';

/**
 * Shell component for location detail pages.
 * Reads the locationKey from the route and passes the correct
 * column configuration to the generic table component.
 */
@Component({
  selector: 'app-location-base',
  standalone: true,
  imports: [CommonModule, NavbarComponent, TableGenericComponent],
  templateUrl: './location-base.component.html',
  styleUrls: ['./location-base.component.css'],
})
export class LocationBaseComponent implements OnInit {
  locationName = '';
  locationKey = '';

  /** Typed column config passed to the generic table. */
  columns: ColumnConfig[] = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.locationKey = params.get('locationKey') ?? '';

      const config = LOCATION_CONFIG[this.locationKey];

      if (!config) {
        this.locationName = 'Unknown location';
        this.columns = [];
        return;
      }

      this.locationName = config.title;
      this.columns = config.columns;
    });
  }
}