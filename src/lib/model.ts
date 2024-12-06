import { eigen } from '@youwol/math'
import { trimAll, DataFactory, Data, InverseMethod, MisfitCriteriunSolution, MonteCarlo } from '../../../stress/src/lib'
import { parameters } from './parameters'

export class Model {
    private inv: InverseMethod = undefined
    private solution: MisfitCriteriunSolution = undefined

    constructor() {
        this.inv = new InverseMethod()
    }

    get data() {
        return this.inv.data
    }

    get engine() {
        return this.inv.engine
    }

    addData(data: Data[]) {
        this.inv.addData(data)
    }

    addDataFromBuffer(arrayBuffer: ArrayBuffer) {
        let buffer = new TextDecoder().decode(arrayBuffer)
        const lines = buffer.split('\n')
        buffer = buffer.substring(buffer.indexOf('\n') + 1)

        let ok = true
        const datas: Data[] = []

        for (let i = 1; i < lines.length; ++i) {
            const line = trimAll(lines[i].trim())
            if (line.length === 0) {
                continue
            }

            let toks = line.split(';').map(s => s.replace(',', '.'))
            if (toks.length === 0) {
                continue
            }
            toks = toks.map(tok => trimAll(tok))

            const data = DataFactory.create(toks[1])

            if (data === undefined) {
                document.getElementById("info").innerHTML = `<p>Unknown data type "${toks[1]}" for data id ${toks[0]}</p>
                <br>
                Original file:
                <textarea style="width: 100%" cols="50" rows="10" class="numbered">${buffer}</textarea>`
                continue
            }

            const result = data.initialize([toks])
            if (result.status === false) {
                ok = false
                let t = ''
                result.messages.forEach((msg: string) => t += `<p>${msg}</p>`)
                document.getElementById("info").innerHTML = t
            }
            else {
                datas.push(data)
            }
        }

        if (ok) {
            document.getElementById("logs").innerHTML = `<p>Loaded ${datas.length} data</p>`
            this.addData(datas) // i.e., in this.inv
            parameters.domain.setData(datas)
            parameters.domains.setData(datas)
            parameters.domain3D.setData(datas)
        }
    }

    setNbIter(n: number) {
        const method = this.inv.searchMethod as MonteCarlo
        method.setNbIter(n)
    }

    run() {
        this.solution = this.inv.run()
        this.displayResults(this.solution)
        parameters.histogram.generate()
    }

    updateDomain() {
        parameters.domain.generate()
    }

    updateDomains() {
        parameters.domains.generate()
    }

    clear() {
        console.log('clearing the model')
        this.inv.clearData()
    }

    getMisfitAngles(): number[] {
        this.inv.engine.setHypotheticalStress(this.solution.rotationMatrixW, this.solution.stressRatio)
        const s = this.inv.engine.stress([0, 0, 0])
        return this.inv.data.map(d => d.predict({ stress: s }) * 180 / Math.PI)
    }

    displayResults(solution: MisfitCriteriunSolution) {
        this.inv.engine.setHypotheticalStress(solution.rotationMatrixW, solution.stressRatio)
        const s = this.inv.engine.stress([0, 0, 0])
        

        const stress = solution.stressTensorSolution
        const eig = eigen([stress[0][0], stress[0][1], stress[0][2], stress[1][1], stress[1][2], stress[2][2]])

        const data = []
        this.inv.data.forEach((d, index) => {
            const m = d.predict({ stress: s }) * 180 / Math.PI
            data.push([d.toks[0], d.toks[1], m.toFixed(1)])
        })

        document.getElementById("table").innerHTML = ''

        const gridjs = window['gridjs']
        const table = new gridjs.Grid({
            columns: ["Data index", "Data type", "Mistfit (°)"],
            data,
            pagination: true,
            style: {
                table: {
                    border: '3px solid #ccc'
                },
                th: {
                    'background-color': 'rgba(0, 0, 0, 0.1)',
                    color: '#000',
                    'border-bottom': '3px solid #ccc',
                    'text-align': 'center'
                },
                td: {
                    'text-align': 'center'
                }
            }
        })
        table.render(document.getElementById("table"))

        document.getElementById("result").innerHTML = `<h3>Inversion results</h3>
            <table>
                <tbody>
                    
                    <tr>
                        <td>Mean misfit angle</td>
                        <td><code>${(solution.misfit*180/Math.PI).toFixed(2)}°</code></td>
                    </tr>
                    <tr>
                        <td>R</td>
                        <td><code>${solution.stressRatio.toFixed(2)}</code></td>
                    </tr>
                </tbody>
            </table><br/>
            <div>
                <math>
                    <mrow>
                        <mo>&sigma; =</mo>
                        <mo>[</mo>
                        <mtable>
                            <mtr>
                                <mtd><mn>${stress[0][0].toFixed(3)}</mn></mtd>
                                <mtd><mn>${stress[0][1].toFixed(3)}</mn></mtd>
                                <mtd><mn>${stress[0][2].toFixed(3)}</mn></mtd>
                            </mtr>
                            
                            <mtr>
                                <mtd><mn>${stress[1][0].toFixed(3)}</mn></mtd>
                                <mtd><mn>${stress[1][1].toFixed(3)}</mn></mtd>
                                <mtd><mn>${stress[1][2].toFixed(3)}</mn></mtd>
                            </mtr>
                            
                            <mtr>
                                <mtd><mn>${stress[2][0].toFixed(3)}</mn></mtd>
                                <mtd><mn>${stress[2][1].toFixed(3)}</mn></mtd>
                                <mtd><mn>${stress[2][2].toFixed(3)}</mn></mtd>
                            </mtr>
                        </mtable>
                        <mo>]</mo>
                    </mrow>
                </math>
            </div>
            <br>
            &sigma;1 = [${eig.vectors[6].toFixed(3)}, ${eig.vectors[7].toFixed(3)}, ${eig.vectors[8].toFixed(3)}]
            <br>
            &sigma;2 = [${eig.vectors[3].toFixed(3)}, ${eig.vectors[4].toFixed(3)}, ${eig.vectors[5].toFixed(3)}]
            <br>
            &sigma;3 = [${eig.vectors[0].toFixed(3)}, ${eig.vectors[1].toFixed(3)}, ${eig.vectors[2].toFixed(3)}]
            <br><br>
            &sigma;1 = [${-eig.values[2].toFixed(3)}]
            <br>
            &sigma;2 = [${-eig.values[1].toFixed(3)}]
            <br>
            &sigma;3 = [${-eig.values[0].toFixed(3)}]
            </div>`

        /*
        document.getElementById("info").innerHTML = `<div>
            
            
        </div>`
        */
    }
}
