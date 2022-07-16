import * as d3 from 'd3'
import {merge} from 'lodash-es'
import parser from './parser'
import { default as default_config } from './config'
import { add_angle_and_radius, add_id } from './utils'
import draw_tree from './renderer/tree'
import draw_bar from './renderer/bar'
import draw_area from './renderer/area'
import draw_line from './renderer/line'


class Core {
    constructor(config={}) {
        this.parser = parser
        this.Config = merge(default_config, config)
        this.Data = {
            tree: {},
            table:{}
        }
        const _width = this.Config.width,
              _height = this.Config.height,
              _container = this.Config.container
        this.svg = d3.select(_container).append('svg')
            .attr("viewBox", [-_width/2, -_height/2, _width, _height])
        return this
    }

    read_tree(str, format='newick') {
        //save info to this.Data
        this.Data.tree.nwk = str
        const parser = this.parser(format)
        const json = parser(str).json
        let root = d3.hierarchy(json).sum(d => d.children ? 0 : 1)
        add_id(root)
        if (this.Config.sort) {
            root = root
                .sort(
                    (a, b) => (a.value - b.value) || 
                    d3.ascending(a.data.length, b.data.length)
                )
        }
        add_angle_and_radius(root, this.Config.start_angle, this.Config.end_angle, this.Config.tree_plot.radius)
        
        this.Data.tree.root = root
        this.Data.tree.links = root.links()
        this.Data.tree.leaves = root.leaves()     

        return this
    }

    read_table(data, _id, name, plot_type='bar', id_column='_d', target_columns='value') {
        console.log(plot_type)
        console.log(arguments)
        this.Data.table[_id] = {
            name: name,
            type: plot_type,
            id_column: id_column,
            target_columns: target_columns.split(','),
            data: {}
        }
        data.forEach(d => {
            this.Data.table[_id]['data'][ d[id_column] ] = d
        })
        return this
    }

    setting(conf) {
        this.Config = merge(this.Config, conf)
        return this
    }

    init_tree_style() {
        //tree link
        this.Data.tree.links.forEach(link => {
            if (!this.Config.tree.links[link.target.id]) {
                this.Config.tree.links[link.target.id] = {}
            }
            this.Config.tree.links[link.target.id]['stroke'] = this.Config.tree_plot.link_stroke
        })
        //tree link extension
        this.Data.tree.leaves.forEach(node => {
            if (!this.Config.tree.link_extensions[node.id]) {
                this.Config.tree.link_extensions[node.id] = {}
            }
            this.Config.tree.link_extensions[node.id]['stroke'] = this.Config.tree_plot.link_ext_stroke
            this.Config.tree.link_extensions[node.id]['fill'] = this.Config.tree_plot.link_ext_fill
            this.Config.tree.link_extensions[node.id]['stroke_opacity'] = this.Config.tree_plot.link_ext_stroke_opacity
        })
        return this
    }

    init_table_style(_id) {
        if (!this.Config.table[_id]) {
            this.Config.table[_id] = {}
        }
        let _radius = this.Config.tree_plot.radius
        for (let i in this.Config.table) {
            if (i !== _id) {
                _radius = _radius < this.Config.table[i].outer_radius ?
                        this.Config.table[i].outer_radius :
                        _radius
            }
        }
        const this_table = this.Config.table[_id]
        this_table['inner_radius'] = _radius
        this_table['outer_radius'] = _radius+50
        Object.keys(this_table['data']).forEach(item => {
            this_table['data'][item]['inner_radius'] = _radius
            this_table['data'][item]['outer_radius'] = _radius+50
        })

        const type = this.Data.table[_id].type
        if (type === 'bar') {
            Object.keys(this_table['data']).forEach(item => {
                Object.keys(this.Config.bar_plot).forEach(key => {
                    this_table['data'][item][key] = this.Config.bar_plot[key]
                })
            })
            
        }else if(type === 'line') {
            Object.keys(this_table['data']).forEach(item => {
                Object.keys(this.Config.line_plot).forEach(key => {
                    this_table['data'][item][key] = this.Config.line_plot[key]
                })
            })
        }else if(type === 'area') {
            Object.keys(this_table['data']).forEach(item => {
                Object.keys(this.Config.area_plot).forEach(key => {
                    this_table['data'][item][key] = this.Config.area_plot[key]
                })
            })
        }else if(type === 'stack') {
            Object.keys(this_table['data']).forEach(item => {
                Object.keys(this.Config.stack_plot).forEach(key => {
                    this_table['data'][item][key] = this.Config.stack_plot[key]
                })
            })
        }else {
            console.error(`Unknown format ${type}`)
        }

        return this
    }

    //update this.Config according to this.Data
    update() {
        //this.Data.tree => this.Config.tree
        const data_links = this.Data.tree.links
        const data_leaves = this.Data.tree.leaves
        const tree_radius = this.Config.tree_plot.radius
        
        // links
        const config_links = this.Config.tree.links
        data_links.forEach(link => {
            if (!config_links[link.target.id]) {
                config_links[link.target.id] = {}
            }
            config_links[link.target.id]['source_angle'] = link.source.angle
            config_links[link.target.id]['source_radius'] = link.source.radius
            config_links[link.target.id]['target_angle'] = link.target.angle
            config_links[link.target.id]['target_radius'] = link.target.radius
        })
        // link extensions
        const config_link_exts = this.Config.tree.link_extensions
        data_leaves.forEach(node => {
            if (!config_link_exts[node.id]) {
                config_link_exts[node.id] = {}
            }
            config_link_exts[node.id]['angle'] = node.angle,
            config_link_exts[node.id]['start_radius'] = node.radius,
            config_link_exts[node.id]['end_radius'] = tree_radius
        })


        //this.Data.table => this.Config.table
        const data_table = this.Data.table
        const config_table = this.Config.table
        
        const per_leaf_angle = (this.Config.end_angle - this.Config.start_angle) / data_leaves.length / 180 * Math.PI
        let axis_start, axis_end, target_col;
        for (let i in data_table) {
            console.log(i)
            if (!config_table[i]){
                config_table[i] = {data: {}}
            }
            config_table[i]['name'] = data_table[i].name
            config_table[i]['type'] = data_table[i].type

            if (['line','area','bar'].indexOf(config_table[i].type) > -1) {
                target_col = data_table[i]['target_columns'][0]

                if (config_table[i]['axis_start']) {
                    axis_start = config_table[i]['axis_start']
                }else{
                    axis_start = 0
                    config_table[i]['axis_start'] = axis_start
                }
                if (config_table[i]['axis_end']) {
                    axis_end = config_table[i]['axis_end']
                }else{
                    axis_end = Math.max(...(Object.values(data_table[i]['data']).map(d => d[target_col])))
                    config_table[i]['axis_end'] = axis_end
                }

                data_leaves.forEach(node => {
                    if (!config_table[i]['data'][node.id]) {
                        config_table[i]['data'][node.id] = {}
                    }
                    config_table[i]['data'][node.id]['id'] = node.id
                    config_table[i]['data'][node.id]['angle'] = node.angle / 180 * Math.PI + Math.PI/2
                    config_table[i]['data'][node.id]['start_angle'] = node.angle/180*Math.PI - per_leaf_angle/2 + Math.PI/2
                    config_table[i]['data'][node.id]['end_angle'] = node.angle/180*Math.PI + per_leaf_angle/2 + Math.PI/2
                    config_table[i]['data'][node.id]['radius'] = (data_table[i]['data'][node.data.name][target_col] - axis_start) / (axis_end - axis_start)
                    // config_table[i]['data'][node.id]['inner_radius'] = ''
                    // config_table[i]['data'][node.id]['outer_radius'] = ''
                    //transfer to init_table_style()
                })
            }
            else if (config_table[i].type === 'stack') {

            }
            else {
                console.log(`Unknown plot type: ${config_table[i].type}`)
            }
        }
        return this
    }

    render(_id='tree'){
        if (_id === 'tree') {
            d3.select('.tree').remove()
            draw_tree(this.svg, this.Config.tree)
        }
        else {
            const this_table = this.Config.table[_id]
            const type = this_table.type
            const leaves = this.Data.tree.leaves
            d3.select(`#${_id}`).remove()
            if (type === 'bar') {
                draw_bar(this.svg, Object.values(this_table.data))
            }else if (type === 'area') {
                draw_area(this.svg, leaves.map(n => this_table.data[n.id]))
            }else if (type === 'line') {
                console.log('plot in order:', leaves.map(n => n.id))
                draw_line(this.svg, leaves.map(n => this_table.data[n.id]))
            }else if (type === 'stack') {
                //
            }else {
                console.error(`Can't render #${_id}`)
            }
        }
        return this
    }
    
}

export default Core