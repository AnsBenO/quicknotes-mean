import { Directive, ElementRef, HostListener } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

@Directive({
  selector: '[trimInput]',
  standalone: true,
})
export class TrimInputDirective {
  // Constructor to inject NgControl and ElementRef instances
  constructor(private ngControl: NgControl, private el: ElementRef) {
    // Call a function to modify the behavior of the value accessor to trim input values
    trimValueAccessor(ngControl.valueAccessor as ControlValueAccessor);
  }

  // HostListener decorator to listen for the "blur" event on the associated element
  @HostListener('blur', ['$event.target.value'])
  // Function executed when the "blur" event occurs
  onBlur() {
    // Trim the value of the native element and update it
    const trimmedValue = this.el.nativeElement.value.trim();
    this.el.nativeElement.value = trimmedValue;
  }
}

// Function to modify the behavior of a value accessor to trim input values
function trimValueAccessor(valueAccessor: ControlValueAccessor) {
  // Store the original registerOnChange function
  const original = valueAccessor.registerOnChange;

  // Override the registerOnChange function to trim input values before calling the original function
  valueAccessor.registerOnChange = (fn: (_: unknown) => void) => {
    return original.call(valueAccessor, (value: unknown) => {
      // Trim the value if it is a string before passing it to the original function
      return fn(typeof value === 'string' ? value.trim() : value);
    });
  };
}
