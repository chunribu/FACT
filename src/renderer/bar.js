import {arc} from 'd3-shape'

const background = arc()
    .innerRadius(d => d.inner_radius)
    .outerRadius(d => d.outer_radius)
    .startAngle(d => d.start_angle)
    .endAngle(d => d.end_angle)

const bar = arc()
    .innerRadius(d => d.inner_radius)
    .outerRadius(d => d.inner_radius + d.radius*(d.outer_radius - d.inner_radius))
    .startAngle(d => d.start_angle)
    .endAngle(d => d.end_angle)

export default function draw_bar(svg, data) {
    const container = svg
    .append('g')
    .attr('class', 'bar')
    // .attr( 'transform',`translate(${width} ${width})` )

    const pieces = container
    .selectAll('g')
    .data(data)
    .enter()

    pieces.append('path')
        .attr('class', 'background')
        .attr('fill', d => d.background_fill)
        .attr('opacity', d => d.background_opacity)
        .attr('d', background)

    pieces.append('path')
        .attr('class', 'bar')
        .attr('fill', d => d.fill)
        .attr('opacity', d => d.opacity)
        .attr('stroke', d => d.stroke)
        .attr('d', bar)

    return container
}
