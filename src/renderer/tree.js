import {linkExtensionVariable, linkVariable} from '../utils'


function draw_tree_link(tree, data){

    tree
    .append("g")
    .attr('class', 'tree_link')
    .selectAll("path")
    .data(data)
    .join("path")
    // .each(function(d) { d.target.linkNode = this})
    .attr('fill', 'none')
    .attr("stroke", d => d.stroke)
    .attr("d", linkVariable)
}

function draw_tree_link_extension(tree, data) {
    tree
    .append("g")
    .attr('class', 'tree_link_extension')
    .selectAll("path")
    .data(data)
    .join("path")
    .attr("fill", d => d.fill)
    .attr("stroke", d => d.stroke)
    .attr("stroke-opacity", d => d.stroke_opacity)
    // .each(function(d) { d.linkExtensionNode = this})
    .attr("d", d => linkExtensionVariable(d))
}

export default function draw_tree(svg, data) {
    const container = svg
        .append('g')
        .attr('class', 'tree')

        draw_tree_link(container, Object.values(data.links))
        draw_tree_link_extension(container, Object.values(data.link_extensions))
    
    return container
}