import { Component, OnInit, OnChanges, ViewChild, ElementRef, Input, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';
import { WindowRefService } from '../window-ref.service';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ChartComponent implements OnInit, OnChanges {
  @ViewChild('chart') private chartContainer: ElementRef;
  @Input() private data: Array<any>;
  @Input() chartTitle: string;
  @Input() chartLabelX: string;
  @Input() chartLabelY: string;
  @Input() chartBarColor: string;


  private margin: any = { top: 55, bottom: 105, left: 60, right: 20};
  private chart: any;
  private width: number;
  private height: number;
  private xScale: any;
  private yScale: any;
  private colors: any;
  private xAxis: any;
  private yAxis: any;
  private element: any;
  private details: any;
  tooltip: any;

  constructor(private winref: WindowRefService) { }

  ngOnInit() {
    const details = {
      title: this.chartTitle,
      titleY: this.chartLabelY,
      titleX: this.chartLabelX
    };

    this.createChart(details);
    if (this.data) {
      this.updateChart();
    }
  }

  ngOnChanges() {
    if (this.chart) {
      this.updateChart();
    }
  }

  createChart(details) {
    this.details = details;
    const element = this.chartContainer.nativeElement;
    this.element = element;
    this.width = element.offsetWidth - this.margin.left - this.margin.right;
    this.height = element.offsetHeight - this.margin.top - this.margin.bottom;
    const svg = d3.select(element).append('svg')
      .attr('width', element.offsetWidth)
      .attr('height', element.offsetHeight);

    // chart plot area
    this.chart = svg.append('g')
      .attr('class', 'bars')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    this.tooltip = d3.select('body')
      .append('div')
      .attr('class', 'mytooltip')
      .style('display', 'none');

    // define X & Y domains
    const xDomain = this.data.map(d => d[0]);
    const yDomain = [0, d3.max(this.data, d => d[1])];

    // create scales
    this.xScale = d3.scaleBand().padding(0.1).domain(xDomain).rangeRound([0, this.width]);
    this.yScale = d3.scaleLinear().domain(yDomain).range([this.height, 0]);

    // bar colors
    this.colors = d3.scaleLinear().domain([0, this.data.length]).range(<any[] > [this.chartBarColor, this.chartBarColor]);

    // x & y axis
    this.xAxis = svg.append('g')
      .attr('class', 'axis axis-x')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top + this.height})`)
      .call(d3.axisBottom(this.xScale))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-65)');
    this.yAxis = svg.append('g')
      .attr('class', 'axis axis-y')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)
      .call(d3.axisLeft(this.yScale));

    this.chart.append('text')
      .attr('transform',
        'translate(' + (this.width / 2) + ' ,' +
        (this.height + this.margin.top + 50) + ')')
      .style('text-anchor', 'middle')
      .text(details.titleX);

    // y-axis title
    this.chart.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - this.margin.left)
      .attr('x', 0 - (this.height / 2) - 20)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text(details.titleY);

    // chart title
    this.chart.append('text')
      .attr('x', (this.width / 2))
      .attr('class', 'chartTitle')
      .attr('y', 0 - (this.margin.top / 2) + 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px');
  }

  updateChart() {
    const obj =  this;
    this.chart.select('.chartTitle').text(this.chartTitle);

    // update scales & axis
    this.xScale.domain(this.data.map(d => d[0]));
    this.yScale.domain([0, d3.max(this.data, d => d[1])]);
    this.colors.domain([0, this.data.length]);
    this.yAxis.transition().call(d3.axisLeft(this.yScale));

    const update = this.chart.selectAll('.bar')
      .data(this.data);

    // remove exiting bars
    update.exit().remove();

    // update existing bars
    this.chart.selectAll('.bar').transition()
      .attr('x', d => this.xScale(d[0]))
      .attr('y', d => this.yScale(d[1]))
      .attr('width', d => this.xScale.bandwidth())
      .attr('height', d => this.height - this.yScale(d[1]))
      .style('fill', (d, i) => this.colors(i));

    // add new bars
    update
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => this.xScale(d[0]))
      .attr('y', d => this.yScale(0))
      .attr('width', this.xScale.bandwidth())
      .attr('height', 0)
      .style('fill', (d, i) => this.colors(i))
      .transition()
      .delay((d, i) => i * 10)
      .attr('y', d => this.yScale(d[1]))
      .attr('x', d => this.xScale(d[0]))
      .attr('height', d => this.height - this.yScale(d[1]));

    d3.select(this.element).selectAll('.axis-x').remove();

    this.xAxis = this.chart.append('g')
      .attr('class', 'axis axis-x')
      .attr('transform', `translate(0, ${ this.height})`)
      .call(d3.axisBottom(this.xScale))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-65)');

    d3.selectAll('.bar')
      .on('mouseenter', function(d) {  // Mouse event
        d3.select(this)
          .transition()
          .style('cursor', 'pointer');
        obj.tooltip
          .transition()  // Opacity transition when the tooltip appears
          .duration(500)
          .style('display', 'block'); // The tooltip appears
      })
      .on('mouseleave', function() {
        obj.tooltip.style('display', 'none'); })
      .on('mousemove', function(d) {  // Mouse event
        const val = Math.round(d[1] * 100) / 100;
        obj. tooltip
          .html(
            '<div> Total ' + d[0] + '<br/> ' + val + '</div>');
        const xPosition = d3.event.clientX + obj.winref.nativeWindow.scrollX - (100);
        const yPosition = d3.event.clientY - 100 + obj.winref.nativeWindow.scrollY;
        obj.tooltip.style('left', xPosition + 'px')
          .style('top', yPosition + 'px');
      });
  }
}
