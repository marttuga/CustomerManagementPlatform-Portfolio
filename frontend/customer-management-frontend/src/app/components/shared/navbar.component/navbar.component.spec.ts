import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NavbarComponent } from './navbar.component';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render 9 navigation buttons', () => {
    // Dashboard + 8 locations = 9 buttons
    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons.length).toBe(9);
  });

  it('should have a Dashboard button', () => {
    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('button')
    );
    const dashboard = buttons.find(b => b.textContent?.trim() === 'Dashboard');
    expect(dashboard).toBeTruthy();
  });

  it('should have a Riverside button', () => {
    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('button')
    );
    const riverside = buttons.find(b => b.textContent?.trim() === 'Riverside');
    expect(riverside).toBeTruthy();
  });
});