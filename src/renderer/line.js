import * as d3 from 'd3'

const background = d3.arc()
    .innerRadius(d => d.inner_radius)
    .outerRadius(d => d.outer_radius)
    .startAngle(d => d.start_angle)
    .endAngle(d => d.end_angle)

const Line = d3.lineRadial()
    .angle((d) => d.angle)
    .radius((d) => d.inner_radius + d.radius*(d.outer_radius - d.inner_radius))
    .curve(d3.curveLinear)

export default function draw_line(svg, data) {
    const container = svg
    .append('g')
    .attr('class', 'line')
    // .attr( 'transform',`translate(${width} ${width})` )
    
    container
    .selectAll('path')
    .data(data)
    .enter()
    .append('path')
    .attr('class', 'background')
    .attr('fill', d => d.background_fill)
    .attr('opacity', d => d.background_opacity)
    .attr('d', background)

    container
    .datum(data)
    .append('path')
    .attr('class', 'line')
    .attr('fill', 'none')
    .attr('opacity', d => d[0].opacity)
    .attr('stroke', d => d[0].stroke)
    .attr('stroke-width', d => d[0].stroke_width)
    .attr('d', Line)
}