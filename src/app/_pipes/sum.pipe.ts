import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sum'
})
export class SumPipe implements PipeTransform {
  transform(values: Array<number>): number {
    return values.reduce((sum, value) => sum + value);
  }
}
