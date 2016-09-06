import moment = require("moment");
var c3 = require("c3");
import $ = require("jquery");

function toTime(timestamp: number): string {
    return moment(timestamp).format("HH:mm:ss");
}

export function teardown() {
    cpuChart = null;
    memoryChart = null;
}

export function load(stats: Concierge.Stats[]) {
    var x = ["x"].concat(stats.map<any>(s=> moment(s.timestamp).format("DD/MMM HH:mm:ss")));
    var cpuMeans = ["Cpu Mean"].concat(stats.map<any>(s => round(s.cpu.mean)));
    var memMeans = ["Mem Mean"].concat(stats.map<any>(s => round(s.memory.mean)));
    var responses = ["Ping"].concat(stats.map<any>(s => s.responseTime));
    var cpuHighs = ["Cpu High"].concat(stats.map<any>(s => s.cpu.range.maximum));
    var cpuLows = ["Cpu Low"].concat(stats.map<any>(s => s.cpu.range.minimum));
    var memHighs = ["Mem High"].concat(stats.map<any>(s => s.memory.range.maximum));
    var memLows = ["Mem Low"].concat(stats.map<any>(s => s.memory.range.minimum));

    var columns = [
        cpuMeans,
        memMeans,
        responses,
        cpuHighs,
        cpuLows,
        memHighs,
        memLows
    ];

    c3.generate({
        bindto: "#chart",
        data: {
            columns,
            type: "line",
            types: {
                "Cpu High": "scatter",
                "Cpu Low": "scatter",
                "Mem High": "scatter",
                "Mem Low": "scatter"
            },
            colors: {
                "Cpu High": "#006699",
                "Cpu Low": "#006699",
                "Mem High": "#996600",
                "Mem Low": "#996600",
                "Cpu Mean": "blue",
                "Mem Mean": "red",
                "Ping": "green"
            },
            axes: {
                "Ping": "y2",
                "Cpu Mean": "y",
                "Cpu High": "y",
                "Cpu Low": "y",
                "Mem Mean": "y",
                "Mem High": "y",
                "Mem Low": "y"
            }
        },
        axis: {
            y: { label: "Percent", max: 100 },
            y2: {
                label: "Milliseconds",
                show: true
            }
        },
        tooltip: {
            format: {
                title: d => x[d+1]
            }
        },
        zoom: {
            enabled: true
        },
        subchart: {
            show: true
        }
    });
}


export function updateCpu(value: number) {
    var columns = [["CPU", value]];
    if (!cpuChart) {
        cpuChart = c3.generate({
            bindto: "#chart-cpu",
            data: { columns, type: "gauge" },
            color: gaugeColor,
            size: gaugeSize
        });
    }
    else cpuChart.load({ columns });
}

export function updateMemory(value: number) {
    var columns = [["Memory", value]];
    if (!memoryChart) {
        memoryChart = c3.generate({
            bindto: "#chart-memory",
            data: { columns, type: "gauge" },
            color: gaugeColor,
            size: gaugeSize
        });
    }
    else memoryChart.load({ columns });
}

var gaugeColor = {
    pattern: ["#FF0000", "#F97600", "#F6C600", "#60B044"].reverse(),
    threshold: {
        values: [25, 50, 75, 100]
    }
}

var gaugeSize = {
    height: 100
}

var cpuChart;
var memoryChart;

function round(value: number, decimalPlaces?: number) {
    decimalPlaces = Math.round(decimalPlaces) || 0;
    var noDecimalPlaces = decimalPlaces === 0;

    if (noDecimalPlaces) return Math.round(value);

    var multiplier = Math.pow(10, decimalPlaces);

    return Math.round(value * multiplier) / multiplier;
}


