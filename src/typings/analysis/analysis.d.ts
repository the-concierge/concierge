interface Window {
	Analysis: any;
}

declare module "analysis" {
	export var common: Common;
	export var descriptive: Descriptive;
	export var frequency: Frequency;
	export var distribution: Distribution;
	
	export interface Common {
		round(value: number, decimalPlaces?: number): number;
		toArray(dataset: number[]|{}): number[];
		max(data: number[]|{}): number;
		min(data: number[]|{}): number;
		range(data: number[]|{}): RangeResult;
		validateArray(data: number[]): number[];
		sum(data: number[]|{}): number;
		round(value: number, decimalPlaces?: number): number;
		isNumber(value: any): boolean;
		curry: Curry;
		compose<T>(...functions: Array<ComposeFunction<T>>): ComposeFunction<T>;
		isEven(value: number): boolean;
		sortAsc(data: number[]|{}): number[];
		sortDesc(data: number[]|{}): number[];
		isWhole(value: number): boolean;
		factorial(n: number): number;
	}
	
	export interface Descriptive {
        box(data: number[]|{}): BoxData;
		mean(data: number[]|{}): number;
		median(data: number[]|{}): number;
		mode(data: number[]|{}): number[];
		stdDev(data: number[]|{}): number;
		variance(data: number|{}): number;
		zScore(data: number[]|{}, value: number): number;
		firstQuartile(data: number[]|{}): number;
		thirdQuartile(data: number[]|{}): number;
		interQuartileRange(data: number[]|{}): number;
	}
	
	export interface Distribution {
		chiSquare(observedFreq: number, expectedFreq: number): number;
		poisson(x: number, avgSuccessRate: number): number;
		binomial: Binomial;
	}
	
	interface Binomial {
		table(events: number): Dataset;
		coefficient(events: number, x: number): number;
	}
    
    export interface BoxData {
        mean: number;
        mode: number[];
        median: number;
        range: RangeResult;
        upperQuartile: number;
        lowerQuartile: number;
    }
	
	export interface Set {
		distinct(data: number[]|{}): number[];
		intersect(left: number[]|{}, right: number[]|{}): number[];
		union(left: number[]|{}, right: number[]|{}): number[]
	}

	export interface RangeResult {
		minimum: number;
		maximum: number;
		difference: number;
	}

	export interface Frequency {
		table(data: number[]|{}): Dataset;
		histogram(data: number[]|{}, binSettings?: BinSettings): Dataset;
		relative(data: number[]|{}): Dataset;
	}

	export interface BinSettings {
		binCount?: number;
		binSize?: number;
		minimum?: number;
		maximum?: number;
		difference?: number;
	}
	
	export interface Dataset {
		[index: string]: number;
	}
	
	export interface Curry {
		(fn: Function, ...fnArgs: any[]): (...args: any[]) => any;
		gap: any;
	}
	
	export interface ComposeFunction<T> {
		(...args: any[]): T;
	}
}