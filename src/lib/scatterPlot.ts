// import Plotly from 'plotly.js' // !!!!!!!!! DOES not work
import Plotly from 'plotly.js/dist/plotly'
import { Model } from './Model'

export class ScatterPlot {
    private div = ''
    private model: Model = undefined
    private size = 2

    constructor({ div, model }: { div: string, model: Model }) {
        this.model = model
        this.div = div
    }

    setSize(s: number) {
        this.size = s
    }

    generate() {
        const values = this.model.getMisfitAngles()

        const x = []
        const y = []
        let xmin = Number.POSITIVE_INFINITY
        let xmax = Number.NEGATIVE_INFINITY
        let ymin = Number.POSITIVE_INFINITY
        let ymax = Number.NEGATIVE_INFINITY
        this.model.data.forEach(d => {
            x.push(d.position[0])
            y.push(d.position[1])
            if (d.position[0] < xmin) xmin = d.position[0]
            if (d.position[0] > xmax) xmax = d.position[0]
            if (d.position[1] < ymin) ymin = d.position[1]
            if (d.position[1] > ymax) ymax = d.position[1]
        })
        const w = xmax - xmin
        const h = ymax - ymin
        const ratio = h / w

        const trace = {
            x,
            y,
            mode: 'markers',
            type: 'scatter',
            colorbar: {
                thickness: 30,
                title: 'Cost',
                titleside: 'right',
                titlefont: {
                    size: 14,
                    family: 'Arial, sans-serif'
                }
            },
            marker: {
                size: 5,
                color: values,
                colorscale: 'Portland',
                colorbar: {
                    tick0: 0,
                    dtick: 1
                },
                symbol: 'circle'
            }
        } as Partial<Plotly.PlotData>

        const layout = {
            title: 'Scatter',
            width: 500,
            height: 500*ratio
        }

        Plotly.newPlot(this.div, [trace], layout, { responsive: true })

        const observer = new ResizeObserver(_ => Plotly.Plots.resize(document.getElementById(this.div)))
        observer.observe(document.getElementById(this.div))
    }
}

export function scatterPlot(
    { div, x, y, data, width = 500, height = 500, markerSize = 5, colorScale = 'Portland' }:
        { div: string, x: number[], y: number[], data: number[], width?: number, height?: number, markerSize?: number, colorScale?: string }) {
    const trace = {
        x,
        y,
        mode: 'markers',
        type: 'scatter',
        colorbar: {
            thickness: 30,
            title: 'Cost',
            titleside: 'right',
            titlefont: {
                size: 14,
                family: 'Arial, sans-serif'
            }
        },
        marker: {
            size: markerSize,
            color: data,
            colorscale: colorScale,
            colorbar: {
                tick0: 0,
                dtick: 1
            },
            symbol: 'square'
        }
    } as Partial<Plotly.PlotData>

    const layout = {
        title: 'Domain',
        width,
        height,
        // paper_bgcolor: "rgba(0,0,0,0", //background color of the chart container space
        // plot_bgcolor: "rgba(0,0,0,0)", //background color of plot area
    }

    Plotly.newPlot(div, [trace], layout, { responsive: true })

    const observer = new ResizeObserver(_ => Plotly.Plots.resize(document.getElementById(div)))
    observer.observe(document.getElementById(div))

    // symbols = 'circle', 'diamond', 'square', 'triangle-up' ...
}
