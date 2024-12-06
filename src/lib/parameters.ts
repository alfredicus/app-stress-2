import { Data } from "../../../stress/src/lib";
import { CostDomain } from "./CostDomain2D";
import { CostDomain3D } from "./CostDomain3D";
import { CostDomains } from "./CostDomains";
import { Histogram } from "./Histogram";
import { Model } from "./Model";
import { SpherePlot } from "./SpherePlot";
import { ScatterPlot } from "./scatterPlot";

const model = new Model

/**
 * Global parameters
 */
export const parameters = {
    model,
    domain: new CostDomain({div: 'domainDiv', engine: model.engine}),
    domains: new CostDomains({div: 'domainsDiv', engine: model.engine}),
    domain3D: new CostDomain3D({div: 'domain3DDiv', engine: model.engine, n: 20}),
    histogram: new Histogram({div: 'histogramDiv', model, nbBins: 10}),
    scatter: new ScatterPlot({div: 'scatterDiv', model}),
    sphere: new SpherePlot({div: 'sphereDiv', engine: model.engine}),
    setData: (data: Data[]) => {
        parameters.model.addData(data)
    }
}
