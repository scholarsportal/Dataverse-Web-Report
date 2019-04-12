// ref http://www.muller.tech/post/2017/11/13/angular5-d3js-pie-chart/
// bl.ocks.org/enjalot/1203641

import { Component, OnInit, OnChanges, ViewChild, ElementRef, Input } from '@angular/core';
import * as d3 from 'd3';
import { SumPipe } from '../_pipes/sum.pipe';
import * as _ from 'underscore';
import { WindowRefService } from '../window-ref.service';

@Component({
  selector: 'app-piechart',
  templateUrl: './piechart.component.html',
  styleUrls: ['./piechart.component.scss']
})

export class PiechartComponent implements OnInit, OnChanges {
  @ViewChild('containerPieChart') chartContainer: ElementRef;
  @Input() data: any = [];
  @Input() chartTitle: string;
  @Input() colours: Array<string>;
  hostElement: any;
  svg: any;
  radius: number;
  innerRadius: number;
  outerRadius: number;
  htmlElement: HTMLElement;
  arcGenerator: any;
  arcHover: any;
  outerArc: any;
  pieGenerator: any;
  path: any;
  values: Array<number>;
  labels: Array<string>;
  centralLabel: any;
  pieColours: any;
  slices: Array<any>;
  selectedSlice: any;
  colourSlices: Array<string>;
  arc: any;
  tooltip: any;
  details: any;

  constructor(
    private elRef: ElementRef,
    private winref: WindowRefService
  ) {}

  ngOnInit() {
    this.details = {};
    this.details.title = this.chartTitle;
    // create chart and render
    this.createChart();
    this.updateChart(false);
  }

  ngOnChanges() {
    // update chart on data input value change
    if (this.svg) {
      this.updateChart(false);
    }
  }

  createChart = () => {
    // chart configuration
    this.hostElement = this.chartContainer.nativeElement;

    this.radius = Math.min(this.hostElement.offsetWidth, this.hostElement.offsetHeight) / 2 - 80;
    const innerRadius = this.radius - 10;
    const outerRadius = this.radius - 50;
    const hoverRadius = this.radius - 5;
    this.pieColours = this.colours ? d3.scaleOrdinal().range(this.colours) : d3.scaleOrdinal(d3.schemeCategory20c);
    this.tooltip = d3.select('body')
      .append('div')
      .attr('class', 'mytooltip')
      .style('display', 'none');

    // create a pie generator and tell it where to get numeric values from and whether sorting is needed or not
    // this is just a function that will be called to obtain data prior binding that data to elements of the chart
    this.pieGenerator = d3.pie().sort(null).value((d: number) => d)([0, 0, 0]);
    // create an arc generator and configure it
    // this is just a function that will be called to obtain data prior binding that data to arc elements of the chart
    this.arcGenerator = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

    this.arcHover = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(hoverRadius);

    this.outerArc = d3.arc()
      .innerRadius(this.radius)
      .outerRadius(this.radius);

    // create svg element, configure dimensions and centre and add to DOM
    this.svg = d3.select(this.hostElement).append('svg')
      .attr('viewBox', '0, 0, ' + this.hostElement.offsetWidth + ', ' + this.hostElement.offsetHeight)
      .append('g')
      .attr('transform', `translate(${this.hostElement.offsetWidth / 2}, ${this.hostElement.offsetHeight / 2})`);

    this.svg.append('text')
      .attr('x', 0)
      .attr('y', 0 - (this.hostElement.offsetHeight / 2) + 15)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .text(this.details.title);

    this.svg.append('g')
      .attr('class', 'slices');
    this.svg.append('g')
      .attr('class', 'labels');
    this.svg.append('g')
      .attr('class', 'lines');
  }

  updateChart = (firstRun: boolean) => {
    const obj =  this;

    this.slices = this.updateSlices(this.data);
    this.labels = this.slices.map(slice => slice.family);
    this.colourSlices = this.slices.map(slice => this.pieColours(slice.family));

    this.values = firstRun ? [0, 0, 0] : _.toArray(this.slices).map(slice => slice.amount);

    this.pieGenerator = d3.pie().sort(null).value((d: number) => d)(this.values);

    const arc = this.svg.selectAll('.arc')
      .data(this.pieGenerator);
    arc.exit().remove();

    const arcEnter = arc.enter().append('g')
      .attr('class', 'arc');

    arcEnter.append('path')
      .attr('d', this.arcGenerator)
      .each((values) => firstRun ? values.storedValues = values : null)
      .on('mouseenter', function(d) {  // Mouse event
        d3.select(this)
          .transition()
          .duration(500)
          .style('cursor', 'pointer');
        obj.tooltip
          .transition()  // Opacity transition when the tooltip appears
          .duration(500)
          .style('display', 'block');  // The tooltip appears
      })
      .on('mouseleave', function() {
        obj.tooltip.style('display', 'none'); })

      .on('mousemove', function(d) {  // Mouse event
        const slice = obj.slices[d.index];
        obj.tooltip
          .html(
            '<div>Total ' + slice.family + '<br/> ' + slice.amount + '</div>');
        const xPosition = d3.event.clientX + obj.winref.nativeWindow.scrollX - (100);
        const yPosition = d3.event.clientY - 100 + obj.winref.nativeWindow.scrollY;
        obj.tooltip.style('left', xPosition + 'px')
          .style('top', yPosition + 'px');
      });

    // configure a transition to play on d elements of a path
    // whenever new values are passed in, the values and the previously stored values will be used
    // to compute the transition using interpolation
    d3.select(this.hostElement).selectAll('path')
      .data(this.pieGenerator)
      .attr('fill', (datum, index) => this.pieColours(this.labels[index]))
      .attr('d', this.arcGenerator)
      .transition()
      .duration(750)
      .attrTween('d', function(newValues, i) {
        return obj.arcTween(newValues, i, this);
      });

    // labels position
    const text = this.svg.select('.labels').selectAll('text')
      .data(this.pieGenerator, function(d) {
        return d.family;
      });

    // label text
    text.enter()
      .append('text')
      .attr('dy', '.35em')
      .text(function(d) {
        return obj.labels[d.index] + ' ' + obj.toPercent(obj.values[d.index], new SumPipe().transform(obj.values));
      });
    function midAngle(d) {
      return d.startAngle + (d.endAngle - d.startAngle) / 2;
    }

    this.svg.select('.labels').selectAll('text').transition().duration(1000)
      .attrTween('transform', function(d) {
        this._current = this._current || d;
        const interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function(t) {
          const d2 = interpolate(t);
          const pos = obj.outerArc.centroid(d2);
          pos[0] = obj.radius * (midAngle(d2) < Math.PI ? 1 : -1);
          return 'translate(' + pos + ')';
        };
      })
      .styleTween('text-anchor', function(d) {
        this._current = this._current || d;
        const interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function(t) {
          const d2 = interpolate(t);
          return midAngle(d2) < Math.PI ? 'start' : 'end';
        };
      });

    text.exit()
      .remove();

    const polyline = this.svg.select('.lines').selectAll('polyline')
      .data(this.pieGenerator, function(d) {
        return d.family;
      });

    polyline.enter()
      .append('polyline');

    this.svg.select('.lines').selectAll('polyline').transition().duration(1000)
      .attrTween('points', function(d) {
        this._current = this._current || d;
        const interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function(t) {
          const d2 = interpolate(t);
          const pos = obj.outerArc.centroid(d2);
          pos[0] = obj.radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
          return [obj.arcGenerator.centroid(d2), obj.outerArc.centroid(d2), pos];
        };
      });

    polyline.exit()
      .remove();
  }

  arcTween(newValues, i, slice) {
    const interpolation = d3.interpolate(slice.storedValues, newValues);
    slice.storedValues = interpolation(0);

    return (t) => {
      return this.arcGenerator(interpolation(t));
    };
  }

  toPercent = (a: number, b: number): string => {
    return Math.round( a / b * 100) + '%';
  }

  updateSlices = (newData: Array<any>): Array<any> => {
    const queriesByFamilyTypes = _.groupBy(_.sortBy(newData, 'family'), 'family');
    const results = [];

    Object.keys(queriesByFamilyTypes).map((family) => {
      results.push({
        family: family,
        amount: queriesByFamilyTypes[family].length,
        types: []
      });
    });

    results.map(result => {
      const queries = newData.filter(query => query.family === result.family);
    });

    return results;
  }
}
