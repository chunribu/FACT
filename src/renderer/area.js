import * as d3 from 'd3'

const background = d3.arc()
    .innerRadius(d => d.inner_radius)
    .outerRadius(d => d.outer_radius)
    .startAngle(d => d.start_angle)
    .endAngle(d => d.end_angle)

const Area = d3.areaRadial()
    .angle(d => d.angle)
    .innerRadius(d => d.inner_radius)
    .outerRadius(d => d.inner_radius + d.radius*(d.outer_radius - d.inner_radius))
    .curve(d3.curveLinear)


export default function draw_area(svg, data) {
    const container = svg
    .append('g')
    .attr('class', 'area')
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
    .attr('class', 'area')
    .attr('fill', d => d[0].fill)
    .attr('opacity', d => d[0].opacity)
    .attr('stroke', d => d[0].stroke)
    .attr('stroke-width', d => d[0].stroke_width)
    .attr('d', Area)

    return container
}