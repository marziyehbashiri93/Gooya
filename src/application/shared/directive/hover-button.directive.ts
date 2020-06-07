import { Directive, ElementRef, HostBinding, HostListener, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appHoverButton]'
})
export class HoverButtonDirective implements OnInit {
  constructor(private elementRef: ElementRef, private renderer: Renderer2) { }

  @Input() hoverColor = '#1671bf';
  @Input() defualtColor = window.getComputedStyle(this.elementRef.nativeElement).getPropertyValue('fill');
  @Input() defualtTextColor = window.getComputedStyle(this.elementRef.nativeElement).getPropertyValue('color');

  @HostBinding('style.fill') fill: string;
  @HostBinding('style.color') color: string;

  ngOnInit() {
    this.renderer.setStyle(this.elementRef.nativeElement, 'transition', ' 0.5s');
    this.renderer.setStyle(this.elementRef.nativeElement, 'cursor', ' pointer');
    this.fill = this.defualtColor;
    this.color = this.defualtTextColor;
  }

  @HostListener('mouseenter', ['$event']) mouseenter(eventData: Event) {
    this.fill = this.hoverColor;
    this.color = this.hoverColor;
  }
  @HostListener('mouseleave', ['$event']) mouseleave(eventData: Event) {
    this.fill = this.defualtColor;
    this.color = this.defualtTextColor;
  }
}
