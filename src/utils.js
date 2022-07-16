import * as d3 from 'd3'


export function isLeafNode(node) {
    return !_.has(node, "children")
}

export function add_id (root, num=0) {
    root.each(d => {
        d.id = num.toString()
        num++
    })
}

export function maxLength(d) {
    return parseFloat(d.data.attribute) + (d.children ? d3.max(d.children, maxLength) : 0)
}
// export function setColor (d) {
//     d.color = "#1f77b4";
//     if (d.children) d.children.forEach(setColor)
// }
export function polarX (d, start_angle, end_angle) {
    const angle_range = end_angle - start_angle
    d.angle = d.x * angle_range + start_angle
    if (d.children) d.children.forEach(d => polarX(d, start_angle, end_angle))
}
export function polarY(d, cum_depth, k) {
    cum_depth += parseFloat(d.data.attribute)
    d.radius = cum_depth * k
    if (d.children) d.children.forEach(d => polarY(d, cum_depth, k))
}

export const initXY = d3
            .cluster()
            .size([1, 1]) //[max_x, max_y]
            .separation((a, b) => 1)

export function add_angle_and_radius(root, start_angle, end_angle, tree_radius) {
    initXY(root)
    root.data.attribute = 0
    polarX(root, start_angle, end_angle)
    const depth = maxLength(root)
    const k = tree_radius / depth
    polarY(root, 0, k)
}

export function linkStep (startAngle, startRadius, endAngle, endRadius) {
    const c0 = Math.cos(startAngle = startAngle / 180 * Math.PI);
    const s0 = Math.sin(startAngle);
    const c1 = Math.cos(endAngle = endAngle / 180 * Math.PI);
    const s1 = Math.sin(endAngle);
    return "M" + startRadius * c0 + "," + startRadius * s0
        + (endAngle === startAngle ? "" : "A" + startRadius + "," + startRadius + " 0 0 " + (endAngle > startAngle ? 1 : 0) + " " + startRadius * c1 + "," + startRadius * s1)
        + "L" + endRadius * c1 + "," + endRadius * s1;
    }

export function linkExtensionVariable (d) {
    return linkStep(d.angle, d.start_radius, d.angle, d.end_radius);
}

export function linkVariable (d) {
    return linkStep(d.source_angle, d.source_radius, d.target_angle, d.target_radius);
}