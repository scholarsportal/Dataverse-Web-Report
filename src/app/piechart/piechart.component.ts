// https://codepen.io/vlt5/details/NqOvoG

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
  @ViewChild('containerPieChart', { static: true }) chartContainer: ElementRef;
  @Input() data: any = [];
  @Input() chartTitle: string;
  @Input() colours: Array<string>;
  hostElement: any;
  svg: any;
  radius: number;
  arcGenerator: any;
  pieGenerator: any;
  path: any;
  values: Array<number>;
  labels: Array<string>;
  pieColours: any;
  slices: Array<any>;
  colourSlices: Array<string>;
  arc: any;
  tooltip: any;
  details: any;
  canvas: any;
  art: any;
  labelsSelection: any;
  pieData: Array<any>;
  cDim: any = {
    height: 600,
    width: 600,
    innerRadius: 20,
    outerRadius: 95,
    labelRadius: 125
  };

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
    this.radius = (Math.min(this.hostElement.offsetWidth, this.hostElement.offsetHeight) / 2) + 80 ;
    this.cDim.labelRadius = (this.radius / 2 - 10);
    this.cDim.outerRadius = this.cDim.labelRadius - 30;
    this.cDim.innerRadius = this.cDim.outerRadius / 4;
    this.pieColours = this.colours ? d3.scaleOrdinal().range(this.colours) : d3.scaleOrdinal(d3.schemeCategory10);
    this.tooltip = d3.select('body')
      .append('div')
      .attr('class', 'mytooltip')
      .style('display', 'none');
    this.pieGenerator = d3.pie().sort(null).value((d: number) => d)([0, 0, 0]);
    this.arcGenerator = d3.arc()
      .innerRadius(this.cDim.innerRadius)
      .outerRadius(this.cDim.outerRadius);
    this.svg = d3.select(this.hostElement).append('svg')
      .attr('height', this.cDim.height)
      .attr('width', this.cDim.width)
      .attr('viewBox', '0, 0, ' +  this.cDim.width + ', ' +  this.cDim.height)
      .append('g')
      .attr('transform', `translate(${(this.cDim.width / 2) + 50}, ${ this.cDim.height / 2})`);
    this.svg.append('text')
      .attr('x', 0)
      .attr('y', 0 - (this.hostElement.offsetHeight / 2))
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .text(this.details.title);
    this.canvas = this.svg.append('g')
      .attr('id', 'canvas');
    this.art = this.canvas.append('g')
      .attr('id', 'art');
    this.labelsSelection = this.canvas.append('g')
      .attr('id', 'labels');
  }

  updateChart = (firstRun: boolean) => {
    const obj =  this;
    this.slices = this.updateSlices(this.data);
    this.values = firstRun ? [0, 0, 0] : _.toArray(this.slices).map(slice => slice.amount);
    this.slices.forEach((d) => {
      d.pct = this.toPercent(d.amount, new SumPipe().transform(this.values));
    });
    this.slices.sort((a, b) => {
      return b.amount - a.amount;
    });
    this.labels = this.slices.map(slice => slice.family);
    this.colourSlices = this.slices.map(slice => this.pieColours(slice.family));
    this.pieGenerator = d3.pie().value((d: any) => {
      return d.amount;
    });
    this.pieData = this.pieGenerator(this.slices);
    this.art.selectAll('.wedge')
      .data(this.pieData)
      .enter()
      .append('path')
      .attr('class', 'wedge')
      .attr('d', this.arcGenerator)
      .style('fill', (d, i) => {
        return this.pieColours(i);
      })
      .on('mouseenter', function() {
        d3.select(this)
          .transition()
          .duration(500)
          .style('cursor', 'pointer');
        obj.tooltip
          .transition()  // Opacity transition when the tooltip appears
          .duration(500)
          .style('display', 'block');  // The tooltip appears
      })
      .on('mouseleave', () => {
        obj.tooltip
          .style('display', 'none');
      })
      .on('mousemove', (d) => {
        const slice = obj.slices[d.index];
        obj.tooltip
          .html(
            '<div>Total ' + slice.family + '<br/> ' + slice.amount + '</div>');
        const xPosition = d3.event.clientX + obj.winref.nativeWindow.scrollX - (100);
        const yPosition = d3.event.clientY - 100 + obj.winref.nativeWindow.scrollY;
        obj.tooltip.style('left', xPosition + 'px')
          .style('top', yPosition + 'px');
      });

    const enteringLabels = this.labelsSelection.selectAll('.label').data(this.pieData).enter();
    const labelGroups = enteringLabels.append('g').attr('class', 'label');
    const lines = labelGroups.append('line')
      .attr('x1', (d, i) => {
        return this.arcGenerator.centroid(d)[0];
      })
      .attr('y1', (d) => {
        return this.arcGenerator.centroid(d)[1];
      })
      .attr('x2', (d) => {
        const centroid = this.arcGenerator.centroid(d);
        const midAngle = Math.atan2(centroid[1], centroid[0]);
        return Math.cos(midAngle) * this.cDim.labelRadius;
      })
      .attr('y2', (d) => {
        const centroid = this.arcGenerator.centroid(d);
        const midAngle = Math.atan2(centroid[1], centroid[0]);
        return Math.sin(midAngle) * this.cDim.labelRadius;
      })
      .attr('class', 'label-line')
      .attr('stroke', (d, i) => {
        return this.pieColours(i);
      });

    const textLabels = labelGroups.append('text').attr('x', (d, i) => {
      const centroid = this.arcGenerator.centroid(d);
      const midAngle = Math.atan2(centroid[1], centroid[0]);
      const x = Math.cos(midAngle) * this.cDim.labelRadius;
      const sign = x > 0 ? 1 : -1;
      return x + (5 * sign);
    }).attr('y', (d, i) => {
      const centroid = this.arcGenerator.centroid(d);
      const midAngle = Math.atan2(centroid[1], centroid[0]);
      const y = Math.sin(midAngle) * this.cDim.labelRadius;
      return y;
    }).attr('text-anchor', (d, i) => {
      const centroid = this.arcGenerator.centroid(d);
      const midAngle = Math.atan2(centroid[1], centroid[0]);
      const x = Math.cos(midAngle) * this.cDim.labelRadius;
      return x > 0 ? 'start' : 'end';
    }).attr('class', 'label-text')
      .text((d) => {
        return d.data.family + ' ( ' + d.data.pct + ' ) ';
      });

    const alpha = 0.5;
    const spacing = 15;

    function relax() {
      let again = false;
      textLabels.each(function(d, i) {
        const a = this;
        const da = d3.select(a);
        const y1: any = da.attr('y');
        textLabels.each(function(d, j) {
          const b = this;
          if (a === b) {
            return ;
          }

          const db = d3.select(b);
          if (da.attr('text-anchor') !== db.attr('text-anchor')) {
            return ;
          }

          const y2: any = db.attr('y');
          const deltaY: any = y1 - y2;

          if (Math.abs(deltaY) > spacing) {
            return ;
          }

          again = true;
          const sign = deltaY > 0 ? 1 : -1;
          const adjust = sign * alpha;
          da.attr('y', +y1 + adjust);
          db.attr('y', +y2 - adjust);
        });
      });

      if (again) {
        const labelElements = textLabels._groups[0];
        lines.attr('y2', (d, i) => {
          const labelForLine = d3.select(labelElements[i]);
          return labelForLine.attr('y');
        });
        setTimeout(relax, 20);
      }
    }

    relax();
  }

  toPercent = (a: number, b: number): string => {
    return Math.round( a / b * 100) + '%';
  }

  updateSlices = (newData: Array<any>): Array<any> => {
    const queriesByFamilyTypes = _.groupBy(_.sortBy(newData, 'family'), 'family');
    const results = [];

    Object.keys(queriesByFamilyTypes).map((family) => {
      results.push({
        family,
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
