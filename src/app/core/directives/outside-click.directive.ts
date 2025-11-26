import {
  Directive,
  ElementRef,
  HostListener,
  output,
  inject,
} from '@angular/core';

@Directive({
  selector: '[outsideClick]',
  standalone: true,
})
export class OutsideClickDirective {
  outsideClick = output<void>();

  private host = inject(ElementRef);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const clickedInside = this.host.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.outsideClick.emit();
    }
  }
}
